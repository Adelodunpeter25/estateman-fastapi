import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, TrendingUp, Star } from "lucide-react"

interface Performer {
  id: string
  name: string
  initials: string
  role: string
  sales: number
  target: number
  commission: number
  level: "Diamond" | "Gold" | "Silver" | "Bronze"
  rank: number
}

const performers: Performer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    initials: "SJ",
    role: "Senior Realtor",
    sales: 2850000,
    target: 3000000,
    commission: 142500,
    level: "Diamond",
    rank: 1
  },
  {
    id: "2",
    name: "Mike Chen",
    initials: "MC",
    role: "Team Lead",
    sales: 2650000,
    target: 2800000,
    commission: 132500,
    level: "Gold",
    rank: 2
  },
  {
    id: "3",
    name: "Emily Davis",
    initials: "ED",
    role: "Realtor",
    sales: 2100000,
    target: 2500000,
    commission: 105000,
    level: "Gold",
    rank: 3
  },
  {
    id: "4",
    name: "James Wilson",
    initials: "JW",
    role: "Junior Realtor",
    sales: 1800000,
    target: 2000000,
    commission: 90000,
    level: "Silver",
    rank: 4
  },
  {
    id: "5",
    name: "Lisa Anderson",
    initials: "LA",
    role: "Realtor",
    sales: 1650000,
    target: 2000000,
    commission: 82500,
    level: "Silver",
    rank: 5
  }
]

export function TopPerformers() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Diamond":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Silver":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Bronze":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />
      case 3:
        return <Trophy className="h-4 w-4 text-orange-500" />
      default:
        return <Star className="h-4 w-4 text-muted-foreground" />
    }
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
          {performers.map((performer) => {
            const progressPercentage = (performer.sales / performer.target) * 100
            
            return (
              <div key={performer.id} className="p-3 md:p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                          {performer.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1">
                        {getRankIcon(performer.rank)}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm md:text-base">{performer.name}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">{performer.role}</p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className={`${getLevelColor(performer.level)} text-xs`}>
                    {performer.level}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-xs md:text-sm gap-1">
                    <span>Sales Progress</span>
                    <span className="font-medium">
                      ${(performer.sales / 1000000).toFixed(1)}M / ${(performer.target / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  
                  <Progress value={progressPercentage} className="h-2" />
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs md:text-sm gap-1">
                    <span className="text-muted-foreground">
                      {progressPercentage.toFixed(1)}% of target
                    </span>
                    <span className="font-semibold text-primary">
                      ${(performer.commission / 1000).toFixed(0)}K commission
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}