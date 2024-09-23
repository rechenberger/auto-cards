// FROM: https://teampilot.ai/team/tristan/chat/e82600d7dc101da4e09e1d9f2ccadb96

export function getOrdinalSuffix(num: number): string {
  // Helper function to get the last digit of a number
  const getLastDigit = (n: number): number => n % 10

  // Get the last two digits to handle special cases like 11, 12, 13
  const lastTwoDigits = num % 100
  const lastDigit = getLastDigit(num)

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `th`
  }

  switch (lastDigit) {
    case 1:
      return `st`
    case 2:
      return `nd`
    case 3:
      return `rd`
    default:
      return `th`
  }
}
