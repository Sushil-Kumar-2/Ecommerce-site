import { toast } from 'sonner'

import { useIsAdmin } from '@/features/admin/hooks'
import { getApiErrorMessage } from '@/utils/api-error'

import {
  useGetAdminProductReportByIdQuery,
  useGetAdminProductReportsQuery,
  useResolveProductReportMutation,
  useReviewProductReportMutation,
} from './adminReportsApi'
import type { ProductReportFilters } from './admin-report.types'

export function useAdminProductReports(filters?: ProductReportFilters) {
  const isAdmin = useIsAdmin()
  return useGetAdminProductReportsQuery(filters, { skip: !isAdmin })
}

export function useAdminProductReport(id: string | undefined) {
  const isAdmin = useIsAdmin()
  return useGetAdminProductReportByIdQuery(id ?? '', { skip: !isAdmin || !id })
}

export function useReviewProductReport() {
  const [review, state] = useReviewProductReportMutation()

  const action = async (id: string) => {
    try {
      const result = await review(id).unwrap()
      toast.success('Report marked as reviewed')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to review report.'))
      throw error
    }
  }

  return [action, state] as const
}

export function useResolveProductReport() {
  const [resolve, state] = useResolveProductReportMutation()

  const action = async (id: string) => {
    try {
      const result = await resolve(id).unwrap()
      toast.success('Report resolved')
      return result
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to resolve report.'))
      throw error
    }
  }

  return [action, state] as const
}
