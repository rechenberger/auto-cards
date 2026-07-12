'use client'

import {
  AdminBotsDto,
  AdminJobBatchDto,
  AdminJobsDto,
  AdminMigrationCommand,
  AdminMigrationResultDto,
  AdminMigrationStatusDto,
  AdminMutationResult,
  AdminUserListDto,
  CreateAdminUserRequest,
  QueueBotGenerationRequest,
  QueueSimulationRequest,
  UpdateAdminUserRequest,
} from '@/contracts/admin'
import { toast } from '@/components/ui/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi } from './fetchApi'

const jsonMutation = (body: unknown, method = 'POST'): RequestInit => ({
  method,
  headers: {
    'content-type': 'application/json',
    'idempotency-key': crypto.randomUUID(),
  },
  body: JSON.stringify(body),
})

export const adminUsersKey = ['admin', 'users'] as const
export const adminBotsKey = ['admin', 'bots'] as const
export const adminMigrationsKey = ['admin', 'migrations'] as const

export const useAdminUsers = (filter: 'all' | 'admins') =>
  useQuery({
    queryKey: [...adminUsersKey, filter],
    queryFn: () =>
      fetchApi(
        `/api/v1/admin/users${filter === 'admins' ? '?filter=admins' : ''}`,
        AdminUserListDto,
      ),
  })

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAdminUserRequest) =>
      fetchApi('/api/v1/admin/users', AdminMutationResult, jsonMutation(input)),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKey })
      toast({ title: result.message })
    },
  })
}

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      input,
    }: {
      userId: string
      input: UpdateAdminUserRequest
    }) =>
      fetchApi(
        `/api/v1/admin/users/${encodeURIComponent(userId)}`,
        AdminMutationResult,
        jsonMutation(input, 'PATCH'),
      ),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKey })
      toast({ title: result.message })
    },
  })
}

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      fetchApi(
        `/api/v1/admin/users/${encodeURIComponent(userId)}`,
        AdminMutationResult,
        {
          method: 'DELETE',
          headers: { 'idempotency-key': crypto.randomUUID() },
        },
      ),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKey })
      toast({ title: result.message })
    },
  })
}

export const useAdminBots = () =>
  useQuery({
    queryKey: adminBotsKey,
    queryFn: () => fetchApi('/api/v1/admin/bots', AdminBotsDto),
  })

export const useQueueBotGeneration = () =>
  useMutation({
    mutationFn: (input: QueueBotGenerationRequest) =>
      fetchApi(
        '/api/v1/admin/bots/commands',
        AdminJobBatchDto,
        jsonMutation(input),
      ),
  })

export const useQueueSimulations = () =>
  useMutation({
    mutationFn: (input: QueueSimulationRequest) =>
      fetchApi(
        '/api/v1/admin/simulations',
        AdminJobBatchDto,
        jsonMutation(input),
      ),
  })

export const useAdminJobs = (
  ids: string[],
  { includeResult = false }: { includeResult?: boolean } = {},
) => {
  const stableIds = [...ids].sort()
  return useQuery({
    queryKey: ['admin', 'jobs', stableIds, includeResult],
    enabled: stableIds.length > 0,
    queryFn: () =>
      fetchApi(
        `/api/v1/admin/jobs?ids=${encodeURIComponent(
          stableIds.join(','),
        )}&includeResult=${includeResult}`,
        AdminJobsDto,
      ),
    refetchInterval: (query) =>
      query.state.data?.jobs.every((job) =>
        ['completed', 'failed'].includes(job.status),
      )
        ? false
        : 2_000,
    refetchIntervalInBackground: false,
  })
}

export const useAdminMigrationStatus = () =>
  useQuery({
    queryKey: adminMigrationsKey,
    queryFn: () =>
      fetchApi('/api/v1/admin/migrations', AdminMigrationStatusDto),
  })

export const useRunAdminMigration = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (command: AdminMigrationCommand) =>
      fetchApi(
        '/api/v1/admin/migrations',
        AdminMigrationResultDto,
        jsonMutation(command),
      ),
    onSuccess: (result) => {
      queryClient.setQueryData(adminMigrationsKey, {
        leaderboardMissingGameId: result.remaining,
      })
      toast({
        title: 'Data migration finished',
        description: `${result.updated} rows updated, ${result.remaining} remaining.`,
      })
    },
  })
}
