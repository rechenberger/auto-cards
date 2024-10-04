import { getAllItems } from '@/game/allItems'

export async function GET(req: Request) {
  try {
    const items = await getAllItems()

    return Response.json({
      items: items.map((i) => i.name),
    })
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
