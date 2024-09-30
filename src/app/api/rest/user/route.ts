import {
  authenticateWithApiKey,
  getMyUserFromApiKeyOrThrow,
} from '@/auth/getMyUserFromApiKey'

export async function GET(req: Request) {
  const user = await authenticateWithApiKey(req)

  return Response.json(user)
}
