import { TeampilotCustomFunction } from '@teampilot/sdk'
import { z } from 'zod'

const inputSchema = z.object({
  articleName: z.string(),
})

export const fetchWikipedia: TeampilotCustomFunction<typeof inputSchema> = {
  nameForAI: 'fetchWikipediaArticle',
  descriptionForAI: 'Fetches a Wikipedia article',
  inputSchema,
  execute: async ({ input }) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${input.articleName}`

    const response = await fetch(url, {
      headers: {
        'Api-User-Agent': 'Example/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = await response.json()
    const data = z
      .object({
        query: z.object({
          pages: z.record(
            z.object({
              extract: z.string(),
            }),
          ),
        }),
      })
      .parse(json)

    const pages = data.query.pages
    const page = Object.values(pages)[0]
    const output = page?.extract

    return {
      output,
    }
  },
}
