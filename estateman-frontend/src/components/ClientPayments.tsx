import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAppStore } from "@/store/app-store"

export function ClientPayments() {
  const { payments } = useAppStore()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {payments.map((p) => (
          <div key={p.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold">{p.propertyAddress}</div>
                <div className="text-sm text-muted-foreground">Client: {p.clientName}</div>
              </div>
              <Badge variant="outline" className={p.status === 'overdue' ? 'bg-destructive/10 text-destructive border-destructive/20' : p.status === 'completed' ? 'bg-success/10 text-success border-success/20' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                {p.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="font-semibold">${p.amount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Paid</div>
                <div className="font-semibold text-success">${p.paidAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="font-semibold text-primary">${(p.amount - p.paidAmount).toLocaleString()}</div>
              </div>
            </div>
            <Progress value={(p.paidAmount / p.amount) * 100} className="h-2 mb-3" />
            <div className="space-y-2">
              {p.installments.map((i, idx) => (
                <div key={idx} className="flex justify-between text-sm p-2 rounded bg-muted/50">
                  <div className="font-medium">${i.amount.toLocaleString()}</div>
                  <div className="text-muted-foreground">Due: {i.dueDate}</div>
                  <div>
                    <Badge variant="outline" className={i.status === 'overdue' ? 'bg-destructive/10 text-destructive border-destructive/20' : i.status === 'paid' ? 'bg-success/10 text-success border-success/20' : 'bg-blue-100 text-blue-800 border-blue-200'}>
                      {i.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
