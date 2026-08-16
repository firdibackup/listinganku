/** Id berprefiks supaya mudah dibaca saat men-debug isi .data/store.json. */
export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
