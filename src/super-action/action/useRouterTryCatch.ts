import { useRouter } from 'next/navigation'

export const useRouterTryCatch = () => {
  try {
    return useRouter()
  } catch (error) {
    return undefined
  }
}
