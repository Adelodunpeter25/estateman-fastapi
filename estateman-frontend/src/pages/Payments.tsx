import { DashboardLayout } from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Search,
  Filter,
  Calculator,
  Settings as SettingsIcon,
  Plus
} from "lucide-react"
import { InstallmentCalculator } from "@/components/InstallmentCalculator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/store/app-store"

const Payments = () => {
  const { payments } = useAppStore()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success/10 text-success border-success/20"
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "overdue":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "completed":
        return "bg-success/10 text-success border-success/20"
      case "active":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalReceived = payments.reduce((sum, payment) => sum + payment.paidAmount, 0)
  const totalExpected = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalOverdue = payments
    .filter(p => p.status === "overdue")
    .reduce((sum, payment) => sum + (payment.amount - payment.paidAmount), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-muted-foreground">Track installment payments and commission calculations. Synced with Client Portal.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Payment Plan
            </Button>
          </div>
        </div>

        {/* Payment Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ${totalReceived.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Year to date</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${totalExpected.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All contracts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ${totalOverdue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {((totalReceived / totalExpected) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Payment success rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments">Payment Tracking</TabsTrigger>
            <TabsTrigger value="calculator">Payment Calculator</TabsTrigger>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>Payment Tracking</CardTitle>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search payments..." className="pl-10" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-6 border rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{payment.clientName}</h4>
                          <p className="text-muted-foreground">{payment.propertyAddress}</p>
                          <p className="text-sm text-primary font-medium">{payment.propertyType}</p>
                          <p className="text-sm text-muted-foreground">Payment ID: {payment.id}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Contract Value</p>
                          <p className="text-xl font-bold">${payment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount Paid</p>
                          <p className="text-xl font-bold text-success">${payment.paidAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Remaining Balance</p>
                          <p className="text-xl font-bold text-primary">
                            ${(payment.amount - payment.paidAmount).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Payment Progress</span>
                          <span>{((payment.paidAmount / payment.amount) * 100).toFixed(1)}% Complete</span>
                        </div>
                        <Progress value={(payment.paidAmount / payment.amount) * 100} className="h-2" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Property Details */}
                        <div>
                          <h5 className="font-medium mb-3">Property Details</h5>
                          <div className="space-y-3">
                            <div className="p-3 bg-muted/50 rounded">
                              <h6 className="font-medium text-sm mb-2">{payment.propertyType}</h6>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                {payment.propertyDetails.bedrooms && (
                                  <p>{payment.propertyDetails.bedrooms} bed • {payment.propertyDetails.bathrooms} bath</p>
                                )}
                                {payment.propertyDetails.sqft && (
                                  <p>{payment.propertyDetails.sqft} sq ft</p>
                                )}
                                {payment.propertyDetails.landSize && (
                                  <p>Land: {payment.propertyDetails.landSize}</p>
                                )}
                                {payment.propertyDetails.zoning && (
                                  <p>Zoning: {payment.propertyDetails.zoning}</p>
                                )}
                                {payment.propertyDetails.yearBuilt && (
                                  <p>Built: {payment.propertyDetails.yearBuilt}</p>
                                )}
                                {payment.propertyDetails.yearAcquired && (
                                  <p>Acquired: {payment.propertyDetails.yearAcquired}</p>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                              {payment.propertyDetails.images.slice(0, 3).map((image, idx) => (
                                <div key={idx} className="aspect-square bg-muted rounded overflow-hidden">
                                  <img src={image} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Installment Schedule */}
                        <div>
                          <h5 className="font-medium mb-3">Installment Schedule</h5>
                          <div className="space-y-2">
                            {payment.installments.map((installment, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(installment.status)}
                                  <div>
                                    <p className="font-medium">${installment.amount.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Due: {installment.dueDate}
                                      {installment.paidDate && ` • Paid: ${installment.paidDate}`}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className={getStatusColor(installment.status)}>
                                  {installment.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Commission Info */}
                        <div>
                          <h5 className="font-medium mb-3">Commission Tracking</h5>
                          <div className="space-y-3">
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Total Commission</span>
                                <span className="font-semibold">${payment.realtorCommission.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Commission Paid</span>
                                <span className="font-semibold text-success">${payment.commissionPaid.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Commission Pending</span>
                                <span className="font-semibold text-warning">
                                  ${(payment.realtorCommission - payment.commissionPaid).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <InstallmentCalculator />
          </TabsContent>

          <TabsContent value="configurations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Payment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Payment Terms (Days)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Late Payment Fee (%)</Label>
                    <Input type="number" step="0.1" defaultValue="5.0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Grace Period (Days)</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Down Payment (%)</Label>
                    <Input type="number" step="1" defaultValue="20" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Send payment reminders</Label>
                        <p className="text-sm text-muted-foreground">Automatic payment reminder emails</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Overdue payment alerts</Label>
                        <p className="text-sm text-muted-foreground">Alert when payments are overdue</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Commission payment notifications</Label>
                        <p className="text-sm text-muted-foreground">Notify realtors of commission payments</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default Payments