
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  Receipt,
  CreditCard,
  PieChart,
  BarChart3,
  FileText,
  Calendar,
  Target,
  Users,
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Upload
} from "lucide-react"
import { Input } from "@/components/ui/input"

const Accounting = () => {
  const financialStats = [
    { label: "Total Revenue", value: "$2.8M", change: "+15.3%", trend: "up", period: "This Year" },
    { label: "Commission Paid", value: "$485K", change: "+8.7%", trend: "up", period: "This Quarter" },
    { label: "Operating Expenses", value: "$156K", change: "-3.2%", trend: "down", period: "This Month" },
    { label: "Net Profit", value: "$742K", change: "+22.1%", trend: "up", period: "YTD" }
  ]

  const recentTransactions = [
    { id: 1, type: "Commission", description: "Sarah Johnson - 123 Oak St Sale", amount: "+$12,500", date: "2024-01-15", status: "Completed" },
    { id: 2, type: "Expense", description: "Marketing Campaign - Q1", amount: "-$3,200", date: "2024-01-14", status: "Pending" },
    { id: 3, type: "Commission", description: "Mike Wilson - Downtown Condo", amount: "+$8,750", date: "2024-01-13", status: "Completed" },
    { id: 4, type: "Expense", description: "Office Rent - January", amount: "-$4,500", date: "2024-01-12", status: "Completed" },
    { id: 5, type: "Commission", description: "Lisa Chen - Luxury Villa", amount: "+$25,000", date: "2024-01-11", status: "Processing" }
  ]

  const expenseCategories = [
    { category: "Marketing", amount: "$45,200", percentage: 35, color: "bg-blue-500" },
    { category: "Office Rent", amount: "$32,400", percentage: 25, color: "bg-green-500" },
    { category: "Commissions", amount: "$28,800", percentage: 22, color: "bg-purple-500" },
    { category: "Utilities", amount: "$12,600", percentage: 10, color: "bg-yellow-500" },
    { category: "Software", amount: "$10,400", percentage: 8, color: "bg-red-500" }
  ]

  const monthlyData = [
    { month: "Jan", revenue: 245000, expenses: 32000 },
    { month: "Feb", revenue: 289000, expenses: 28000 },
    { month: "Mar", revenue: 312000, expenses: 35000 },
    { month: "Apr", revenue: 287000, expenses: 31000 },
    { month: "May", revenue: 324000, expenses: 29000 },
    { month: "Jun", revenue: 356000, expenses: 33000 }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
            <p className="text-muted-foreground">Financial overview and transaction management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button className="bg-primary">
              <Receipt className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.period}</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {stat.change}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budget">Budget Planning</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Revenue vs Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{data.month}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">${(data.revenue / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm">${(data.expenses / 1000).toFixed(0)}K</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Expense Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseCategories.map((expense, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{expense.category}</span>
                          <span className="text-sm">{expense.amount}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${expense.color}`}
                            style={{ width: `${expense.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest financial activities</CardDescription>
                  </div>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="commission">Commissions</SelectItem>
                      <SelectItem value="expense">Expenses</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'Commission' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'Commission' ? (
                            <DollarSign className="h-4 w-4 text-green-600" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {transaction.date}
                            <Badge variant="outline">{transaction.type}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount}
                        </p>
                        <Badge variant={
                          transaction.status === 'Completed' ? 'default' : 
                          transaction.status === 'Processing' ? 'secondary' : 'outline'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Expense Management</CardTitle>
                    <CardDescription>Track and categorize business expenses</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Expenses
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search expenses..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { date: "2024-01-30", description: "Google Ads Campaign", category: "Marketing", amount: "$1,250", status: "Approved" },
                    { date: "2024-01-29", description: "Office Supplies", category: "Office", amount: "$347", status: "Pending" },
                    { date: "2024-01-28", description: "Client Lunch Meeting", category: "Travel", amount: "$89", status: "Approved" },
                    { date: "2024-01-27", description: "Software License", category: "Technology", amount: "$299", status: "Approved" }
                  ].map((expense, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {expense.date}
                            <Badge variant="outline">{expense.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{expense.amount}</p>
                        <Badge variant={expense.status === 'Approved' ? 'default' : 'secondary'}>
                          {expense.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Budget Planning & Forecasting
                </CardTitle>
                <CardDescription>Set budgets and track spending against targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Monthly Budget Allocation</h4>
                    {[
                      { category: "Marketing", budget: 45000, spent: 38200, color: "bg-blue-500" },
                      { category: "Operations", budget: 32000, spent: 28900, color: "bg-green-500" },
                      { category: "Commissions", budget: 75000, spent: 68500, color: "bg-purple-500" },
                      { category: "Technology", budget: 15000, spent: 12400, color: "bg-yellow-500" }
                    ].map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-sm">${item.spent.toLocaleString()} / ${item.budget.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${Math.min((item.spent / item.budget) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{((item.spent / item.budget) * 100).toFixed(1)}% used</span>
                          <span>${(item.budget - item.spent).toLocaleString()} remaining</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Quarterly Forecast</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span>Projected Revenue</span>
                          <span className="font-bold text-success">$2.4M</span>
                        </div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span>Projected Expenses</span>
                          <span className="font-bold text-red-600">$480K</span>
                        </div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span>Net Profit Forecast</span>
                          <span className="font-bold text-primary">$1.92M</span>
                        </div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span>Profit Margin</span>
                          <span className="font-bold">80%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Financial Analytics
                </CardTitle>
                <CardDescription>Deep insights into financial performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="text-2xl font-bold text-success">$2.8M</p>
                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                    <p className="text-xs text-success">+15.3% vs last year</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">68%</p>
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className="text-xs text-success">+5.2% improvement</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <Calculator className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <p className="text-2xl font-bold">$485K</p>
                    <p className="text-sm text-muted-foreground">Operating Costs</p>
                    <p className="text-xs text-success">-3.1% reduction</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-4">Cash Flow Analysis</h4>
                    <div className="space-y-3">
                      {[
                        { month: "January", inflow: 245000, outflow: 32000 },
                        { month: "February", inflow: 289000, outflow: 28000 },
                        { month: "March", inflow: 312000, outflow: 35000 },
                        { month: "April", inflow: 287000, outflow: 31000 }
                      ].map((data, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{data.month}</span>
                          <div className="flex gap-4">
                            <span className="text-sm text-success">+${(data.inflow / 1000).toFixed(0)}K</span>
                            <span className="text-sm text-red-600">-${(data.outflow / 1000).toFixed(0)}K</span>
                            <span className="text-sm font-medium">
                              ${((data.inflow - data.outflow) / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-4">Top Performers</h4>
                    <div className="space-y-3">
                      {[
                        { name: "Sarah Johnson", revenue: "$145K", deals: 12 },
                        { name: "Mike Wilson", revenue: "$132K", deals: 10 },
                        { name: "Lisa Chen", revenue: "$128K", deals: 8 },
                        { name: "David Brown", revenue: "$115K", deals: 9 }
                      ].map((performer, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded">
                          <div>
                            <p className="font-medium">{performer.name}</p>
                            <p className="text-sm text-muted-foreground">{performer.deals} deals</p>
                          </div>
                          <p className="font-bold text-success">{performer.revenue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>Generate detailed financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Report generation features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Accounting
