import { rngItem, Seed } from './seed'

const botNames = [
  'Bottenberger',
  'Botzilla69',
  'BotimusPrime',
  'DrBotson',
  'BotMarley420',
  'SirBotsAlot',
  'TheBotfather',
]

export const getBotName = ({ seed }: { seed: Seed }) => {
  return rngItem({ seed, items: botNames })
}
