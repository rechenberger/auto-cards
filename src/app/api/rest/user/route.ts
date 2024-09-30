import { authenticateWithApiKey } from '@/auth/getMyUserFromApiKey'

export async function GET(req: Request) {
  try {
    const user = await authenticateWithApiKey(req)

    return Response.json(user)
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
