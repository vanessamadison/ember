import {
  buildEncryptedMembersCheckInsBundle,
  decryptMembersCheckInsBundleJson,
} from './snapshot';
import { mergeMembersCheckInsPayload, type MergePhaseBResult } from './merge';

export async function exportMembersCheckInsSneakerBase64(
  communityId: string
): Promise<string> {
  return buildEncryptedMembersCheckInsBundle(communityId);
}

export async function importMembersCheckInsSneakerBase64(
  ciphertextBase64: string
): Promise<MergePhaseBResult> {
  const trimmed = ciphertextBase64.trim();
  const payload = decryptMembersCheckInsBundleJson(trimmed);
  return mergeMembersCheckInsPayload(payload);
}
