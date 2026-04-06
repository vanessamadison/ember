/**
 * Ordered Meshtastic client handshake over {@link MeshtasticBleBridge}.
 * Implements config request + FromRadio draining; does not interpret mesh traffic for EMBER auth.
 */
import type { MeshtasticBleBridge } from './meshtasticBleBridge';
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
}
