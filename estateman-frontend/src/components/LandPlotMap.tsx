import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Map as MapIcon, 
  Upload, 
  Download, 
  Eye, 
  Edit3, 
  Square,
  Plus,
  Info
} from "lucide-react"

interface Plot {
  id: string
  coordinates: [number, number][]
  status: 'available' | 'sold' | 'reserved' | 'development'
  price: number
  size: number
  plotNumber: string
  type: string
}

interface LandPlotMapProps {
  landData: {
    totalArea: string
    totalPlots: number
    plots: Plot[]
  }
}

export function LandPlotMap({ landData }: LandPlotMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPlotDialog, setShowPlotDialog] = useState(false)

  const plotColors = {
    available: '#22c55e',
    sold: '#ef4444', 
    reserved: '#f59e0b',
    development: '#8b5cf6'
  }

  const plotStats = {
    available: landData.plots.filter(p => p.status === 'available').length,
    sold: landData.plots.filter(p => p.status === 'sold').length,
    reserved: landData.plots.filter(p => p.status === 'reserved').length,
    development: landData.plots.filter(p => p.status === 'development').length
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    // Draw plots
    landData.plots.forEach(plot => {
      ctx.beginPath()
      ctx.moveTo(plot.coordinates[0][0] * canvas.offsetWidth, plot.coordinates[0][1] * canvas.offsetHeight)
      
      for (let i = 1; i < plot.coordinates.length; i++) {
        ctx.lineTo(plot.coordinates[i][0] * canvas.offsetWidth, plot.coordinates[i][1] * canvas.offsetHeight)
      }
      
      ctx.closePath()
      
      // Fill plot with status color
      ctx.fillStyle = hoveredPlot?.id === plot.id ? 
        plotColors[plot.status] + '80' : 
        plotColors[plot.status] + '60'
      ctx.fill()
      
      // Draw border
      ctx.strokeStyle = plotColors[plot.status]
      ctx.lineWidth = selectedPlot?.id === plot.id ? 3 : 1
      ctx.stroke()
      
      // Draw plot number
      const centerX = plot.coordinates.reduce((sum, coord) => sum + coord[0], 0) / plot.coordinates.length * canvas.offsetWidth
      const centerY = plot.coordinates.reduce((sum, coord) => sum + coord[1], 0) / plot.coordinates.length * canvas.offsetHeight
      
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(plot.plotNumber, centerX, centerY)
    })
  }, [landData.plots, selectedPlot, hoveredPlot])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / canvas.offsetWidth
    const y = (event.clientY - rect.top) / canvas.offsetHeight

    // Find clicked plot
    const clickedPlot = landData.plots.find(plot => {
      // Simple point-in-polygon check
      let inside = false
      const coords = plot.coordinates
      for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        if (((coords[i][1] > y) !== (coords[j][1] > y)) &&
            (x < (coords[j][0] - coords[i][0]) * (y - coords[i][1]) / (coords[j][1] - coords[i][1]) + coords[i][0])) {
          inside = !inside
        }
      }
      return inside
    })

    if (clickedPlot) {
      setSelectedPlot(clickedPlot)
      setShowPlotDialog(true)
    }
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / canvas.offsetWidth
    const y = (event.clientY - rect.top) / canvas.offsetHeight

    // Find hovered plot
    const hoveredPlot = landData.plots.find(plot => {
      let inside = false
      const coords = plot.coordinates
      for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        if (((coords[i][1] > y) !== (coords[j][1] > y)) &&
            (x < (coords[j][0] - coords[i][0]) * (y - coords[i][1]) / (coords[j][1] - coords[i][1]) + coords[i][0])) {
          inside = !inside
        }
      }
      return inside
    })

    setHoveredPlot(hoveredPlot || null)
    canvas.style.cursor = hoveredPlot ? 'pointer' : 'default'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            <CardTitle>Interactive Land Plot Map</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditMode ? 'View Mode' : 'Edit Mode'}
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Map
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Map Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Square className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{landData.totalPlots}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Plots</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="font-semibold">{plotStats.available}</span>
            </div>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span className="font-semibold">{plotStats.sold}</span>
            </div>
            <p className="text-xs text-muted-foreground">Sold</p>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="font-semibold">{plotStats.reserved}</span>
            </div>
            <p className="text-xs text-muted-foreground">Reserved</p>
          </div>
          <div className="text-center p-3 bg-purple-100 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-semibold">{plotStats.development}</span>
            </div>
            <p className="text-xs text-muted-foreground">Development</p>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="w-full h-96 border rounded-lg bg-gray-50"
            style={{ maxWidth: '100%' }}
          />
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
            <h4 className="font-medium mb-2 text-sm">Plot Status</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-success rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-destructive rounded"></div>
                <span>Sold</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-warning rounded"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Development</span>
              </div>
            </div>
          </div>

          {/* Hover Info */}
          {hoveredPlot && (
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
              <h4 className="font-medium">Plot {hoveredPlot.plotNumber}</h4>
              <p className="text-sm text-muted-foreground">{hoveredPlot.size} sq ft</p>
              <p className="text-sm font-medium">${hoveredPlot.price.toLocaleString()}</p>
              <Badge variant="outline" className={`text-xs mt-1 ${
                hoveredPlot.status === 'available' ? 'bg-success/10 text-success' :
                hoveredPlot.status === 'sold' ? 'bg-destructive/10 text-destructive' :
                hoveredPlot.status === 'reserved' ? 'bg-warning/10 text-warning' :
                'bg-purple-100 text-purple-700'
              }`}>
                {hoveredPlot.status}
              </Badge>
            </div>
          )}
        </div>

        {/* Plot Details Dialog */}
        <Dialog open={showPlotDialog} onOpenChange={setShowPlotDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Plot {selectedPlot?.plotNumber} Details</DialogTitle>
            </DialogHeader>
            {selectedPlot && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Plot Number</Label>
                    <Input value={selectedPlot.plotNumber} readOnly={!isEditMode} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    {isEditMode ? (
                      <Select defaultValue={selectedPlot.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={selectedPlot.status} readOnly />
                    )}
                  </div>
                  <div>
                    <Label>Size (sq ft)</Label>
                    <Input 
                      type="number" 
                      value={selectedPlot.size} 
                      readOnly={!isEditMode} 
                    />
                  </div>
                  <div>
                    <Label>Price ($)</Label>
                    <Input 
                      type="number" 
                      value={selectedPlot.price} 
                      readOnly={!isEditMode} 
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Plot Type</Label>
                    <Input value={selectedPlot.type} readOnly={!isEditMode} />
                  </div>
                </div>
                
                {isEditMode && (
                  <div className="flex gap-2">
                    <Button>Save Changes</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}