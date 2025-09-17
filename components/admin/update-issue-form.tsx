"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

interface UpdateIssueFormProps {
  issue: any
  adminUser: any
}

export function UpdateIssueForm({ issue, adminUser }: UpdateIssueFormProps) {
  const [status, setStatus] = useState(issue.status)
  const [priority, setPriority] = useState(issue.priority)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Update the issue
      const updates: any = {}
      if (status !== issue.status) {
        updates.status = status
        if (status === "resolved") {
          updates.resolved_at = new Date().toISOString()
        }
      }
      if (priority !== issue.priority) {
        updates.priority = priority
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase.from("issues").update(updates).eq("id", issue.id)

        if (updateError) throw updateError
      }

      // Create update records
      const updateRecords = []

      if (status !== issue.status) {
        updateRecords.push({
          issue_id: issue.id,
          update_type: "status_change",
          old_value: issue.status,
          new_value: status,
          updated_by: adminUser.id,
        })
      }

      if (priority !== issue.priority) {
        updateRecords.push({
          issue_id: issue.id,
          update_type: "assignment",
          old_value: issue.priority,
          new_value: priority,
          updated_by: adminUser.id,
        })
      }

      if (comment.trim()) {
        updateRecords.push({
          issue_id: issue.id,
          update_type: "comment",
          comment: comment.trim(),
          updated_by: adminUser.id,
        })
      }

      if (updateRecords.length > 0) {
        const { error: historyError } = await supabase.from("issue_updates").insert(updateRecords)

        if (historyError) throw historyError
      }

      // Reset form
      setComment("")

      // Refresh the page to show updates
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to update issue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Issue</CardTitle>
        <CardDescription>Change status, priority, or add comments</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Add Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add a comment about this update..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || (status === issue.status && priority === issue.priority && !comment.trim())}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Updating..." : "Update Issue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
