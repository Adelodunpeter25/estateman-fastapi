import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  type: "sale" | "lead" | "commission" | "property" | "client"
  title: string
  description: string
  user: {
    name: string
    initials: string
  }
  timestamp: Date
  amount?: number
  status?: "success" | "pending" | "warning"
}

const activities: Activity[] = [
  {
    id: "1",
    type: "sale",
    title: "Property Sale Completed",
    description: "Luxury villa sold in Downtown District",
    user: { name: "Sarah Johnson", initials: "SJ" },
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    amount: 850000,
    status: "success"
  },
  {
    id: "2",
    type: "lead",
    title: "New High-Value Lead",
    description: "Enterprise client interested in commercial space",
    user: { name: "Mike Chen", initials: "MC" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "pending"
  },
  {
    id: "3",
    type: "commission",
    title: "Commission Payment",
    description: "Q4 commission payout processed",
    user: { name: "Emily Davis", initials: "ED" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    amount: 15000,
    status: "success"
  },
  {
    id: "4",
    type: "property",
    title: "New Property Listed",
    description: "Modern apartment complex in Riverside",
    user: { name: "James Wilson", initials: "JW" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    amount: 1200000,
    status: "warning"
  },
  {
    id: "5",
    type: "client",
    title: "Client Onboarded",
    description: "Premium client package activated",
    user: { name: "Lisa Anderson", initials: "LA" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    status: "success"
  }
]

export function RecentActivities() {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-success text-success-foreground"
      case "warning":
        return "bg-warning text-warning-foreground"
      case "pending":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
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
              <div className="text-base md:text-lg flex-shrink-0">{getTypeIcon(activity.type)}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activity.amount && (
                      <span className="text-xs sm:text-sm font-semibold text-primary">
                        ${activity.amount.toLocaleString()}
                      </span>
                    )}
                    {activity.status && (
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(activity.status)} text-xs`}
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.description}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-1 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 md:h-6 md:w-6">
                      <AvatarFallback className="text-xs">
                        {activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user.name}
                    </span>
                  </div>
                  
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
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