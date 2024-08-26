import { atom } from 'jotai'

const checkIfLocalStorageAccessible = () => {
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    return true
  } catch (e) {
    return false
  }
}

// FROM: https://jotai.org/docs/guides/persistence#a-helper-function-with-localstorage-and-json-parse
export const atomWithLocalStorage = <T>(key: string, initialValue: T) => {
  const getInitialValue = () => {
    if (
      typeof localStorage === 'undefined' ||
      !checkIfLocalStorageAccessible()
    ) {
      return initialValue
    }

    const item = localStorage.getItem(key)
    if (item !== null) {
      return JSON.parse(item) as T
    }
    return initialValue
  }
  const baseAtom = atom(getInitialValue())
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue =
        typeof update === 'function' ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)
      localStorage.setItem(key, JSON.stringify(nextValue))
    },
  )
  return derivedAtom
}

export const enableStreamingAtom = atomWithLocalStorage('enableStreaming', true)
export const showPricesAtom = atomWithLocalStorage(
  'experimentalShowPrices',
  false,
)
export const lastTeamSlugVisitedAtom = atomWithLocalStorage(
  'lastTeamSlugVisited',
  '',
)
