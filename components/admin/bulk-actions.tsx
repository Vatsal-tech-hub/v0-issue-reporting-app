"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CheckSquare, Square } from "lucide-react"

interface BulkActionsProps {
  issues: any[]
  adminUser: any
}

export function BulkActions({ issues, adminUser }: BulkActionsProps) {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleSelectAll = () => {
    if (selectedIssues.length === issues.length) {
      setSelectedIssues([])
    } else {
      setSelectedIssues(issues.map((issue) => issue.id))
    }
  }

  const handleSelectIssue = (issueId: string) => {
    setSelectedIssues((prev) => (prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]))
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIssues.length === 0) return

    setIsProcessing(true)

    try {
      const supabase = createClient()

      // Prepare updates based on action
      let updates: any = {}
      let updateType = ""

      switch (bulkAction) {
        case "mark_in_progress":
          updates = { status: "in_progress" }
          updateType = "status_change"
          break
        case "mark_resolved":
          updates = { status: "resolved", resolved_at: new Date().toISOString() }
          updateType = "status_change"
          break
        case "set_high_priority":
          updates = { priority: "high" }
          updateType = "assignment"
          break
        case "set_medium_priority":
          updates = { priority: "medium" }
          updateType = "assignment"
          break
        case "assign_to_me":
          updates = { assigned_to: adminUser.id }
          updateType = "assignment"
          break
      }

      // Update all selected issues
      const { error: updateError } = await supabase.from("issues").update(updates).in("id", selectedIssues)

      if (updateError) throw updateError

      // Create update records for tracking
      const updateRecords = selectedIssues.map((issueId) => ({
        issue_id: issueId,
        update_type: updateType,
        new_value: Object.values(updates)[0],
        comment: `Bulk action: ${bulkAction.replace("_", " ")}`,
        updated_by: adminUser.id,
      }))

      const { error: historyError } = await supabase.from("issue_updates").insert(updateRecords)

      if (historyError) throw historyError

      // Reset selections and refresh
      setSelectedIssues([])
      setBulkAction("")
      router.refresh()
    } catch (error) {
      console.error("Bulk action failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (issues.length === 0) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2 bg-transparent"
          >
            {selectedIssues.length === issues.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedIssues.length === issues.length ? "Deselect All" : "Select All"}
          </Button>

          {selectedIssues.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedIssues.length} selected
            </Badge>
          )}
        </div>

        {selectedIssues.length > 0 && (
          <div className="flex items-center gap-3">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mark_in_progress">Mark as In Progress</SelectItem>
                <SelectItem value="mark_resolved">Mark as Resolved</SelectItem>
                <SelectItem value="set_high_priority">Set High Priority</SelectItem>
                <SelectItem value="set_medium_priority">Set Medium Priority</SelectItem>
                <SelectItem value="assign_to_me">Assign to Me</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleBulkAction} disabled={!bulkAction || isProcessing} size="sm">
              {isProcessing ? "Processing..." : "Apply"}
            </Button>
          </div>
        )}
      </div>

      {/* Issue Selection List */}
      {selectedIssues.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {issues
              .filter((issue) => selectedIssues.includes(issue.id))
              .map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm"
                  onClick={() => handleSelectIssue(issue.id)}
                >
                  <Checkbox checked={true} className="shrink-0" />
                  <span className="truncate">{issue.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Individual issue selection component
export function IssueSelector({ issue, isSelected, onSelect }: any) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Checkbox checked={isSelected} onCheckedChange={() => onSelect(issue.id)} />
    </div>
  )
}
