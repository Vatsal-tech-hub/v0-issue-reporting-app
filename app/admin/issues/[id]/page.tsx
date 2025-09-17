import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, User, Mail, Phone, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { UpdateIssueForm } from "@/components/admin/update-issue-form"
import { AssignmentManager } from "@/components/admin/assignment-manager"

async function getIssue(id: string) {
  const supabase = await createClient()

  const { data: issue, error } = await supabase
    .from("issues")
    .select(`
      *,
      admin_users!issues_assigned_to_fkey(full_name, email, role)
    `)
    .eq("id", id)
    .single()

  if (error || !issue) {
    return null
  }

  // Get issue updates with admin user info
  const { data: updates } = await supabase
    .from("issue_updates")
    .select(`
      *,
      admin_users!issue_updates_updated_by_fkey(full_name, email)
    `)
    .eq("issue_id", id)
    .order("created_at", { ascending: false })

  return { issue, updates: updates || [] }
}

function getStatusColor(status: string) {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800 border-green-200"
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "submitted":
      return "bg-orange-100 text-orange-800 border-orange-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "pothole":
      return "bg-red-100 text-red-800"
    case "streetlight":
      return "bg-yellow-100 text-yellow-800"
    case "sanitation":
      return "bg-green-100 text-green-800"
    case "traffic":
      return "bg-blue-100 text-blue-800"
    case "vandalism":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default async function AdminIssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

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

  const data = await getIssue(id)
  if (!data) {
    notFound()
  }

  const { issue, updates } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/issues">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Issues
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issue Details</h1>
              <p className="text-gray-600">ID: {issue.id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Issue Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-balance">{issue.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Reported on {new Date(issue.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className={getStatusColor(issue.status)}>
                    {issue.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className={getCategoryColor(issue.category)}>
                    {issue.category.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                    {issue.priority} priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-600">{issue.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-1 shrink-0" />
                      <span>{issue.location_address}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Assigned Department</h4>
                    <p className="text-gray-600">{issue.assigned_department}</p>
                  </div>
                  {issue.admin_users && (
                    <div>
                      <h4 className="font-semibold mb-2">Assigned To</h4>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{issue.admin_users.full_name}</span>
                        <Badge variant="secondary">{issue.admin_users.role}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Update Issue Form */}
            <UpdateIssueForm issue={issue} adminUser={adminUser} />

            {/* Issue History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Issue History
                </CardTitle>
                <CardDescription>Timeline of updates and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Initial submission */}
                  <div className="flex gap-4 pb-4 border-b border-gray-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Issue Submitted</h5>
                      <p className="text-sm text-gray-600">
                        Initial report submitted by {issue.citizen_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(issue.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Updates */}
                  {updates.map((update: any) => (
                    <div key={update.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold capitalize">{update.update_type.replace("_", " ")}</h5>
                        {update.old_value && update.new_value && (
                          <p className="text-sm text-gray-600">
                            Changed from "{update.old_value}" to "{update.new_value}"
                          </p>
                        )}
                        {update.comment && <p className="text-sm text-gray-600 mt-1">{update.comment}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(update.created_at).toLocaleString()}
                          {update.admin_users?.full_name && ` by ${update.admin_users.full_name}`}
                        </p>
                      </div>
                    </div>
                  ))}

                  {updates.length === 0 && <p className="text-center text-gray-500 py-4">No updates yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Manager */}
            <AssignmentManager issue={issue} adminUser={adminUser} />

            {/* Reporter Information */}
            <Card>
              <CardHeader>
                <CardTitle>Reporter Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issue.citizen_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{issue.citizen_name}</span>
                    </div>
                  )}
                  {issue.citizen_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{issue.citizen_email}</span>
                    </div>
                  )}
                  {issue.citizen_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{issue.citizen_phone}</span>
                    </div>
                  )}
                  {!issue.citizen_name && !issue.citizen_email && !issue.citizen_phone && (
                    <p className="text-sm text-gray-500">Anonymous report</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Issue Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span>{new Date(issue.updated_at).toLocaleDateString()}</span>
                  </div>
                  {issue.resolved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Resolved:</span>
                      <span>{new Date(issue.resolved_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority:</span>
                    <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
