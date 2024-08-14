import { Amatic_SC, Comfortaa, Indie_Flower } from 'next/font/google'

export const fontHeading = Amatic_SC({ weight: '700', subsets: ['latin'] })
export const fontLore = Indie_Flower({ weight: '400', subsets: ['latin'] })
export const fontBody = Comfortaa({
  weight: ['400', '700'],
  subsets: ['latin'],
})
