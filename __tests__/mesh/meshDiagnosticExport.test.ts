import { buildMeshDiagnosticText } from '../../src/mesh/meshDiagnosticExport';

describe('buildMeshDiagnosticText', () => {
  it('includes header and digest lines', () => {
    const text = buildMeshDiagnosticText({
      digestLines: ['line1', 'line2'],
      uiLogLineCap: 14,
      meshBleStateLabel: 'On',
      platform: 'ios',
      connectedDeviceId: 'dev-1',
      nodeNum: 42,
      interChunkDelayMs: 300,
      meshInboundLast: null,
      meshLastBroadcastOutbound: null,
      meshError: null,
      meshLastTxHex: null,
      meshInboundNote: null,
    });
    expect(text).toContain('EMBER mesh diagnostic export');
    expect(text).toContain('Bluetooth: On');
    expect(text).toContain('line1');
    expect(text).toContain('line2');
  });
});
