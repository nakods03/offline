export function createHash() { return { update: () => ({ digest: () => new Uint8Array(32) }) } as any }
