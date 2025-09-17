"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Mail, Bell } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    new_issues: true,
    status_changes: true,
    assignments: true,
    high_priority_only: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin/login")
        return
      }

      // Get admin user info
      const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

      if (!adminData) {
        router.push("/admin/login")
        return
      }

      setAdminUser(adminData)

      // Get notification preferences
      const { data: prefs, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("admin_user_id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (prefs) {
        setPreferences({
          email_notifications: prefs.email_notifications,
          new_issues: prefs.new_issues,
          status_changes: prefs.status_changes,
          assignments: prefs.assignments,
          high_priority_only: prefs.high_priority_only,
        })
      }
    } catch (error) {
      console.error("Error fetching preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const savePreferences = async () => {
    if (!adminUser) return

    setIsSaving(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from("notification_preferences").upsert({
        admin_user_id: adminUser.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // Show success message or redirect
      router.push("/admin/notifications")
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/notifications">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notifications
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
              <p className="text-gray-600">Customize how and when you receive notifications</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>Control whether you receive email notifications for various events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Enable Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email in addition to in-app notifications
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => handlePreferenceChange("email_notifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                In-App Notifications
              </CardTitle>
              <CardDescription>Choose which types of events trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-issues" className="text-base font-medium">
                    New Issues
                  </Label>
                  <p className="text-sm text-gray-600">Get notified when new issues are reported in your department</p>
                </div>
                <Switch
                  id="new-issues"
                  checked={preferences.new_issues}
                  onCheckedChange={(checked) => handlePreferenceChange("new_issues", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="status-changes" className="text-base font-medium">
                    Status Changes
                  </Label>
                  <p className="text-sm text-gray-600">Get notified when issue statuses are updated</p>
                </div>
                <Switch
                  id="status-changes"
                  checked={preferences.status_changes}
                  onCheckedChange={(checked) => handlePreferenceChange("status_changes", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="assignments" className="text-base font-medium">
                    Assignments
                  </Label>
                  <p className="text-sm text-gray-600">Get notified when issues are assigned to you or your team</p>
                </div>
                <Switch
                  id="assignments"
                  checked={preferences.assignments}
                  onCheckedChange={(checked) => handlePreferenceChange("assignments", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-priority" className="text-base font-medium">
                    High Priority Only
                  </Label>
                  <p className="text-sm text-gray-600">
                    Only receive notifications for high priority and urgent issues
                  </p>
                </div>
                <Switch
                  id="high-priority"
                  checked={preferences.high_priority_only}
                  onCheckedChange={(checked) => handlePreferenceChange("high_priority_only", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
