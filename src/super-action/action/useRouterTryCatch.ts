import { useRouter } from 'next/router'

export const useRouterTryCatch = () => {
  try {
    return useRouter()
  } catch (error) {
    return undefined
  }
}
