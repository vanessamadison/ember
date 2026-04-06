import type { FromRadioMessage } from './meshtasticCodec';

export interface FromRadioDigest {
  lines: string[];
  nodeNum: number | null;
}

/** One-line summaries per message; keep UI/log-friendly (no secrets). */
export function digestFromRadioMessages(
  messages: FromRadioMessage[],
  expectedConfigId?: number
): FromRadioDigest {
  let nodeNum: number | null = null;
  const lines: string[] = [];

  for (const m of messages) {
    const v = m.payloadVariant;
    switch (v.case) {
      case 'myInfo': {
        nodeNum = v.value.myNodeNum;
        const env = v.value.pioEnv?.trim() || '?';
        lines.push(
          `MyNode num=${v.value.myNodeNum} nodedb=${v.value.nodedbCount} env=${env}`
        );
        break;
      }
      case 'configCompleteId': {
        const ok =
          expectedConfigId !== undefined && v.value === expectedConfigId;
        lines.push(`ConfigComplete id=${v.value}${ok ? ' (matches)' : ''}`);
        break;
      }
      case 'nodeInfo':
        lines.push(`NodeInfo num=${v.value.num}`);
        break;
      case 'config':
        lines.push('Device config (protobuf)');
        break;
      case 'moduleConfig':
        lines.push('Module config (protobuf)');
        break;
      case 'packet': {
        const p = v.value;
        const dest = p.to === 0xffffffff ? 'broadcast' : `to ${p.to}`;
        lines.push(`Packet from=${p.from} ${dest}`);
        break;
      }
      case 'logRecord': {
        const msg = v.value.message?.slice(0, 96) ?? '';
        lines.push(`Log ${msg}`);
        break;
      }
      case 'rebooted':
        lines.push('Rebooted');
        break;
      default:
        if (v.case) lines.push(String(v.case));
        break;
    }
  }

  return { lines, nodeNum };
}
