// TODO (Sprint 1+): register one factory per domain as real query hooks land, e.g.
//
// export const classesKeys = queryKeysFactory('classes');
//
// producing `.all` / `.lists()` / `.list(query)` / `.details()` / `.detail(id)`. No domain needs
// this yet in Sprint 0 — kept as a placeholder so the pattern has a home once auth/classes wire up.

export function queryKeysFactory(domain: string) {
  return {
    all: [domain] as const,
    lists: () => [domain, 'list'] as const,
    list: (query: unknown) => [domain, 'list', query] as const,
    details: () => [domain, 'detail'] as const,
    detail: (id: string) => [domain, 'detail', id] as const,
  };
}
