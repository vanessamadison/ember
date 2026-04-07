/**
 * Ordered Meshtastic client handshake over {@link MeshtasticBleBridge}.
 * Implements config request + FromRadio draining; does not interpret mesh traffic for EMBER auth.
 */
import type { MeshtasticBleBridge } from './meshtasticBleBridge';
import {
  EMBER_MESH_INTER_CHUNK_DELAY_MS,
  EMBER_MESH_MAX_CHUNK_PAYLOAD,
  EMBER_MESH_MAX_CIPHERTEXT,
} from './emberMeshConstants';
import { buildEmberMeshEnvelopeV2Chunk } from './emberMeshEnvelope';
import {
  encodeEmberMeshDataPacketToRadio,
  encodeEmberMeshWireBytesToRadio,
} from './emberMeshPacket';
import {
  encodeWantConfigId,
  MESHTASTIC_MAX_STREAM_BUFFER,
  parseFromRadioStream,
  type FromRadioMessage,
} from './meshtasticCodec';

export interface HandshakeStats {
  configId: number;
  fromRadioMessages: FromRadioMessage[];
}

function randomMeshTransferId(): bigint {
  const u = new Uint8Array(8);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(u);
  } else {
    for (let i = 0; i < 8; i++) {
      u[i] = Math.floor(Math.random() * 256);
    }
  }
  return new DataView(u.buffer, u.byteOffset, 8).getBigUint64(0, false);
}

function delayMs(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class MeshtasticSession {
  private incoming = new Uint8Array(0);
  private configSeq = 1;

  constructor(private readonly bridge: MeshtasticBleBridge) {}

  nextConfigId(): number {
    this.configSeq = (this.configSeq % 0xffff_ffff) + 1;
    return this.configSeq;
  }

  /**
   * Read FromRadio until the mailbox is empty (one burst). Does not send ToRadio.
   * Use after {@link MeshtasticBleBridge.monitorFromNum} or to poll.
   */
  async drainFromRadioMailbox(): Promise<FromRadioMessage[]> {
    const fromRadioMessages: FromRadioMessage[] = [];
    for (;;) {
      const chunk = await this.bridge.readFromRadio();
      if (chunk == null || chunk.length === 0) break;
      if (this.incoming.length + chunk.length > MESHTASTIC_MAX_STREAM_BUFFER) {
        this.incoming = new Uint8Array(0);
        throw new Error('Meshtastic: incoming stream buffer overflow; reset');
      }
      const merged = new Uint8Array(this.incoming.length + chunk.length);
      merged.set(this.incoming, 0);
      merged.set(chunk, this.incoming.length);
      const { messages, remainder } = parseFromRadioStream(merged);
      this.incoming = remainder;
      fromRadioMessages.push(...messages);
    }
    return fromRadioMessages;
  }

  /**
   * Send want_config and read until mailbox empty once (call repeatedly + FromNum for full sync).
   */
  async requestConfigAndDrainOnce(configId?: number): Promise<HandshakeStats> {
    const id = configId ?? this.nextConfigId();
    const body = encodeWantConfigId(id);
    await this.bridge.writeToRadioProtobuf(body);
    const fromRadioMessages = await this.drainFromRadioMailbox();
    return { configId: id, fromRadioMessages };
  }

  /** Clear partially assembled stream (e.g. after disconnect). */
  resetStream(): void {
    this.incoming = new Uint8Array(0);
  }

  /**
   * Send one mesh-bound EMBER ciphertext inside Meshtastic Data + MeshPacket (broadcast).
   * Caller must complete config handshake first.
   */
  async sendEmberMeshCiphertext(
    fingerprint16: Uint8Array,
    ciphertext: Uint8Array
  ): Promise<void> {
    const body = encodeEmberMeshDataPacketToRadio(fingerprint16, ciphertext);
    await this.bridge.writeToRadioProtobuf(body);
  }

  /**
   * Send UTF-8 bytes of the Phase B bundle base64 string. Uses v1 single frame when short enough;
   * otherwise v2 chunked envelopes with an optional delay between ATT writes.
   */
  async sendEmberMeshMessageUtf8(
    fingerprint16: Uint8Array,
    messageUtf8: Uint8Array,
    options?: {
      interChunkDelayMs?: number;
      /** After each ToRadio write: 1-based index and total chunks (single-frame sends use 1/1). */
      onChunkProgress?: (sentOneIndexed: number, totalChunks: number) => void;
    }
  ): Promise<void> {
    const progress = options?.onChunkProgress;
    if (messageUtf8.length <= EMBER_MESH_MAX_CIPHERTEXT) {
      await this.sendEmberMeshCiphertext(fingerprint16, messageUtf8);
      progress?.(1, 1);
      return;
    }
    const inter =
      options?.interChunkDelayMs ?? EMBER_MESH_INTER_CHUNK_DELAY_MS;
    const transferId = randomMeshTransferId();
    const max = EMBER_MESH_MAX_CHUNK_PAYLOAD;
    const totalChunks = Math.ceil(messageUtf8.length / max);
    for (let i = 0; i < totalChunks; i++) {
      const slice = messageUtf8.subarray(i * max, (i + 1) * max);
      const wire = buildEmberMeshEnvelopeV2Chunk(
        fingerprint16,
        transferId,
        i,
        totalChunks,
        slice
      );
      const body = encodeEmberMeshWireBytesToRadio(wire);
      await this.bridge.writeToRadioProtobuf(body);
      progress?.(i + 1, totalChunks);
      if (i + 1 < totalChunks && inter > 0) {
        await delayMs(inter);
      }
    }
  }
}
