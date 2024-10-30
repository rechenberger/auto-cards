export const promiseSeqMap = async <T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
) => {
  const results: R[] = []
  for (const item of items) {
    results.push(await fn(item))
  }
  return results
}
