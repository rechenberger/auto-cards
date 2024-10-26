export const rndFloat = ({
  rnd,
  min = 0,
  max = 1,
}: {
  rnd: number
  min?: number
  max?: number
}) => {
  return rnd * (max - min) + min
}

export const rndInt = ({
  rnd,
  min = 0,
  max,
}: {
  rnd: number
  min?: number
  max: number
}) => {
  return Math.floor(rnd * (max - min + 1)) + min
}
