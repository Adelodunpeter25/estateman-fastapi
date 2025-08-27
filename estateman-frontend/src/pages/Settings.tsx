
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Database,
  Mail,
  CreditCard,
  Globe,
  Lock,
  Save,
  Users,
  Building,
  MapPin,
  Phone,
  Calendar,
  Target,
  Percent,
  FileText,
  Sliders
} from "lucide-react"

const Settings = () => {
  const generalSettings = [
    { label: "Company Name", value: "RealtyPro Agency", type: "input" },
    { label: "Business Email", value: "admin@realtypro.com", type: "email" },
    { label: "Phone Number", value: "+1 (555) 123-4567", type: "tel" },
    { label: "Address", value: "123 Business Ave, Suite 100", type: "textarea" },
    { label: "Website", value: "https://realtypro.com", type: "url" },
    { label: "Time Zone", value: "America/New_York", type: "select" }
  ]

  const notificationSettings = [
    { label: "Email Notifications", description: "Receive email alerts for important events", enabled: true },
    { label: "Push Notifications", description: "Get push notifications in your browser", enabled: true },
    { label: "SMS Alerts", description: "Receive SMS for urgent notifications", enabled: false },
    { label: "Daily Reports", description: "Get daily summary reports", enabled: true },
    { label: "Weekly Analytics", description: "Receive weekly performance reports", enabled: true },
    { label: "Marketing Updates", description: "Get notified about marketing campaigns", enabled: false }
  ]

  const securitySettings = [
    { label: "Two-Factor Authentication", description: "Add an extra layer of security", enabled: false },
    { label: "Login Alerts", description: "Get notified of new login attempts", enabled: true },
    { label: "Session Timeout", description: "Auto-logout after inactivity", enabled: true },
    { label: "API Access", description: "Allow third-party API access", enabled: false },
    { label: "Data Encryption", description: "Encrypt sensitive data", enabled: true },
    { label: "Audit Logging", description: "Log all system activities", enabled: true }
  ]

  const systemSettings = [
    { label: "Language", value: "English", type: "select" },
    { label: "Currency", value: "USD", type: "select" },
    { label: "Date Format", value: "MM/DD/YYYY", type: "select" },
    { label: "Number Format", value: "1,234.56", type: "select" },
    { label: "Default Commission Rate", value: "6", type: "number" },
    { label: "Lead Assignment", value: "round-robin", type: "select" }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              System Settings
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Configure your application preferences and settings</p>
          </div>
          <Button className="bg-primary w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto">
            <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
            <TabsTrigger value="business" className="text-xs sm:text-sm">Business</TabsTrigger>
            <TabsTrigger value="commissions" className="text-xs sm:text-sm">Commissions</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm">Security</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integrations</TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm">System</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs sm:text-sm">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic configuration for your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {generalSettings.map((setting, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={setting.label.toLowerCase().replace(/\s+/g, '-')}>{setting.label}</Label>
                      {setting.type === 'textarea' ? (
                        <Textarea 
                          id={setting.label.toLowerCase().replace(/\s+/g, '-')}
                          defaultValue={setting.value}
                          className="resize-none"
                        />
                      ) : setting.type === 'select' ? (
                        <Select defaultValue={setting.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={setting.value}>{setting.value}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          type={setting.type}
                          id={setting.label.toLowerCase().replace(' ', '-')}
                          defaultValue={setting.value}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Configure system-wide defaults</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {systemSettings.map((setting, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={setting.label.toLowerCase().replace(/\s+/g, '-')}>{setting.label}</Label>
                      {setting.type === 'select' ? (
                        <Select defaultValue={setting.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={setting.value}>{setting.value}</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          type={setting.type}
                          id={setting.label.toLowerCase().replace(' ', '-')}
                          defaultValue={setting.value}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Business Configuration
                </CardTitle>
                <CardDescription>Configure business rules and operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Business License Number</Label>
                    <Input defaultValue="BL-2024-001234" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax ID / EIN</Label>
                    <Input defaultValue="12-3456789" />
                  </div>
                  <div className="space-y-2">
                    <Label>Operating Hours</Label>
                    <Select defaultValue="9am-6pm">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24/7">24/7</SelectItem>
                        <SelectItem value="9am-6pm">9 AM - 6 PM</SelectItem>
                        <SelectItem value="8am-8pm">8 AM - 8 PM</SelectItem>
                        <SelectItem value="custom">Custom Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Areas</Label>
                    <Textarea placeholder="Manhattan, Brooklyn, Queens..." className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Property Value</Label>
                    <Input type="number" defaultValue="100000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Property Value</Label>
                    <Input type="number" defaultValue="10000000" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>Configure team and hierarchy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <Label>Auto-assign leads to available agents</Label>
                    <p className="text-sm text-muted-foreground">Automatically distribute new leads</p>
                  </div>
                  <Switch className="self-start sm:self-center" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <Label>Require manager approval for high-value deals</Label>
                    <p className="text-sm text-muted-foreground">Deals over $1M require approval</p>
                  </div>
                  <Switch defaultChecked className="self-start sm:self-center" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <Label>Enable team collaboration features</Label>
                    <p className="text-sm text-muted-foreground">Allow agents to collaborate on deals</p>
                  </div>
                  <Switch defaultChecked className="self-start sm:self-center" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Commission Structure
                </CardTitle>
                <CardDescription>Configure commission rates and MLM settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Base Commission Rate (%)</Label>
                    <Input type="number" step="0.1" defaultValue="6.0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Commission ($)</Label>
                    <Input type="number" defaultValue="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Commission (%)</Label>
                    <Input type="number" step="0.1" defaultValue="8.5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Referral Bonus ($)</Label>
                    <Input type="number" defaultValue="500" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">MLM Level Commission Rates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { level: "Level 1 (Direct)", rate: "3.0%" },
                      { level: "Level 2", rate: "1.5%" },
                      { level: "Level 3", rate: "1.0%" },
                      { level: "Level 4", rate: "0.5%" },
                      { level: "Level 5", rate: "0.25%" },
                      { level: "Level 6+", rate: "0.1%" }
                    ].map((level, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded gap-2">
                        <span className="text-sm font-medium">{level.level}</span>
                        <Input className="w-full sm:w-20" defaultValue={level.rate.replace('%', '')} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Tiers
                </CardTitle>
                <CardDescription>Set up performance-based commission tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { tier: "Bronze", threshold: "$50K", bonus: "0.5%" },
                    { tier: "Silver", threshold: "$150K", bonus: "1.0%" },
                    { tier: "Gold", threshold: "$300K", bonus: "1.5%" },
                    { tier: "Platinum", threshold: "$500K", bonus: "2.0%" },
                    { tier: "Diamond", threshold: "$1M", bonus: "2.5%" }
                  ].map((tier, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-3 border rounded">
                      <div>
                        <Label className="text-sm font-medium">{tier.tier} Tier</Label>
                      </div>
                      <div>
                        <Input placeholder="Threshold" defaultValue={tier.threshold} />
                      </div>
                      <div>
                        <Input placeholder="Bonus %" defaultValue={tier.bonus} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {notificationSettings.map((setting, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <Label>{setting.label}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch checked={setting.enabled} className="self-start sm:self-center" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage security and privacy settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {securitySettings.map((setting, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <Label>{setting.label}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Switch checked={setting.enabled} className="self-start sm:self-center" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input type="password" id="current-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input type="password" id="new-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input type="password" id="confirm-password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="h-12 w-12 mx-auto mb-4" />
                  <p>Theme customization coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Third-party Integrations
                </CardTitle>
                <CardDescription>Connect with external services and APIs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">CRM Integration</h4>
                        <p className="text-sm text-muted-foreground">Connect with Salesforce, HubSpot</p>
                      </div>
                      <Switch className="self-start sm:self-center" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Configure</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">Email Marketing</h4>
                        <p className="text-sm text-muted-foreground">Mailchimp, Constant Contact</p>
                      </div>
                      <Switch className="self-start sm:self-center" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Configure</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">Payment Processing</h4>
                        <p className="text-sm text-muted-foreground">Stripe, PayPal, Square</p>
                      </div>
                      <Switch defaultChecked className="self-start sm:self-center" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Configure</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium">MLS Integration</h4>
                        <p className="text-sm text-muted-foreground">Multiple Listing Service</p>
                      </div>
                      <Switch defaultChecked className="self-start sm:self-center" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Configure</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">API Configuration</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>API Base URL</Label>
                      <Input defaultValue="https://api.realtypro.com/v1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Webhook Endpoint</Label>
                      <Input defaultValue="https://your-domain.com/webhook" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rate Limit (requests/minute)</Label>
                        <Input type="number" defaultValue="100" />
                      </div>
                      <div className="space-y-2">
                        <Label>Timeout (seconds)</Label>
                        <Input type="number" defaultValue="30" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>Advanced system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Default Lead Assignment</Label>
                    <Select defaultValue="round-robin">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round-robin">Round Robin</SelectItem>
                        <SelectItem value="skill-based">Skill Based</SelectItem>
                        <SelectItem value="geographic">Geographic</SelectItem>
                        <SelectItem value="manual">Manual Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Auto-backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" defaultValue="60" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum File Upload Size (MB)</Label>
                    <Input type="number" defaultValue="50" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Settings</h4>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <Label>Enable caching</Label>
                        <p className="text-sm text-muted-foreground">Improve application performance</p>
                      </div>
                      <Switch defaultChecked className="self-start sm:self-center" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <Label>Compress images</Label>
                        <p className="text-sm text-muted-foreground">Automatically optimize image uploads</p>
                      </div>
                      <Switch defaultChecked className="self-start sm:self-center" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <Label>Enable maintenance mode</Label>
                        <p className="text-sm text-muted-foreground">Restrict access during updates</p>
                      </div>
                      <Switch className="self-start sm:self-center" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Management
                </CardTitle>
                <CardDescription>Manage your subscription plan and billing information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 md:p-6 border rounded-lg bg-primary/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">Current Plan</h3>
                        <p className="text-sm text-muted-foreground">Professional Plan</p>
                      </div>
                      <Badge variant="secondary" className="self-start sm:self-center">Active</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-xl md:text-2xl font-bold">$99/month</p>
                      <p className="text-sm text-muted-foreground">Billed monthly • Next billing: March 15, 2024</p>
                    </div>
                    <Button className="w-full">Manage Plan</Button>
                  </div>
                  
                  <div className="p-4 md:p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Plan Features</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                        Unlimited properties
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                        Advanced analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                        Priority support
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                        API access
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Payment Method</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Update</Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Billing History</h4>
                  <div className="space-y-2">
                    {[
                      { date: "Feb 15, 2024", amount: "$99.00", status: "Paid" },
                      { date: "Jan 15, 2024", amount: "$99.00", status: "Paid" },
                      { date: "Dec 15, 2023", amount: "$99.00", status: "Paid" }
                    ].map((invoice, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded gap-2">
                        <div>
                          <p className="font-medium">{invoice.date}</p>
                          <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{invoice.status}</Badge>
                          <Button variant="ghost" size="sm" className="w-full sm:w-auto">Download</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive">Cancel Subscription</h4>
                      <p className="text-sm text-muted-foreground">Cancel your subscription at any time</p>
                    </div>
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto">
                      Cancel
                    </Button>
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

export default Settings
