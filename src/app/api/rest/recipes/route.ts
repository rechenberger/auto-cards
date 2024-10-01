import { getCraftingRecipes } from '@/game/craftingRecipes'

export async function GET(req: Request) {
  try {
    const recipes = await getCraftingRecipes()

    return Response.json({
      recipes: recipes.map((i) => i.id),
    })
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message }, { status: 400 })
    }
    return Response.json({ error: 'Unknown error' }, { status: 500 })
  }
}
