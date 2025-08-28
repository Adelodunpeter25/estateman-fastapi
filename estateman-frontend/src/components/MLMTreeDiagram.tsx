import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Minus, Plus } from "lucide-react"
import { mlmService, type MLMTreeNode as APITreeNode } from "@/services/mlm"

interface TreeNode {
  id: string
  name: string
  level: string
  referral_id: string
  direct_referrals: number
  monthly_commission: number
  children: TreeNode[]
  avatar?: string
}



interface MLMTreeDiagramProps {
  isOpen: boolean
  onClose: () => void
  partnerId?: string
  partnerName?: string
}

const TreeNodeComponent = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Diamond Partner":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Gold Partner":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Silver Partner":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Bronze Partner":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className="relative bg-card border rounded-lg p-4 shadow-sm min-w-[280px] max-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={node.avatar} />
              <AvatarFallback>
                {node.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-sm">{node.name}</h4>
              <p className="text-xs text-muted-foreground">ID: {node.referral_id}</p>
            </div>
          </div>
          {node.children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </Button>
          )}
        </div>
        
        <Badge variant="outline" className={`${getLevelColor(node.level)} text-xs mb-2`}>
          {node.level}
        </Badge>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span>{node.direct_referrals}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-success" />
            <span className="text-success">${node.monthly_commission.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Connection Line */}
      {node.children.length > 0 && isExpanded && (
        <div className="w-1.5 h-6 bg-[hsl(var(--mlm-line))]" />
      )}

      {/* Children */}
      {node.children.length > 0 && isExpanded && (
        <div className="flex flex-col items-center">
          {/* Horizontal Line */}
          <div className="flex items-center">
            <div className={`${node.children.length > 1 ? 'w-12' : 'w-0'} h-1.5 bg-[hsl(var(--mlm-line))]`} />
            {node.children.length > 1 && (
              <>
                {node.children.slice(1).map((_, index) => (
                  <div key={index} className="w-24 h-1.5 bg-[hsl(var(--mlm-line))]" />
                ))}
                <div className="w-12 h-1.5 bg-[hsl(var(--mlm-line))]" />
              </>
            )}
          </div>
          
          {/* Children Nodes */}
          <div className="flex gap-8 pt-2">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-1.5 h-4 bg-[hsl(var(--mlm-line))]" />
                <TreeNodeComponent node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function MLMTreeDiagram({ isOpen, onClose, partnerId, partnerName }: MLMTreeDiagramProps) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && partnerId) {
      fetchTreeData()
    }
  }, [isOpen, partnerId])

  const fetchTreeData = async () => {
    if (!partnerId) return
    
    setLoading(true)
    try {
      const data = await mlmService.getMLMTree(parseInt(partnerId))
      // Convert API response to component format
      const convertNode = (node: APITreeNode): TreeNode => ({
        id: node.id,
        name: node.name,
        level: node.level,
        referral_id: node.referral_id,
        direct_referrals: node.direct_referrals,
        monthly_commission: node.monthly_commission,
        children: node.children.map(convertNode),
        avatar: node.avatar
      })
      setTreeData(convertNode(data))
    } catch (error) {
      console.error('Error fetching MLM tree:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateNetworkStats = (node: TreeNode): { size: number, depth: number, totalCommission: number, totalEarnings: number } => {
    let size = 1
    let maxDepth = 0
    let totalCommission = node.monthly_commission
    let totalEarnings = node.monthly_commission * 12 // Estimate annual

    const traverse = (n: TreeNode, currentDepth: number) => {
      maxDepth = Math.max(maxDepth, currentDepth)
      n.children.forEach(child => {
        size++
        totalCommission += child.monthly_commission
        totalEarnings += child.monthly_commission * 12
        traverse(child, currentDepth + 1)
      })
    }

    node.children.forEach(child => traverse(child, 1))
    return { size, depth: maxDepth, totalCommission, totalEarnings }
  }

  const stats = treeData ? calculateNetworkStats(treeData) : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            MLM Network Tree {partnerName && `- ${partnerName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-muted-foreground">Loading network tree...</div>
            </div>
          ) : treeData ? (
            <>
              <div className="flex justify-center">
                <TreeNodeComponent node={treeData} />
              </div>
              
              {stats && (
                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Network Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Network Size</p>
                      <p className="font-semibold">{stats.size} members</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Network Depth</p>
                      <p className="font-semibold">{stats.depth} levels</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Commission</p>
                      <p className="font-semibold text-success">${stats.totalCommission.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Est. Annual Earnings</p>
                      <p className="font-semibold text-primary">${stats.totalEarnings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="text-muted-foreground">No network data available</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}