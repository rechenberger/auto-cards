export const decodePlaygroundQuery = (q: string) => {
  return q
    .split('~')
    .map((side) => side.split(','))
    .map((side) =>
      side.map((item) => {
        const [count, name] = item.split(':')
        return {
          name,
          count: Number(count),
        }
      }),
    )
}

export const encodePlaygroundQuery = (
  sides: { name: string; count?: number }[][],
) => {
  return sides
    .map((side) =>
      side.map((item) => `${item.count ?? 1}:${item.name}`).join(','),
    )
    .join('~')
}

export const playgroundHref = (sides: { name: string; count?: number }[][]) => {
  return `/playground?q=${encodePlaygroundQuery(sides)}`
}
