/**
 * CRDT (Conflict-free Replicated Data Type) implementations for offline-first
 * conflict resolution in the EMBER app's peer sync system.
 *
 * These data structures allow devices to make changes independently and
 * automatically resolve conflicts when syncing without central coordination.
 */

/**
 * Hybrid Logical Clock (HLC) combines physical time with a logical counter
 * and node ID to provide total ordering of events across distributed systems.
 *
 * Structure: [timestamp_ms] + [logical_counter] + [node_id]
 */
export class HLC {
  public timestamp: number; // milliseconds since epoch
  public logicalCounter: number; // increments when timestamp doesn't advance
  public nodeId: string; // unique identifier for this node/device

  constructor(timestamp: number = Date.now(), logicalCounter: number = 0, nodeId: string = '') {
    this.timestamp = timestamp;
    this.logicalCounter = logicalCounter;
    this.nodeId = nodeId;
  }

  /**
   * Creates a new HLC value based on the current time and a given node ID.
   * @param nodeId Unique identifier for this node
   * @returns New HLC instance
   */
  static now(nodeId: string): HLC {
    return new HLC(Date.now(), 0, nodeId);
  }

  /**
   * Receives an external HLC and returns a new HLC that happens-after both.
   * Used when processing remote changes.
   * @param remote Remote HLC value
   * @returns New HLC that is causally after both this and remote
   */
  receiveSync(remote: HLC): HLC {
    const now = Date.now();
    const maxTs = Math.max(this.timestamp, remote.timestamp, now);
    let newLogical = 0;

    if (maxTs === now && now > this.timestamp && now > remote.timestamp) {
      newLogical = 0;
    } else if (maxTs === this.timestamp && maxTs > remote.timestamp) {
      newLogical = this.logicalCounter + 1;
    } else if (maxTs === remote.timestamp && maxTs > this.timestamp) {
      newLogical = remote.logicalCounter + 1;
    } else if (maxTs === this.timestamp && maxTs === remote.timestamp) {
      newLogical = Math.max(this.logicalCounter, remote.logicalCounter) + 1;
    }

    return new HLC(maxTs, newLogical, this.nodeId);
  }

  /**
   * Increments the HLC when the same node creates another event.
   * @returns New HLC with incremented counter
   */
  increment(): HLC {
    const now = Date.now();
    if (now > this.timestamp) {
      return new HLC(now, 0, this.nodeId);
    }
    return new HLC(this.timestamp, this.logicalCounter + 1, this.nodeId);
  }

  /**
   * Compares two HLCs for ordering.
   * @param other The other HLC to compare
   * @returns -1 if this < other, 0 if equal, 1 if this > other
   */
  compare(other: HLC): number {
    if (this.timestamp !== other.timestamp) {
      return this.timestamp < other.timestamp ? -1 : 1;
    }
    if (this.logicalCounter !== other.logicalCounter) {
      return this.logicalCounter < other.logicalCounter ? -1 : 1;
    }
    return this.nodeId.localeCompare(other.nodeId);
  }

  /**
   * Serializes the HLC to JSON format.
   */
  toJSON(): { timestamp: number; logicalCounter: number; nodeId: string } {
    return {
      timestamp: this.timestamp,
      logicalCounter: this.logicalCounter,
      nodeId: this.nodeId,
    };
  }

  /**
   * Deserializes an HLC from JSON format.
   */
  static fromJSON(data: { timestamp: number; logicalCounter: number; nodeId: string }): HLC {
    return new HLC(data.timestamp, data.logicalCounter, data.nodeId);
  }
}

/**
 * GCounter (Grow-only Counter) is a CRDT that only allows increments.
 * Each node maintains its own counter, and the total value is the sum of all nodes.
 * Useful for monotonic metrics like message count, event count, etc.
 */
export class GCounter {
  private counters: Map<string, number> = new Map();

  constructor(nodeId: string) {
    this.counters.set(nodeId, 0);
  }

  /**
   * Increments the counter for this node.
   * @param nodeId The node to increment
   * @param amount The amount to increment by (default 1)
   */
  increment(nodeId: string, amount: number = 1): void {
    const current = this.counters.get(nodeId) || 0;
    this.counters.set(nodeId, current + amount);
  }

  /**
   * Gets the current value of the counter (sum of all node counters).
   */
  value(): number {
    let sum = 0;
    for (const count of this.counters.values()) {
      sum += count;
    }
    return sum;
  }

  /**
   * Merges another GCounter into this one, taking the maximum value for each node.
   * @param remote The remote GCounter to merge
   */
  merge(remote: GCounter): void {
    for (const [nodeId, remoteCount] of remote.counters.entries()) {
      const localCount = this.counters.get(nodeId) || 0;
      this.counters.set(nodeId, Math.max(localCount, remoteCount));
    }
  }

  /**
   * Serializes the GCounter to JSON format.
   */
  toJSON(): { counters: Record<string, number> } {
    return {
      counters: Object.fromEntries(this.counters),
    };
  }

  /**
   * Deserializes a GCounter from JSON format.
   */
  static fromJSON(data: { counters: Record<string, number> }): GCounter {
    const counter = new GCounter('');
    counter.counters.clear();
    for (const [nodeId, value] of Object.entries(data.counters)) {
      counter.counters.set(nodeId, value);
    }
    return counter;
  }
}

/**
 * PNCounter (Positive-Negative Counter) is a CRDT that allows both increments and decrements.
 * Internally uses two GCounters: one for increments and one for decrements.
 * Useful for resource tracking where items can be added and consumed.
 */
export class PNCounter {
  private positive: GCounter;
  private negative: GCounter;

  constructor(nodeId: string) {
    this.positive = new GCounter(nodeId);
    this.negative = new GCounter(nodeId);
  }

  /**
   * Increments (adds to) the counter.
   * @param nodeId The node making the increment
   * @param amount The amount to add (default 1)
   */
  increment(nodeId: string, amount: number = 1): void {
    this.positive.increment(nodeId, amount);
  }

  /**
   * Decrements (subtracts from) the counter.
   * @param nodeId The node making the decrement
   * @param amount The amount to subtract (default 1)
   */
  decrement(nodeId: string, amount: number = 1): void {
    this.negative.increment(nodeId, amount);
  }

  /**
   * Gets the current value (positive total - negative total).
   */
  value(): number {
    return this.positive.value() - this.negative.value();
  }

  /**
   * Merges another PNCounter into this one.
   * @param remote The remote PNCounter to merge
   */
  merge(remote: PNCounter): void {
    this.positive.merge(remote.positive);
    this.negative.merge(remote.negative);
  }

  /**
   * Serializes the PNCounter to JSON format.
   */
  toJSON(): {
    positive: { counters: Record<string, number> };
    negative: { counters: Record<string, number> };
  } {
    return {
      positive: this.positive.toJSON(),
      negative: this.negative.toJSON(),
    };
  }

  /**
   * Deserializes a PNCounter from JSON format.
   */
  static fromJSON(data: {
    positive: { counters: Record<string, number> };
    negative: { counters: Record<string, number> };
  }): PNCounter {
    const counter = new PNCounter('');
    counter.positive = GCounter.fromJSON(data.positive);
    counter.negative = GCounter.fromJSON(data.negative);
    return counter;
  }
}

/**
 * LWWRegister (Last-Writer-Wins Register) is a CRDT that stores a single value.
 * When conflicts occur, the value with the higher timestamp wins.
 * If timestamps are equal, node ID is used as a tiebreaker.
 */
export class LWWRegister<T> {
  private value: T | null = null;
  private clock: HLC;

  constructor(initialValue: T | null = null, clock: HLC = new HLC(0, 0, '')) {
    this.value = initialValue;
    this.clock = clock;
  }

  /**
   * Sets the value of the register with the given clock.
   * @param newValue The new value to set
   * @param clock The HLC timestamp of this write
   */
  set(newValue: T, clock: HLC): void {
    // Only update if the new clock is strictly greater
    if (clock.compare(this.clock) > 0) {
      this.value = newValue;
      this.clock = new HLC(clock.timestamp, clock.logicalCounter, clock.nodeId);
    }
  }

  /**
   * Gets the current value of the register.
   */
  get(): T | null {
    return this.value;
  }

  /**
   * Merges another LWWRegister into this one, keeping the value with the highest clock.
   * @param remote The remote register to merge
   */
  merge(remote: LWWRegister<T>): void {
    if (remote.clock.compare(this.clock) > 0) {
      this.value = remote.value;
      this.clock = new HLC(
        remote.clock.timestamp,
        remote.clock.logicalCounter,
        remote.clock.nodeId
      );
    }
  }

  /**
   * Gets the clock (timestamp) of the last write.
   */
  getClock(): HLC {
    return this.clock;
  }

  /**
   * Serializes the register to JSON format.
   */
  toJSON(): { value: T | null; clock: ReturnType<HLC['toJSON']> } {
    return {
      value: this.value,
      clock: this.clock.toJSON(),
    };
  }

  /**
   * Deserializes a register from JSON format.
   */
  static fromJSON<T>(data: { value: T | null; clock: any }): LWWRegister<T> {
    const clock = HLC.fromJSON(data.clock);
    return new LWWRegister<T>(data.value, clock);
  }
}

/**
 * LWWMap (Last-Writer-Wins Map) is a CRDT that stores multiple key-value pairs.
 * Each value is a LWWRegister, so conflicts are resolved by timestamp.
 * Keys can be removed by marking them as tombstoned with a timestamp.
 */
export class LWWMap<T> {
  private registers: Map<string, LWWRegister<T>> = new Map();
  private tombstones: Map<string, HLC> = new Map();

  /**
   * Sets a key-value pair with the given timestamp.
   * @param key The key to set
   * @param value The value to set
   * @param clock The HLC timestamp of this write
   */
  set(key: string, value: T, clock: HLC): void {
    const register = this.registers.get(key) || new LWWRegister<T>();
    register.set(value, clock);
    this.registers.set(key, register);

    // Remove tombstone if this write is newer
    const tombstone = this.tombstones.get(key);
    if (!tombstone || clock.compare(tombstone) > 0) {
      this.tombstones.delete(key);
    }
  }

  /**
   * Gets a value by key, or null if the key doesn't exist or is tombstoned.
   * @param key The key to retrieve
   */
  get(key: string): T | null {
    const tombstone = this.tombstones.get(key);
    const register = this.registers.get(key);

    if (!register) {
      return null;
    }

    // If there's a tombstone newer than the register, the key is deleted
    if (tombstone && tombstone.compare(register.getClock()) > 0) {
      return null;
    }

    return register.get();
  }

  /**
   * Removes a key by marking it with a tombstone at the given timestamp.
   * @param key The key to remove
   * @param clock The HLC timestamp of this deletion
   */
  delete(key: string, clock: HLC): void {
    const register = this.registers.get(key);
    const currentTombstone = this.tombstones.get(key);

    // Update tombstone if this deletion is newer
    if (!currentTombstone || clock.compare(currentTombstone) > 0) {
      this.tombstones.set(key, clock);
    }

    // If the register exists, only keep it if deletion is not newer
    if (!register || !currentTombstone || clock.compare(register.getClock()) > 0) {
      // Deletion wins, so we could clear the register, but we keep it for reference
      // The get() method will respect the tombstone
    }
  }

  /**
   * Gets all non-deleted keys.
   */
  keys(): string[] {
    const result: string[] = [];
    for (const key of this.registers.keys()) {
      if (this.get(key) !== null) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Gets all non-deleted key-value pairs.
   */
  entries(): [string, T][] {
    const result: [string, T][] = [];
    for (const key of this.registers.keys()) {
      const value = this.get(key);
      if (value !== null) {
        result.push([key, value]);
      }
    }
    return result;
  }

  /**
   * Gets the number of non-deleted entries.
   */
  size(): number {
    return this.keys().length;
  }

  /**
   * Merges another LWWMap into this one.
   * @param remote The remote map to merge
   */
  merge(remote: LWWMap<T>): void {
    // Merge all registers
    for (const [key, remoteRegister] of remote.registers.entries()) {
      const localRegister = this.registers.get(key) || new LWWRegister<T>();
      localRegister.merge(remoteRegister);
      this.registers.set(key, localRegister);
    }

    // Merge all tombstones
    for (const [key, remoteTombstone] of remote.tombstones.entries()) {
      const localTombstone = this.tombstones.get(key);
      if (!localTombstone || remoteTombstone.compare(localTombstone) > 0) {
        this.tombstones.set(key, remoteTombstone);
      }
    }
  }

  /**
   * Serializes the map to JSON format.
   */
  toJSON(): {
    registers: Record<string, ReturnType<LWWRegister<T>['toJSON']>>;
    tombstones: Record<string, any>;
  } {
    const registersJson: Record<string, any> = {};
    for (const [key, register] of this.registers.entries()) {
      registersJson[key] = register.toJSON();
    }

    const tombstonesJson: Record<string, any> = {};
    for (const [key, tombstone] of this.tombstones.entries()) {
      tombstonesJson[key] = tombstone.toJSON();
    }

    return {
      registers: registersJson,
      tombstones: tombstonesJson,
    };
  }

  /**
   * Deserializes a map from JSON format.
   */
  static fromJSON<T>(data: {
    registers: Record<string, any>;
    tombstones: Record<string, any>;
  }): LWWMap<T> {
    const map = new LWWMap<T>();

    for (const [key, registerData] of Object.entries(data.registers)) {
      map.registers.set(key, LWWRegister.fromJSON<T>(registerData));
    }

    for (const [key, tombstoneData] of Object.entries(data.tombstones)) {
      map.tombstones.set(key, HLC.fromJSON(tombstoneData));
    }

    return map;
  }
}
