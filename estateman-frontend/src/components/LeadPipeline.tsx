import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, DollarSign, Target } from "lucide-react"
import { clientsService, LeadPipeline as LeadPipelineData } from "@/services/clients"

export function LeadPipeline() {
  const [pipelineData, setPipelineData] = useState<LeadPipelineData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPipelineData()
  }, [])

  const loadPipelineData = async () => {
    try {
      setLoading(true)
      const data = await clientsService.getLeadPipeline()
      setPipelineData(data)
    } catch (error) {
      console.error("Failed to load pipeline data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStageColor = (stage: string) => {
    const colors = {
      "new": "bg-blue-100 text-blue-800",
      "contacted": "bg-yellow-100 text-yellow-800", 
      "qualified": "bg-purple-100 text-purple-800",
      "proposal": "bg-orange-100 text-orange-800",
      "negotiation": "bg-red-100 text-red-800",
      "closed_won": "bg-green-100 text-green-800",
      "closed_lost": "bg-gray-100 text-gray-800"
    }
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0)
  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0)
  const wonLeads = pipelineData.find(s => s.stage === "closed_won")?.count || 0
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads * 100) : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading pipeline data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Won Deals</p>
                <p className="text-2xl font-bold">{wonLeads}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline Stages</CardTitle>
          <CardDescription>Track leads through each stage of the sales process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineData.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No pipeline data available
              </div>
            ) : (
              pipelineData.map((stage) => {
                const percentage = totalLeads > 0 ? (stage.count / totalLeads * 100) : 0
                const avgValue = stage.count > 0 ? (stage.value / stage.count) : 0

                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getStageColor(stage.stage)}>
                          {stage.stage.replace("_", " ").toUpperCase()}
                        </Badge>
                        <span className="font-medium">{stage.count} leads</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${stage.value.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Avg: ${avgValue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}% of total pipeline
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Flow</CardTitle>
          <CardDescription>Visual representation of lead progression</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {pipelineData.map((stage, index) => (
              <div key={stage.stage} className="flex items-center">
                <div className="text-center min-w-[120px]">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    stage.count > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <span className="font-bold">{stage.count}</span>
                  </div>
                  <div className="text-sm font-medium">
                    {stage.stage.replace("_", " ").toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${stage.value.toLocaleString()}
                  </div>
                </div>
                {index < pipelineData.length - 1 && (
                  <div className="flex-1 h-0.5 bg-border mx-4 min-w-[40px]" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}