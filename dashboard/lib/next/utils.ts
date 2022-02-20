export type RequestQuery = Partial<Record<string, string | string[]>>

export function getQueryFirst(
  queryObj: RequestQuery,
  key: string,
): string | undefined {
  const entry = queryObj[key]
  if (Array.isArray(entry)) {
    return entry[0]
  }
  return entry
}
