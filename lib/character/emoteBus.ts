type Handler = (id: string) => void;

const listeners = new Set<Handler>();

export function requestEmote(id: string) {
  listeners.forEach((fn) => fn(id));
}

export function subscribeEmote(fn: Handler) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
