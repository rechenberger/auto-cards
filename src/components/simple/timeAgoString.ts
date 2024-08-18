import {
  differenceInDays,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInSeconds,
  isToday,
  isYesterday,
} from 'date-fns'
import humanizeDuration from 'humanize-duration'

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'min',
      s: () => 's',
      ms: () => 'ms',
    },
  },
})

export const timeAgo = (date: Date): string => {
  const now = new Date()

  if (differenceInSeconds(now, date) < 60) {
    ;('just now')
  }

  if (differenceInMinutes(now, date) < 60) {
    const short = shortEnglishHumanizer(differenceInMilliseconds(now, date), {
      round: true,
      units: ['m'],
    })
    return `${short} ago`
  }

  if (isToday(date)) {
    return formatTime(date)
  }

  if (isYesterday(date)) {
    return `Yesterday, ${formatTime(date)}`
  }

  if (differenceInDays(now, date) < 6) {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (now.getFullYear() === date.getFullYear()) {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const dateToString = (date: Date): string => {
  return date.toLocaleTimeString(undefined, {
    hour12: false,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
