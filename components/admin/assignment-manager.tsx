"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Users, UserCheck, Clock } from "lucide-react"

interface AssignmentManagerProps {
  issue: any
  adminUser: any
}

export function AssignmentManager({ issue, adminUser }: AssignmentManagerProps) {
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState(issue.assigned_to || "unassigned")
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  const fetchAdminUsers = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("admin_users")
        .select(`
          id,
          full_name,
          email,
          role,
          is_active,
          departments(name)
        `)
        .eq("is_active", true)
        .order("full_name")

      if (error) throw error
      setAdminUsers(data || [])
    } catch (error) {
      console.error("Error fetching admin users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignment = async () => {
    if (selectedAssignee === issue.assigned_to) return

    setIsUpdating(true)
    try {
      const supabase = createClient()

      // Update the issue assignment
      const { error: updateError } = await supabase
        .from("issues")
        .update({ assigned_to: selectedAssignee || null })
        .eq("id", issue.id)

      if (updateError) throw updateError

      // Create update record
      const assignedUser = adminUsers.find((user) => user.id === selectedAssignee)
      const { error: historyError } = await supabase.from("issue_updates").insert({
        issue_id: issue.id,
        update_type: "assignment",
        old_value: issue.assigned_to ? "Previously assigned" : "Unassigned",
        new_value: assignedUser ? assignedUser.full_name : "Unassigned",
        comment: assignedUser ? `Assigned to ${assignedUser.full_name} (${assignedUser.email})` : "Assignment removed",
        updated_by: adminUser.id,
      })

      if (historyError) throw historyError

      router.refresh()
    } catch (error) {
      console.error("Assignment failed:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const currentAssignee = adminUsers.find((user) => user.id === issue.assigned_to)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assignment
        </CardTitle>
        <CardDescription>Assign this issue to a team member</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Assignment */}
          {currentAssignee && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Currently Assigned</span>
              </div>
              <div className="text-sm">
                <p className="font-medium">{currentAssignee.full_name}</p>
                <p className="text-gray-600">{currentAssignee.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {currentAssignee.role}
                </Badge>
              </div>
            </div>
          )}

          {!currentAssignee && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900">Unassigned</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">This issue needs to be assigned to a team member.</p>
            </div>
          )}

          {/* Assignment Form */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Assign to:</label>
            <Select value={selectedAssignee} onValueChange={setSelectedAssignee} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : "Select team member"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {adminUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-xs text-gray-500">
                          {user.departments?.name} • {user.role}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAssignment}
              disabled={selectedAssignee === issue.assigned_to || isUpdating}
              className="w-full"
            >
              {isUpdating ? "Updating..." : "Update Assignment"}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm font-medium mb-2">Quick Actions:</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssignee(adminUser.id)}
                className="bg-transparent"
              >
                Assign to Me
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAssignee("unassigned")}
                className="bg-transparent"
              >
                Unassign
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
