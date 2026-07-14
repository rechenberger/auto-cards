'use client'

import { useAdminJobs } from '@/client/api/admin'
import { useGenerateAiImages } from '@/client/api/aiImages'
import { toast } from '@/components/ui/use-toast'
import { AiImageCommand } from '@/contracts/ai-images'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

export const useAiGeneration = () => {
  const mutation = useGenerateAiImages()
  const queryClient = useQueryClient()
  const [jobIds, setJobIds] = useState<string[]>([])
  const jobs = useAdminJobs(jobIds)
  const handled = useRef('')
  const handledError = useRef<unknown>(null)

  useEffect(() => {
    if (!mutation.error || handledError.current === mutation.error) return
    handledError.current = mutation.error
    toast({
      variant: 'destructive',
      title: 'Could not queue image generation',
      description: mutation.error.message,
    })
  }, [mutation.error])

  useEffect(() => {
    const current = jobs.data?.jobs ?? []
    if (
      current.length > 0 &&
      current.every((job) => ['completed', 'failed'].includes(job.status))
    ) {
      const key = current.map((job) => `${job.id}:${job.status}`).join(',')
      if (handled.current === key) return
      handled.current = key
      void queryClient.invalidateQueries({ queryKey: ['ai-images'] })
      const failed = current.filter((job) => job.status === 'failed')
      toast(
        failed.length
          ? {
              variant: 'destructive',
              title: 'Image generation finished with errors',
              description: `${failed.length} of ${current.length} jobs failed.`,
            }
          : {
              title: 'Images generated',
              description: `${current.length} background job${
                current.length === 1 ? '' : 's'
              } completed.`,
            },
      )
    }
  }, [jobs.data?.jobs, queryClient])

  const queue = async (command: AiImageCommand) => {
    const result = await mutation.mutateAsync(command)
    handled.current = ''
    setJobIds(result.jobs.map((job) => job.id))
    if (!result.jobs.length) {
      toast({
        title: 'Images are up to date',
        description: `${result.skipped ?? 0} combinations were skipped.`,
      })
    }
    return result
  }

  const running =
    mutation.isPending ||
    (jobIds.length > 0 &&
      (jobs.isPending ||
        (jobs.data?.jobs.some((job) =>
          ['queued', 'running'].includes(job.status),
        ) ??
          false)))

  return {
    queue,
    running,
    error: mutation.error,
    jobs: jobs.data?.jobs ?? [],
  }
}
