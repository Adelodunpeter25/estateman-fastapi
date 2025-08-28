import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp } from "lucide-react"
import type { TopPerformer } from "@/services/dashboard"

interface TopPerformersProps {
  performers: TopPerformer[]
}

export function TopPerformers({ performers }: TopPerformersProps) {
  if (!performers || performers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performers.map((performer, index) => (
            <div key={performer.id} className="p-3 md:p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                      {getInitials(performer.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-medium text-sm md:text-base">{performer.name}</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">Rank #{index + 1}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-muted-foreground">Sales Count</span>
                  <p className="font-semibold">{performer.sales}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Revenue</span>
                  <p className="font-semibold text-primary">
                    ${(performer.revenue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Commission</span>
                  <p className="font-semibold text-success">
                    ${(performer.commission / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}