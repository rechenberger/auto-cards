import { capitalCase } from 'change-case'

export const getItemAiImagePrompt = ({ name }: { name: string }) => {
  return `Crazy scary image of ${capitalCase(
    name,
  )}. Halloween theme. Use Flux Schnell and make the image square.`
}
