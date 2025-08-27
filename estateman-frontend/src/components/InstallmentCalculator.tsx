import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, DollarSign } from "lucide-react"

interface InstallmentSchedule {
  installmentNumber: number
  amount: number
  dueDate: string
  interestAmount: number
  principalAmount: number
  remainingBalance: number
}

export function InstallmentCalculator() {
  const [loanAmount, setLoanAmount] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [loanTerm, setLoanTerm] = useState("")
  const [paymentFrequency, setPaymentFrequency] = useState("monthly")
  const [schedule, setSchedule] = useState<InstallmentSchedule[]>([])
  const [monthlyPayment, setMonthlyPayment] = useState(0)

  const calculateInstallments = () => {
    const principal = parseFloat(loanAmount)
    const annualRate = parseFloat(interestRate) / 100
    const years = parseFloat(loanTerm)
    
    if (!principal || !annualRate || !years) return

    let periods: number
    let periodicRate: number

    switch (paymentFrequency) {
      case "weekly":
        periods = years * 52
        periodicRate = annualRate / 52
        break
      case "monthly":
        periods = years * 12
        periodicRate = annualRate / 12
        break
      case "quarterly":
        periods = years * 4
        periodicRate = annualRate / 4
        break
      case "yearly":
        periods = years
        periodicRate = annualRate
        break
      default:
        periods = years * 12
        periodicRate = annualRate / 12
    }

    // Calculate monthly payment using loan formula
    const payment = (principal * periodicRate * Math.pow(1 + periodicRate, periods)) / 
                   (Math.pow(1 + periodicRate, periods) - 1)

    setMonthlyPayment(payment)

    // Generate amortization schedule
    const scheduleArray: InstallmentSchedule[] = []
    let remainingBalance = principal
    const startDate = new Date()

    for (let i = 1; i <= periods; i++) {
      const interestPayment = remainingBalance * periodicRate
      const principalPayment = payment - interestPayment
      remainingBalance -= principalPayment

      const dueDate = new Date(startDate)
      switch (paymentFrequency) {
        case "weekly":
          dueDate.setDate(startDate.getDate() + (i * 7))
          break
        case "monthly":
          dueDate.setMonth(startDate.getMonth() + i)
          break
        case "quarterly":
          dueDate.setMonth(startDate.getMonth() + (i * 3))
          break
        case "yearly":
          dueDate.setFullYear(startDate.getFullYear() + i)
          break
      }

      scheduleArray.push({
        installmentNumber: i,
        amount: payment,
        dueDate: dueDate.toLocaleDateString(),
        interestAmount: interestPayment,
        principalAmount: principalPayment,
        remainingBalance: Math.max(0, remainingBalance)
      })

      if (remainingBalance <= 0) break
    }

    setSchedule(scheduleArray)
  }

  const clearCalculation = () => {
    setLoanAmount("")
    setInterestRate("")
    setLoanTerm("")
    setSchedule([])
    setMonthlyPayment(0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Installment Payment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="loan-amount">Loan Amount ($)</Label>
              <Input
                id="loan-amount"
                type="number"
                placeholder="500000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
              <Input
                id="interest-rate"
                type="number"
                step="0.01"
                placeholder="5.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-term">Loan Term (Years)</Label>
              <Input
                id="loan-term"
                type="number"
                placeholder="30"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-frequency">Payment Frequency</Label>
              <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={calculateInstallments} className="bg-primary">
              Calculate Payments
            </Button>
            <Button variant="outline" onClick={clearCalculation}>
              Clear
            </Button>
          </div>

          {monthlyPayment > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-success" />
                <span className="font-semibold">Payment Summary</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Amount</p>
                  <p className="text-xl font-bold text-success">${monthlyPayment.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-xl font-bold">{schedule.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-xl font-bold text-primary">
                    ${(schedule.reduce((sum, payment) => sum + payment.interestAmount, 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Due Date</th>
                    <th className="text-left p-2">Payment</th>
                    <th className="text-left p-2">Principal</th>
                    <th className="text-left p-2">Interest</th>
                    <th className="text-left p-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.slice(0, 12).map((payment) => (
                    <tr key={payment.installmentNumber} className="border-b">
                      <td className="p-2">{payment.installmentNumber}</td>
                      <td className="p-2">{payment.dueDate}</td>
                      <td className="p-2">${payment.amount.toFixed(2)}</td>
                      <td className="p-2">${payment.principalAmount.toFixed(2)}</td>
                      <td className="p-2">${payment.interestAmount.toFixed(2)}</td>
                      <td className="p-2">${payment.remainingBalance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {schedule.length > 12 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Showing first 12 payments of {schedule.length} total payments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}