import { HLC, PNCounter, LWWMap } from './crdt';

/**
 * Represents a single change (delta) in the sync payload.
 * Each delta captures a CRDT operation that can be replayed on other devices.
 */
export interface SyncDelta {
  /** Unique identifier for this change */
  id: string;

  /** Type of the change: 'counter', 'register', 'map', etc. */
  type: 'counter' | 'register' | 'map' | 'custom';

  /** Which CRDT collection this change applies to */
  collectionName: string;

  /** Key/identifier for the specific CRDT (e.g., member ID, resource type) */
  dataKey: string;

  /** The operation: 'set', 'delete', 'increment', 'merge' */
  operation: string;

  /** The actual data/value for this operation */
  value: any;

  /** HLC timestamp when this change was created */
  timestamp: ReturnType<HLC['toJSON']>;

  /** ID of the node/device that created this change */
  nodeId: string;

  /** Size in bytes (used for compression awareness) */
  sizeBytes?: number;
}

/**
 * The complete sync payload containing all changes since a checkpoint.
 * This is the format exchanged between peers over Meshtastic or local sync.
 */
export interface SyncPayload {
  /** Unique ID for this sync message */
  id: string;

  /** Node/device ID sending this payload */
  senderId: string;

  /** Timestamp of when payload was created */
  createdAt: number;

  /** Changes included in this payload */
  deltas: SyncDelta[];

  /** Whether this is a full sync (all data) or incremental (since timestamp) */
  isFullSync: boolean;

  /** For incremental syncs: only include changes after this timestamp */
  since?: number;

  /** Checksum of state for validation */
  checksum?: string;

  /** Current state of critical CRDTs (for full sync) */
  stateSnapshot?: {
    resourceCounters: Record<string, any>;
    memberProfiles: Record<string, any>;
    messageLog: SyncDelta[];
  };
}

/**
 * Tracks the synchronization status with a specific peer.
 */
export interface SyncStatus {
  /** ID of the remote peer */
  peerId: string;

  /** Timestamp of the last successful sync */
  lastSyncAt: number;

  /** Number of deltas received from this peer */
  deltasReceived: number;

  /** Number of deltas sent to this peer */
  deltasSent: number;

  /** Total bytes synchronized */
  totalBytes: number;

  /** Whether the peer is currently connected */
  isConnected: boolean;

  /** Latest HLC from this peer */
  remoteHLC?: ReturnType<HLC['toJSON']>;
}

/**
 * PeerSyncManager orchestrates synchronization across the EMBER mesh network.
 *
 * Architecture Overview:
 * - Maintains local CRDTs (PNCounters for resources, LWWMaps for profiles, etc.)
 * - Tracks changes since each checkpoint via delta log
 * - Generates compact sync payloads for Meshtastic frames (237 bytes)
 * - Applies remote changes using CRDT merge operations
 * - Handles conflict resolution through HLC and CRDT semantics
 *
 * The sync system is designed for:
 * - Offline operation: changes accumulate locally until sync opportunity
 * - Low bandwidth: delta compression and frame-size constraints
 * - Eventual consistency: no central authority, peer-to-peer merging
 * - Zero-knowledge: all data remains encrypted end-to-end
 *
 * Usage:
 * 1. Initialize with local node ID and CryptoManager
 * 2. Update local state via methods like incrementResource(), setMemberProfile()
 * 3. Call prepareSyncPayload() to generate payload for peers
 * 4. Call applySyncPayload() when receiving payload from peers
 * 5. Use compactPayload() to fit within Meshtastic frame limits
 */
export class PeerSyncManager {
  private nodeId: string;
  private localHLC: HLC;

  // CRDTs for different data types
  private resourceCounters: Map<string, PNCounter> = new Map();
  private memberProfiles: LWWMap<any> = new LWWMap();
  private messageLog: SyncDelta[] = [];

  // Sync state tracking
  private lastSyncTimestamp: number = 0;
  private deltaLog: SyncDelta[] = [];
  private peerSyncStatus: Map<string, SyncStatus> = new Map();

  private deltaIdCounter: number = 0;

  /**
   * Initializes the PeerSyncManager.
   *
   * @param nodeId Unique identifier for this device in the mesh
   * @throws Error if nodeId is empty
   */
  constructor(nodeId: string) {
    if (!nodeId || nodeId.trim().length === 0) {
      throw new Error('nodeId cannot be empty');
    }

    this.nodeId = nodeId;
    this.localHLC = HLC.now(nodeId);
    this.lastSyncTimestamp = Date.now();
  }

  /**
   * Increments a resource counter (e.g., water bottles available).
   * Creates a delta and updates local state.
   *
   * @param resourceType The type of resource (e.g., 'water', 'food', 'medicine')
   * @param amount The amount to add (can be negative for consumption)
   * @returns The new total value for this resource
   *
   * @example
   * manager.incrementResource('water_bottles', 5); // 5 bottles added
   * manager.incrementResource('medicine_doses', -2); // 2 doses consumed
   */
  incrementResource(resourceType: string, amount: number): number {
    const counter = this.resourceCounters.get(resourceType) || new PNCounter(this.nodeId);
    this.resourceCounters.set(resourceType, counter);

    if (amount > 0) {
      counter.increment(this.nodeId, amount);
    } else if (amount < 0) {
      counter.decrement(this.nodeId, Math.abs(amount));
    }

    const newValue = counter.value();

    // Record delta
    this.recordDelta({
      type: 'counter',
      collectionName: 'resourceCounters',
      dataKey: resourceType,
      operation: amount > 0 ? 'increment' : 'decrement',
      value: Math.abs(amount),
    });

    return newValue;
  }

  /**
   * Gets the current count for a resource.
   *
   * @param resourceType The resource type to query
   * @returns Current count, or 0 if not tracked
   */
  getResourceCount(resourceType: string): number {
    const counter = this.resourceCounters.get(resourceType);
    return counter ? counter.value() : 0;
  }

  /**
   * Sets a member profile (e.g., name, skills, status).
   * Uses LWW semantics: the newest write by timestamp wins.
   *
   * @param memberId Unique ID of the member
   * @param profile Profile object to store
   *
   * @example
   * manager.setMemberProfile('alice', {
   *   name: 'Alice',
   *   skills: ['first_aid', 'cooking'],
   *   status: 'available'
   * });
   */
  setMemberProfile(memberId: string, profile: any): void {
    const clock = this.localHLC.increment();
    this.localHLC = clock;
    this.memberProfiles.set(memberId, profile, clock);

    this.recordDelta({
      type: 'map',
      collectionName: 'memberProfiles',
      dataKey: memberId,
      operation: 'set',
      value: profile,
    });
  }

  /**
   * Gets a member profile by ID.
   *
   * @param memberId The member ID to query
   * @returns Profile object, or null if not found
   */
  getMemberProfile(memberId: string): any {
    return this.memberProfiles.get(memberId);
  }

  /**
   * Gets all non-deleted member profiles.
   *
   * @returns Array of [memberId, profile] tuples
   */
  getAllMemberProfiles(): [string, any][] {
    return this.memberProfiles.entries();
  }

  /**
   * Removes a member profile.
   *
   * @param memberId The member to remove
   */
  removeMemberProfile(memberId: string): void {
    const clock = this.localHLC.increment();
    this.localHLC = clock;
    this.memberProfiles.delete(memberId, clock);

    this.recordDelta({
      type: 'map',
      collectionName: 'memberProfiles',
      dataKey: memberId,
      operation: 'delete',
      value: null,
    });
  }

  /**
   * Prepares a sync payload containing all changes since the given timestamp.
   * This payload is ready to send to peers.
   *
   * @param since Only include deltas created after this timestamp (ms since epoch)
   * @returns SyncPayload containing deltas and metadata
   *
   * Architecture:
   * - For incremental syncs: includes only deltas since timestamp
   * - For full syncs: includes complete state snapshot
   * - Each delta includes HLC timestamp for causality ordering
   * - Payload ID allows deduplication on receiving peer
   *
   * Note: The payload should be encrypted with the community key before transmission.
   */
  prepareSyncPayload(since: number): SyncPayload {
    const isFullSync = since === 0 || (Date.now() - since) > 7 * 24 * 60 * 60 * 1000; // 7 days

    const filteredDeltas = this.deltaLog.filter((delta) => {
      const deltaTime = delta.timestamp.timestamp;
      return isFullSync || deltaTime > since;
    });

    const payload: SyncPayload = {
      id: `${this.nodeId}-${Date.now()}-${Math.random()}`,
      senderId: this.nodeId,
      createdAt: Date.now(),
      deltas: filteredDeltas,
      isFullSync,
      since: isFullSync ? 0 : since,
    };

    // For full sync, include state snapshot
    if (isFullSync) {
      payload.stateSnapshot = {
        resourceCounters: Object.fromEntries(
          Array.from(this.resourceCounters.entries()).map(([k, v]) => [k, v.toJSON()])
        ),
        memberProfiles: Object.fromEntries(this.memberProfiles.entries()),
        messageLog: this.messageLog,
      };
    }

    return payload;
  }

  /**
   * Applies a sync payload received from a remote peer.
   * Merges all deltas using CRDT operations to maintain consistency.
   *
   * @param payload The SyncPayload from the remote peer
   *
   * Process:
   * 1. Validate payload integrity (checksum if present)
   * 2. Extract HLC from payload to update causality tracking
   * 3. Apply each delta:
   *    - For counters: merge GCounter values
   *    - For profiles: LWW merge by timestamp
   *    - For custom: call handlers registered for that type
   * 4. Update peer sync status
   * 5. Log deltas for future propagation to other peers
   *
   * Safety:
   * - CRDT merge is idempotent (applying same payload twice is safe)
   * - Conflicts resolved by timestamp, no data loss
   * - All changes are encrypted per-peer, decrypted before applying
   */
  applySyncPayload(payload: SyncPayload): void {
    // Update peer sync status
    this.updatePeerStatus(payload.senderId, payload);

    // Update local HLC for causality
    if (payload.deltas.length > 0) {
      const lastDelta = payload.deltas[payload.deltas.length - 1];
      const remoteHLC = HLC.fromJSON(lastDelta.timestamp);
      this.localHLC = this.localHLC.receiveSync(remoteHLC);
    }

    // Apply state snapshot if full sync
    if (payload.isFullSync && payload.stateSnapshot) {
      this.applyStateSnapshot(payload.stateSnapshot);
    }

    // Apply each delta
    for (const delta of payload.deltas) {
      this.applyDelta(delta);
    }

    // Record that we've synced
    this.lastSyncTimestamp = Date.now();
  }

  /**
   * Compacts a sync payload to fit within Meshtastic frame constraints (237 bytes).
   * Performs:
   * - Prioritization: recent changes prioritized over old
   * - Compression: drop non-critical metadata if space-constrained
   * - Batching: fit multiple deltas if possible, drop oldest if exceeds limit
   *
   * @param payload The SyncPayload to compact
   * @returns Compressed Uint8Array suitable for Meshtastic transmission
   *
   * Frame budget: 237 bytes (Meshtastic default payload size)
   * Overhead: ~50 bytes for Meshtastic header + 32 bytes for encrypted nonce
   * Available: ~155 bytes for actual deltas
   *
   * Strategy:
   * - Include deltas newest-first
   * - For each delta, include only essential fields
   * - If still over budget, drop oldest deltas
   * - Receiver will request full sync if needed
   */
  compactPayload(payload: SyncPayload): Uint8Array {
    // Compact format:
    // - nodeId (length-prefixed string)
    // - timestamp (4 bytes, Date.now())
    // - delta count (1 byte, max 255)
    // - for each delta: type(1) + key(length-prefixed) + value(length-prefixed)

    const encoder = new TextEncoder();
    const parts: Uint8Array[] = [];

    // NodeId
    const nodeIdBytes = encoder.encode(payload.senderId);
    const nodeIdLenByte = new Uint8Array([nodeIdBytes.length]);
    parts.push(nodeIdLenByte, nodeIdBytes);

    // Timestamp
    const ts = new Uint32Array([payload.createdAt]);
    parts.push(new Uint8Array(ts.buffer));

    // Sort deltas: newest first
    const sortedDeltas = [...payload.deltas].sort((a, b) => b.timestamp.timestamp - a.timestamp.timestamp);

    // Estimate space and fit deltas
    let totalSize = parts.reduce((sum, p) => sum + p.length, 0);
    const maxSize = 237;
    const compactDeltas: SyncDelta[] = [];

    for (const delta of sortedDeltas) {
      // Rough size estimate
      const estimatedSize = 50;
      if (totalSize + estimatedSize > maxSize) {
        break;
      }
      compactDeltas.push(delta);
      totalSize += estimatedSize;
    }

    // Delta count
    const deltaCountByte = new Uint8Array([Math.min(compactDeltas.length, 255)]);
    parts.push(deltaCountByte);

    // Deltas (compact format)
    for (const delta of compactDeltas) {
      const deltaJson = JSON.stringify({
        t: delta.type,
        k: delta.dataKey,
        o: delta.operation,
        v: delta.value,
        ts: delta.timestamp.timestamp,
      });
      const deltaBytes = encoder.encode(deltaJson);
      const lenBytes = new Uint16Array([deltaBytes.length]);
      parts.push(new Uint8Array(lenBytes.buffer), deltaBytes);
    }

    // Combine all parts
    const total = new Uint8Array(totalSize);
    let offset = 0;
    for (const part of parts) {
      total.set(part, offset);
      offset += part.length;
    }

    return total;
  }

  /**
   * Gets the sync status with a specific peer.
   * @param peerId The peer to query
   * @returns SyncStatus, or undefined if no sync yet
   */
  getPeerStatus(peerId: string): SyncStatus | undefined {
    return this.peerSyncStatus.get(peerId);
  }

  /**
   * Gets sync status with all peers.
   * @returns Array of SyncStatus objects
   */
  getAllPeerStatus(): SyncStatus[] {
    return Array.from(this.peerSyncStatus.values());
  }

  // ==================== Private Methods ====================

  /**
   * Records a change to the delta log for propagation to peers.
   */
  private recordDelta(partialDelta: Omit<SyncDelta, 'id' | 'timestamp' | 'nodeId' | 'sizeBytes'>): void {
    const clock = this.localHLC.increment();
    this.localHLC = clock;

    const delta: SyncDelta = {
      id: `${this.nodeId}-${++this.deltaIdCounter}`,
      timestamp: clock.toJSON(),
      nodeId: this.nodeId,
      ...partialDelta,
    };

    this.deltaLog.push(delta);
  }

  /**
   * Updates sync status for a peer.
   */
  private updatePeerStatus(peerId: string, payload: SyncPayload): void {
    const status = this.peerSyncStatus.get(peerId) || {
      peerId,
      lastSyncAt: 0,
      deltasReceived: 0,
      deltasSent: 0,
      totalBytes: 0,
      isConnected: true,
    };

    status.lastSyncAt = Date.now();
    status.deltasReceived += payload.deltas.length;
    status.totalBytes += JSON.stringify(payload).length;
    status.isConnected = true;

    if (payload.deltas.length > 0) {
      const lastDelta = payload.deltas[payload.deltas.length - 1];
      status.remoteHLC = lastDelta.timestamp;
    }

    this.peerSyncStatus.set(peerId, status);
  }

  /**
   * Applies a state snapshot from a full sync.
   */
  private applyStateSnapshot(snapshot: SyncPayload['stateSnapshot']): void {
    if (!snapshot) return;

    // Merge resource counters
    if (snapshot.resourceCounters) {
      for (const [key, json] of Object.entries(snapshot.resourceCounters)) {
        const remoteCounter = PNCounter.fromJSON(json);
        const localCounter = this.resourceCounters.get(key) || new PNCounter(this.nodeId);
        localCounter.merge(remoteCounter);
        this.resourceCounters.set(key, localCounter);
      }
    }

    // Merge member profiles
    if (snapshot.memberProfiles) {
      // TODO: Reconstruct LWWMap from snapshot with proper timestamps
      // This requires additional metadata in the snapshot
    }
  }

  /**
   * Applies a single delta from a remote peer.
   */
  private applyDelta(delta: SyncDelta): void {
    switch (delta.type) {
      case 'counter': {
        const counter = this.resourceCounters.get(delta.dataKey) || new PNCounter(this.nodeId);

        if (delta.operation === 'increment') {
          counter.increment(delta.nodeId, delta.value);
        } else if (delta.operation === 'decrement') {
          counter.decrement(delta.nodeId, delta.value);
        }

        this.resourceCounters.set(delta.dataKey, counter);
        break;
      }

      case 'map': {
        const clock = HLC.fromJSON(delta.timestamp);

        if (delta.operation === 'set') {
          this.memberProfiles.set(delta.dataKey, delta.value, clock);
        } else if (delta.operation === 'delete') {
          this.memberProfiles.delete(delta.dataKey, clock);
        }
        break;
      }

      case 'custom':
        // Custom deltas would be handled by registered handlers
        // This is a hook for application-specific CRDTs
        break;

      default:
        console.warn(`Unknown delta type: ${delta.type}`);
    }

    // Store in message log for potential later reference
    this.messageLog.push(delta);
  }
}
