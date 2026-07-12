'use client'

import {
  ImpersonateGrant,
  MeDto,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateMeRequest,
} from '@/contracts/auth-api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, jsonRequest } from './fetchApi'

export const meQueryKey = ['me'] as const

export const fetchMe = () => fetchApi('/api/v1/me', MeResponse)

export const useMe = () =>
  useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
  })

export const useUpdateMe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (update: UpdateMeRequest) => {
      return fetchApi(
        '/api/v1/me',
        MeDto,
        jsonRequest(update, { method: 'PATCH' }),
      )
    },
    onSuccess: (me) => queryClient.setQueryData(meQueryKey, me),
  })
}

export const useRegister = () =>
  useMutation({
    mutationFn: async (input: RegisterRequest) => {
      return fetchApi(
        '/api/v1/auth/register',
        RegisterResponse,
        jsonRequest(input, { method: 'POST' }),
      )
    },
  })

export const useCreateImpersonationGrant = () =>
  useMutation({
    mutationFn: async (userId: string) => {
      return fetchApi(
        '/api/v1/auth/impersonate',
        ImpersonateGrant,
        jsonRequest({ userId }, { method: 'POST' }),
      )
    },
  })
