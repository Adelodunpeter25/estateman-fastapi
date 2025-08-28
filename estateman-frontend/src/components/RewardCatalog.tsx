import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Gift, Plus, Star, ShoppingCart } from "lucide-react"
import { clientsService } from "@/services/clients"

interface Reward {
  id: number
  name: string
  description: string
  points_required: number
  category: string
  image_url?: string
  is_active: boolean
}

export function RewardCatalog() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [rewardForm, setRewardForm] = useState({
    name: "",
    description: "",
    points_required: 0,
    category: ""
  })

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    try {
      setLoading(true)
      const data = await clientsService.getRewards()
      setRewards(data)
    } catch (error) {
      console.error("Failed to load rewards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReward = async () => {
    if (!rewardForm.name || !rewardForm.description || !rewardForm.points_required) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const newReward = await clientsService.createReward(rewardForm)
      setRewards(prev => [...prev, newReward])
      setRewardForm({ name: "", description: "", points_required: 0, category: "" })
      setShowCreateDialog(false)
      alert("Reward created successfully")
    } catch (error) {
      console.error("Failed to create reward:", error)
      alert("Failed to create reward")
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemReward = async (clientId: number, rewardId: number) => {
    const clientIdInput = prompt("Enter Client ID to redeem reward:")
    if (!clientIdInput) return
    
    const id = parseInt(clientIdInput)
    if (isNaN(id)) {
      alert("Invalid client ID")
      return
    }

    try {
      setLoading(true)
      const result = await clientsService.redeemReward(id, rewardId)
      if (result.success) {
        alert("Reward redeemed successfully!")
      } else {
        alert(result.message || "Failed to redeem reward")
      }
    } catch (error) {
      console.error("Failed to redeem reward:", error)
      alert("Failed to redeem reward")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "gift_card": "bg-blue-100 text-blue-800",
      "discount": "bg-green-100 text-green-800",
      "service": "bg-purple-100 text-purple-800",
      "merchandise": "bg-orange-100 text-orange-800",
      "experience": "bg-pink-100 text-pink-800"
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Reward Catalog
            </CardTitle>
            <CardDescription>
              Manage loyalty rewards and redemption options for clients
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Reward
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Reward</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reward Name</Label>
                  <Input
                    placeholder="$50 Gift Card"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the reward..."
                    rows={3}
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Points Required</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={rewardForm.points_required || ""}
                    onChange={(e) => setRewardForm({...rewardForm, points_required: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="gift_card, discount, service, etc."
                    value={rewardForm.category}
                    onChange={(e) => setRewardForm({...rewardForm, category: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateReward} disabled={loading}>
                    {loading ? "Creating..." : "Create Reward"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading && rewards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading rewards...
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No rewards available. Create your first reward to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {reward.description}
                        </p>
                      </div>
                      {reward.category && (
                        <Badge className={getCategoryColor(reward.category)}>
                          {reward.category.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{reward.points_required} pts</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRedeemReward(0, reward.id)}
                        disabled={loading || !reward.is_active}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Redeem
                      </Button>
                    </div>
                    
                    {!reward.is_active && (
                      <Badge variant="secondary" className="w-full justify-center">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}