import {
  STREAM_START1,
  STREAM_START2,
  frameProtobufPayload,
  unframeMeshtasticStream,
} from '../../src/mesh/streamFraming';

describe('streamFraming', () => {
  it('frameProtobufPayload prepends header and length', () => {
    const body = new Uint8Array([0x01, 0x02, 0x03]);
    const framed = frameProtobufPayload(body);
    expect(framed[0]).toBe(STREAM_START1);
    expect(framed[1]).toBe(STREAM_START2);
    expect(framed[2]).toBe(0);
    expect(framed[3]).toBe(3);
    expect(Array.from(framed.subarray(4))).toEqual([1, 2, 3]);
  });

  it('rejects oversize protobuf', () => {
    const big = new Uint8Array(65536);
    expect(() => frameProtobufPayload(big)).toThrow(/exceeds 16-bit/);
  });

  it('unframeMeshtasticStream extracts one packet', () => {
    const payload = new Uint8Array([9, 9, 9]);
    const framed = frameProtobufPayload(payload);
    const { packets, remainder } = unframeMeshtasticStream(framed);
    expect(packets.length).toBe(1);
    expect(Array.from(packets[0]!)).toEqual([9, 9, 9]);
    expect(remainder.length).toBe(0);
  });

  it('unframeMeshtasticStream keeps incomplete tail in remainder', () => {
    const framed = frameProtobufPayload(new Uint8Array([1]));
    const partial = framed.subarray(0, framed.length - 1);
    const { packets, remainder } = unframeMeshtasticStream(partial);
    expect(packets.length).toBe(0);
    expect(remainder.length).toBeGreaterThan(0);
  });

  it('ignores start sequence when declared length exceeds 512', () => {
    const bad = new Uint8Array([STREAM_START1, STREAM_START2, 0x03, 0x00]); // len 768
    const good = frameProtobufPayload(new Uint8Array([7]));
    const buf = new Uint8Array(bad.length + good.length);
    buf.set(bad, 0);
    buf.set(good, bad.length);
    const { packets, remainder } = unframeMeshtasticStream(buf);
    expect(packets.length).toBe(1);
    expect(Array.from(packets[0]!)).toEqual([7]);
    expect(remainder.length).toBe(0);
  });

  it('parses two consecutive frames', () => {
    const a = frameProtobufPayload(new Uint8Array([1]));
    const b = frameProtobufPayload(new Uint8Array([2, 3]));
    const buf = new Uint8Array(a.length + b.length);
    buf.set(a, 0);
    buf.set(b, a.length);
    const { packets, remainder } = unframeMeshtasticStream(buf);
    expect(packets.map((p) => Array.from(p))).toEqual([[1], [2, 3]]);
    expect(remainder.length).toBe(0);
  });
});
