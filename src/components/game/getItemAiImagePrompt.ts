import { capitalCase } from 'change-case'

export const getItemAiImagePrompt = ({ name }: { name: string }) => {
  return `Cartoony cozy Image of ${capitalCase(
    name,
  )}. Background is a sunny track trough the mountains or woods whatever fits.`
}
