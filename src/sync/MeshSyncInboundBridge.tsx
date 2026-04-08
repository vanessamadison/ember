import { useEffect } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { subscribeEmberMeshInbound } from '../mesh/emberMeshInbound';
import { useMeshRadioStore } from '../mesh/meshRadioStore';
import { mergeFromEmberMeshEnvelopeForCommunity } from './meshInboundMerge';

/**
 * Subscribes to EMBER mesh envelopes and merges Phase B bundles when the fingerprint
 * matches the active Watermelon community id and crypto can decrypt.
 */
export function MeshSyncInboundBridge() {
  const { communityId } = useCommunity();

  useEffect(() => {
    return subscribeEmberMeshInbound((envelope) => {
      void mergeFromEmberMeshEnvelopeForCommunity(envelope, communityId).then(
        (r) => {
          const at = Date.now();
          if (r.ok) {
            useMeshRadioStore.getState().setMeshInboundLast({
              at,
              ok: true,
              membersInserted: r.membersInserted,
              checkInsInserted: r.checkInsInserted,
              emergencyPlansInserted: r.emergencyPlansInserted,
              messagesInserted: r.messagesInserted,
              drillsInserted: r.drillsInserted,
            });
          } else if (
            r.reason !== 'fingerprint_mismatch' &&
            r.reason !== 'no_community'
          ) {
            useMeshRadioStore.getState().setMeshInboundLast({
              at,
              ok: false,
              reason: r.reason,
              detail: r.detail,
            });
          }
          if (
            typeof __DEV__ !== 'undefined' &&
            __DEV__ &&
            !r.ok &&
            r.reason !== 'fingerprint_mismatch' &&
            r.reason !== 'no_community'
          ) {
            console.warn('[mesh→sync]', r.reason, r.detail ?? '');
          }
        }
      );
    });
  }, [communityId]);

  return null;
}
