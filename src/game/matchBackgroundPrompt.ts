import {
  getThemeDefinition,
  IMAGE_MODEL_PROMPT,
  PLACEHOLDER_ITEM_PROMPT,
  ThemeId,
} from './themes'

export const getMatchBackgroundPrompt = ([leftThemeId, rightThemeId]: [
  ThemeId,
  ThemeId,
]) => {
  const themePrompts = [leftThemeId, rightThemeId]
    .map(getThemeDefinition)
    .map((theme) =>
      theme.prompt
        .replace(PLACEHOLDER_ITEM_PROMPT, 'world')
        .replace(IMAGE_MODEL_PROMPT, ''),
    )

  return `Generate an image of two merging worlds. (Smooth Transition in the middle)

The left side:
${themePrompts[0]}
Color this side blue.

The right side:
${themePrompts[1]}
Color this side red.

Make the two world merge into each other in the middle.
Maybe a world is trying to break through the other world.
Maybe there is a trail or river connecting the two worlds.

Use Flux Schnell and make it 16:9 aspect ratio.`
}
