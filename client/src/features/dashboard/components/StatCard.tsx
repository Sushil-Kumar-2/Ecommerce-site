import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  className?: string
  icon?: LucideIcon
  trend?: number
  href?: string
  isLoading?: boolean
}

export function StatCard({
  title,
  value,
  className,
  icon: Icon,
  trend,
  href,
  isLoading = false,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        'shadow-sm transition-shadow hover:shadow-md',
        href && 'cursor-pointer',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <p className="text-2xl font-semibold">{value}</p>
            {trend !== undefined ? (
              <div
                className={cn(
                  'mt-1 flex items-center gap-1 text-xs',
                  trend >= 0 ? 'text-status-success-foreground' : 'text-destructive',
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                <span>{Math.abs(trend)}% vs last period</span>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link to={href}>{content}</Link>
  }

  return content
}
