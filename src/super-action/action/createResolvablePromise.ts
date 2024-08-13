export function createResolvablePromise<T = any>() {
  let resolve: (value: T) => void, reject: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  }
}
