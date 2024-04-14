import { fetchWikipedia } from '@/functions/fetchWikipedia.function'
import { teampilotFunctionHandler } from '@teampilot/sdk'

export const { GET, POST } = teampilotFunctionHandler({
  functions: [fetchWikipedia],
})
