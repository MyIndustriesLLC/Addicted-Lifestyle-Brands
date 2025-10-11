import { StatsCard } from '../stats-card'
import { Package } from 'lucide-react'

export default function StatsCardExample() {
  return (
    <div className="max-w-sm">
      <StatsCard
        title="Total Products"
        value={42}
        icon={Package}
        trend="+12% this month"
      />
    </div>
  )
}
