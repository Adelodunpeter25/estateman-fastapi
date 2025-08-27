import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Minus, Plus } from "lucide-react"

interface TreeNode {
  id: string
  name: string
  level: string
  referralId: string
  directReferrals: number
  monthlyCommission: number
  children: TreeNode[]
  avatar?: string
}

const sampleTreeData: TreeNode = {
  id: "1",
  name: "Sarah Johnson",
  level: "Diamond Partner",
  referralId: "SJ2024001",
  directReferrals: 24,
  monthlyCommission: 15420,
  avatar: "/placeholder.svg",
  children: [
    {
      id: "2",
      name: "Mike Chen",
      level: "Gold Partner", 
      referralId: "MC2024002",
      directReferrals: 18,
      monthlyCommission: 11280,
      children: [
        {
          id: "4",
          name: "James Wilson",
          level: "Bronze Partner",
          referralId: "JW2024004", 
          directReferrals: 8,
          monthlyCommission: 3450,
          children: [
            {
              id: "7",
              name: "Lisa Park",
              level: "Associate",
              referralId: "LP2024007",
              directReferrals: 3,
              monthlyCommission: 850,
              children: []
            },
            {
              id: "8", 
              name: "Tom Lee",
              level: "Associate",
              referralId: "TL2024008",
              directReferrals: 2,
              monthlyCommission: 650,
              children: []
            }
          ]
        },
        {
          id: "5",
          name: "Anna Kim",
          level: "Silver Partner",
          referralId: "AK2024005",
          directReferrals: 12,
          monthlyCommission: 6890,
          children: [
            {
              id: "9",
              name: "David Liu",
              level: "Associate", 
              referralId: "DL2024009",
              directReferrals: 5,
              monthlyCommission: 1250,
              children: []
            }
          ]
        }
      ]
    },
    {
      id: "3",
      name: "Emily Davis",
      level: "Silver Partner",
      referralId: "ED2024003",
      directReferrals: 12,
      monthlyCommission: 6890,
      children: [
        {
          id: "6",
          name: "Robert Taylor",
          level: "Bronze Partner",
          referralId: "RT2024006",
          directReferrals: 6,
          monthlyCommission: 2340,
          children: [
            {
              id: "10",
              name: "Maria Garcia",
              level: "Associate",
              referralId: "MG2024010",
              directReferrals: 1,
              monthlyCommission: 320,
              children: []
            }
          ]
        }
      ]
    }
  ]
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
              <p className="text-xs text-muted-foreground">ID: {node.referralId}</p>
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
            <span>{node.directReferrals}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-success" />
            <span className="text-success">${node.monthlyCommission.toLocaleString()}</span>
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            MLM Network Tree {partnerName && `- ${partnerName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 overflow-auto">
          <div className="flex justify-center">
            <TreeNodeComponent node={sampleTreeData} />
          </div>
          
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Network Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Network Size</p>
                <p className="font-semibold">187 members</p>
              </div>
              <div>
                <p className="text-muted-foreground">Network Depth</p>
                <p className="font-semibold">4 levels</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Commission</p>
                <p className="font-semibold text-success">$37,840</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Earnings</p>
                <p className="font-semibold text-primary">$287,650</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}