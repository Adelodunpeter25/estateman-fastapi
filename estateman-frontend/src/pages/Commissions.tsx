import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Calculator, Clock, CheckCircle, AlertCircle } from "lucide-react"

const Commissions = () => {
  const commissionStats = [
    { title: "Total Commission", value: "$245,600", change: "+12.5%", icon: DollarSign },
    { title: "Pending Payouts", value: "$18,400", change: "+3.2%", icon: Clock },
    { title: "This Month", value: "$32,100", change: "+8.1%", icon: TrendingUp },
    { title: "Commission Rate", value: "6.2%", change: "+0.2%", icon: Calculator },
  ]

  const commissionData = [
    {
      id: "1",
      realtor: "Sarah Wilson",
      property: "123 Oak Street",
      salePrice: 450000,
      rate: 6,
      commission: 27000,
      status: "paid",
      date: "2024-01-15",
      client: "Johnson Family"
    },
    {
      id: "2", 
      realtor: "Mike Chen",
      property: "456 Pine Ave",
      salePrice: 320000,
      rate: 5.5,
      commission: 17600,
      status: "pending",
      date: "2024-01-20",
      client: "Davis Corp"
    },
    {
      id: "3",
      realtor: "Emily Rodriguez",
      property: "789 Maple Dr",
      salePrice: 580000,
      rate: 6.5,
      commission: 37700,
      status: "calculating",
      date: "2024-01-22",
      client: "Smith LLC"
    },
    {
      id: "4",
      realtor: "James Thompson",
      property: "321 Elm St",
      salePrice: 275000,
      rate: 6,
      commission: 16500,
      status: "paid",
      date: "2024-01-10",
      client: "Brown Family"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "calculating":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700"><Calculator className="w-3 h-3 mr-1" />Calculating</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Commission Management</h1>
          <p className="text-muted-foreground">Automated commission calculations and tracking</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {commissionStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Transactions</CardTitle>
                <CardDescription>Recent commission payments and calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Realtor</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionData.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">{commission.realtor}</TableCell>
                        <TableCell>{commission.property}</TableCell>
                        <TableCell>{commission.client}</TableCell>
                        <TableCell>${commission.salePrice.toLocaleString()}</TableCell>
                        <TableCell>{commission.rate}%</TableCell>
                        <TableCell className="font-medium">${commission.commission.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(commission.status)}</TableCell>
                        <TableCell>{commission.date}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commission Calculator</CardTitle>
                  <CardDescription>Calculate commission for new transactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sale Price</label>
                    <input 
                      type="number" 
                      placeholder="Enter sale price" 
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commission Rate (%)</label>
                    <input 
                      type="number" 
                      placeholder="Enter commission rate" 
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Split Percentage (%)</label>
                    <input 
                      type="number" 
                      placeholder="Enter split percentage" 
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  <Button className="w-full">Calculate Commission</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calculation Result</CardTitle>
                  <CardDescription>Commission breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Gross Commission:</span>
                      <span className="font-medium">$27,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agent Split (70%):</span>
                      <span className="font-medium">$18,900</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brokerage Split (30%):</span>
                      <span className="font-medium">$8,100</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Net Commission:</span>
                        <span>$18,900</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Commission Report</CardTitle>
                  <CardDescription>Commission performance by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>January 2024</span>
                      <span className="font-medium">$45,200</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>December 2023</span>
                      <span className="font-medium">$52,800</span>
                    </div>
                    <Progress value={88} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>November 2023</span>
                      <span className="font-medium">$38,600</span>
                    </div>
                    <Progress value={64} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Earners</CardTitle>
                  <CardDescription>Highest commission earners this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Sarah Wilson", commission: "$37,700", deals: 3 },
                      { name: "Mike Chen", commission: "$29,400", deals: 2 },
                      { name: "Emily Rodriguez", commission: "$25,100", deals: 2 },
                      { name: "James Thompson", commission: "$22,800", deals: 4 }
                    ].map((earner, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{earner.name}</div>
                          <div className="text-sm text-muted-foreground">{earner.deals} deals</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{earner.commission}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Commissions