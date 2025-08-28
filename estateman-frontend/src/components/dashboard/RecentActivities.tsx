import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { RecentActivity } from "@/services/dashboard"

interface RecentActivitiesProps {
  activities: RecentActivity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No recent activities
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sale":
        return "💰"
      case "lead":
        return "🎯"
      case "commission":
        return "💳"
      case "property":
        return "🏢"
      case "client":
        return "👤"
      default:
        return "📄"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="text-base md:text-lg flex-shrink-0">{getTypeIcon(activity.activity_type)}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <h4 className="text-sm font-medium truncate">{activity.action}</h4>
                  {activity.amount && (
                    <span className="text-xs sm:text-sm font-semibold text-primary">
                      ${activity.amount.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.description}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-1 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 md:h-6 md:w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user_name}
                    </span>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}