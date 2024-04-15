import { getMyUserOrLogin } from '@/auth/getMyUser'
import { SimpleDataCard } from '@/components/simple/SimpleDataCard'

export default async function Page() {
  const user = await getMyUserOrLogin()

  return <SimpleDataCard data={user} />
}
