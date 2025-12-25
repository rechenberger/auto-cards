import { createGateway, GatewayModelId } from 'ai'

/**
 * Vercel AI Gateway configuration
 *
 * Environment variables:
 * - VERCEL_AI_GATEWAY_API_KEY: Required. Your Vercel AI Gateway API key.
 * - AI_PLAYTEST_MODEL: Optional. Default model for AI playtesting (e.g., "google/gemini-3-flash").
 *   Defaults to "google/gemini-3-flash" if not set.
 */

const DEFAULT_MODEL: GatewayModelId = 'google/gemini-3-flash'

/**
 * Get the configured AI Gateway API key
 */
export function getAiGatewayApiKey(): string {
  const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY
  if (!apiKey) {
    throw new Error(
      'VERCEL_AI_GATEWAY_API_KEY environment variable is required for AI features',
    )
  }
  return apiKey
}

/**
 * Get the configured model for AI playtesting
 */
export function getAiPlaytestModel(): GatewayModelId {
  const model = process.env.AI_PLAYTEST_MODEL as GatewayModelId | undefined
  return model ?? DEFAULT_MODEL
}

/**
 * Create a Vercel AI Gateway provider instance
 */
export function createAiGateway() {
  return createGateway({
    apiKey: getAiGatewayApiKey(),
  })
}

/**
 * Get a language model from the AI Gateway for the configured playtest model
 */
export function getAiPlaytestLanguageModel() {
  const gateway = createAiGateway()
  const modelId = getAiPlaytestModel()
  return gateway.languageModel(modelId)
}

/**
 * Default generation settings for AI playtest operations
 */
export const defaultGenerationSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  // Disable retries at the provider level - we handle retries in the runner
  maxRetries: 0,
} as const

/**
 * Generation settings for structured output (action decisions)
 * Lower temperature for more consistent, predictable outputs
 */
export const structuredOutputSettings = {
  temperature: 0.3,
  maxTokens: 1024,
  maxRetries: 0,
} as const

/**
 * Generation settings for creative outputs (reports, suggestions)
 * Higher temperature for more varied, creative responses
 */
export const creativeOutputSettings = {
  temperature: 0.8,
  maxTokens: 4096,
  maxRetries: 0,
} as const
