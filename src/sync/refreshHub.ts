type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeCommunityDataRefresh(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyCommunityDataChanged(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('[ember] refresh listener failed', e);
    }
  });
}
