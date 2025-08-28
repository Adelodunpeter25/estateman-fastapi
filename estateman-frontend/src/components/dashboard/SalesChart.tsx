import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ChartData } from "@/services/dashboard"

interface SalesChartProps {
  data: ChartData | null
}

export function SalesChart({ data }: SalesChartProps) {
  if (!data) {
    return (
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sales Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80 flex items-center justify-center text-muted-foreground">
            No sales data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.labels.map((label, index) => ({
    month: label,
    sales: data.revenue[index] * 1000000, // Convert back to actual values
    deals: data.sales[index]
  }))

  const currentMonth = chartData[chartData.length - 1]
  const previousMonth = chartData[chartData.length - 2]
  const growth = previousMonth ? ((currentMonth.sales - previousMonth.sales) / previousMonth.sales) * 100 : 0

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold">Sales Performance</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
              +{growth.toFixed(1)}% vs last month
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = chartData.find(d => d.month === label)
                    return (
                      <div className="bg-card border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{label}</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-primary">Sales: </span>
                            ${(payload[0].value as number / 1000000).toFixed(2)}M
                          </p>

                          <p className="text-sm">
                            <span className="text-gold">Deals: </span>
                            {dataPoint?.deals || 0}
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs md:text-sm text-muted-foreground">Total Sales YTD</p>
            <p className="text-base md:text-lg font-bold text-primary">
              ${(chartData.reduce((sum, month) => sum + month.sales, 0) / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs md:text-sm text-muted-foreground">Total Deals</p>
            <p className="text-base md:text-lg font-bold text-gold">
              {chartData.reduce((sum, month) => sum + month.deals, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}