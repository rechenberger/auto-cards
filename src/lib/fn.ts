export const fn = <T>(fn: () => T): T => {
  return fn()
}
