import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const salesData = [
  { month: 'Jan', sales: 2400000, target: 2800000, deals: 45 },
  { month: 'Feb', sales: 2100000, target: 2800000, deals: 38 },
  { month: 'Mar', sales: 2800000, target: 2800000, deals: 52 },
  { month: 'Apr', sales: 3200000, target: 3000000, deals: 61 },
  { month: 'May', sales: 2900000, target: 3000000, deals: 55 },
  { month: 'Jun', sales: 3400000, target: 3200000, deals: 68 },
  { month: 'Jul', sales: 3600000, target: 3200000, deals: 72 },
  { month: 'Aug', sales: 3100000, target: 3200000, deals: 58 },
  { month: 'Sep', sales: 3800000, target: 3500000, deals: 76 },
  { month: 'Oct', sales: 4200000, target: 3500000, deals: 84 },
  { month: 'Nov', sales: 3900000, target: 3800000, deals: 78 },
  { month: 'Dec', sales: 4500000, target: 4000000, deals: 89 }
]

export function SalesChart() {
  const currentMonth = salesData[salesData.length - 1]
  const previousMonth = salesData[salesData.length - 2]
  const growth = ((currentMonth.sales - previousMonth.sales) / previousMonth.sales) * 100

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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
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
                    const dataPoint = salesData.find(d => d.month === label)
                    return (
                      <div className="bg-card border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{label}</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-primary">Sales: </span>
                            ${(payload[0].value as number / 1000000).toFixed(2)}M
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Target: </span>
                            ${(payload[1].value as number / 1000000).toFixed(2)}M
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
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs md:text-sm text-muted-foreground">Total Sales YTD</p>
            <p className="text-base md:text-lg font-bold text-primary">
              ${(salesData.reduce((sum, month) => sum + month.sales, 0) / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs md:text-sm text-muted-foreground">Target Achievement</p>
            <p className="text-base md:text-lg font-bold text-success">
              {((salesData.reduce((sum, month) => sum + month.sales, 0) / 
                salesData.reduce((sum, month) => sum + month.target, 0)) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs md:text-sm text-muted-foreground">Total Deals</p>
            <p className="text-base md:text-lg font-bold text-gold">
              {salesData.reduce((sum, month) => sum + month.deals, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}