import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bell, Mail, Settings, AlertTriangle, CheckCircle, User } from "lucide-react"
import Link from "next/link"

async function getNotifications(adminUserId: string) {
  const supabase = await createClient()

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(`
      *,
      issues(title, status, category, location_address)
    `)
    .eq("recipient_id", adminUserId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return notifications || []
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "issue_submitted":
      return <AlertTriangle className="h-5 w-5 text-orange-600" />
    case "status_update":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "assignment":
      return <User className="h-5 w-5 text-blue-600" />
    default:
      return <Bell className="h-5 w-5 text-gray-600" />
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case "issue_submitted":
      return "bg-orange-100 text-orange-800"
    case "status_update":
      return "bg-green-100 text-green-800"
    case "assignment":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/admin/login")
  }

  // Check if user is an admin
  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!adminUser) {
    redirect("/admin/login")
  }

  const notifications = await getNotifications(adminUser.id)
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                </p>
              </div>
            </div>
            <Link href="/admin/notifications/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`transition-all ${!notification.is_read ? "border-blue-200 bg-blue-50/30" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">{getNotificationIcon(notification.notification_type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3
                          className={`text-lg font-semibold ${!notification.is_read ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.is_read && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              New
                            </Badge>
                          )}
                          <Badge variant="outline" className={getNotificationColor(notification.notification_type)}>
                            {notification.notification_type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{notification.message}</p>

                      {notification.issues && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <h4 className="font-medium text-gray-900 mb-1">Related Issue:</h4>
                          <p className="text-sm text-gray-600 mb-2">{notification.issues.title}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Status: {notification.issues.status.replace("_", " ")}</span>
                            <span>Category: {notification.issues.category}</span>
                            {notification.issues.location_address && (
                              <span>Location: {notification.issues.location_address}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                          {notification.sent_via_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>Email sent</span>
                            </div>
                          )}
                        </div>

                        {notification.issue_id && (
                          <Link href={`/admin/issues/${notification.issue_id}`}>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              View Issue
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
