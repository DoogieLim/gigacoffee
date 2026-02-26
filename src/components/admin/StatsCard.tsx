import { Card } from "@/components/ui/Card"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: { value: number; isPositive: boolean }
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`mt-1 text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? "▲" : "▼"} {Math.abs(trend.value)}% 전일 대비
          </p>
        )}
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
    </Card>
  )
}
