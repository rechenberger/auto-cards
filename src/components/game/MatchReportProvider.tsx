'use client'

import {
  generateMatch,
  GenerateMatchInput,
  MatchReport,
} from '@/game/generateMatch'
import { createContext, useContext } from 'react'

export const MatchReportContext = createContext<MatchReport | null>(null)

export const MatchReportProvider = ({
  children,
  input,
}: {
  children: React.ReactNode
  input: GenerateMatchInput
}) => {
  // const matchReport = use(generateMatch(input))
  const matchReport = generateMatch(input)
  return (
    <MatchReportContext.Provider value={matchReport}>
      {children}
    </MatchReportContext.Provider>
  )
}

export const useMatchReport = () => {
  const matchReport = useContext(MatchReportContext)
  if (!matchReport) {
    throw new Error('useMatchReport must be used within a MatchReportProvider')
  }
  return matchReport
}
