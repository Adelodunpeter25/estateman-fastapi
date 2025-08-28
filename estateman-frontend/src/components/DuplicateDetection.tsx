import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Users, AlertTriangle, CheckCircle } from "lucide-react"
import { clientsService } from "@/services/clients"

interface Duplicate {
  client_id: number
  client_name: string
  email: string
  phone: string
  similarity_score: number
  match_criteria: string[]
}

export function DuplicateDetection() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [duplicates, setDuplicates] = useState<Duplicate[]>([])
  const [loading, setLoading] = useState(false)
  const [merging, setMerging] = useState<number | null>(null)

  const handleSearch = async () => {
    if (!email && !phone) {
      alert("Please enter email or phone number")
      return
    }

    try {
      setLoading(true)
      const results = await clientsService.detectDuplicates(email, phone)
      setDuplicates(results)
    } catch (error) {
      console.error("Duplicate detection failed:", error)
      alert("Failed to detect duplicates")
    } finally {
      setLoading(false)
    }
  }

  const handleMerge = async (primaryId: number, duplicateId: number) => {
    if (!confirm("Are you sure you want to merge these clients? This action cannot be undone.")) {
      return
    }

    try {
      setMerging(duplicateId)
      await clientsService.mergeClients(primaryId, duplicateId)
      setDuplicates(prev => prev.filter(d => d.client_id !== duplicateId))
      alert("Clients merged successfully")
    } catch (error) {
      console.error("Merge failed:", error)
      alert("Failed to merge clients")
    } finally {
      setMerging(null)
    }
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 95) return "bg-red-100 text-red-800"
    if (score >= 80) return "bg-yellow-100 text-yellow-800"
    return "bg-blue-100 text-blue-800"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Duplicate Detection
        </CardTitle>
        <CardDescription>
          Find and merge duplicate client records to maintain data quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email to search"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter phone to search"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSearch} disabled={loading} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search for Duplicates"}
        </Button>

        {duplicates.length > 0 && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {duplicates.length} potential duplicate(s). Review and merge as needed.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {duplicates.map((duplicate) => (
                <Card key={duplicate.client_id} className="border-l-4 border-l-yellow-400">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{duplicate.client_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Email: {duplicate.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Phone: {duplicate.phone || "Not provided"}
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSimilarityColor(duplicate.similarity_score)}>
                            {duplicate.similarity_score}% match
                          </Badge>
                          <Badge variant="outline">
                            Matched: {duplicate.match_criteria.join(", ")}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMerge(duplicates[0].client_id, duplicate.client_id)}
                          disabled={merging === duplicate.client_id}
                        >
                          {merging === duplicate.client_id ? "Merging..." : "Merge"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {duplicates.length === 0 && !loading && (email || phone) && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No duplicates found for the provided search criteria.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}