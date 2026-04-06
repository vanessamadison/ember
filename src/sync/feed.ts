import { Q } from '@nozbe/watermelondb';
import type { Subscription } from 'rxjs';
import { database } from '../db';

/**
 * Fires when members or check_ins change for a community (WatermelonDB observation).
 * Use to debounce relay push in a future auto-sync loop.
 */
export function observeMembersCheckInsForCommunity(
  communityId: string,
  onChange: () => void
): () => void {
  const members$ = database
    .get('members')
    .query(Q.where('community_id', communityId))
    .observe();
  const checks$ = database
    .get('check_ins')
    .query(Q.where('community_id', communityId))
    .observe();

  const subs: Subscription[] = [];
  subs.push(members$.subscribe({ next: onChange }));
  subs.push(checks$.subscribe({ next: onChange }));

  return () => {
    subs.forEach((s) => s.unsubscribe());
  };
}
