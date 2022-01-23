export function chunk<T = unknown>(arr: T[], size = 1) {
  return Array.from({length: Math.ceil(arr.length / size)}, (_, i) =>
    arr.slice(i * size, (i + 1) * size),
  )
}
