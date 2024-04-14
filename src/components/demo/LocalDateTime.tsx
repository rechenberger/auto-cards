'use client'

export const LocalDateTime = ({ datetime }: { datetime: string }) => {
  const date = new Date(datetime)
  return <>{date.toLocaleString('de')}</>
}
