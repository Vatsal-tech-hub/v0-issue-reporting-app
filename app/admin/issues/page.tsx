import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { BulkActions, IssueSelector } from "@/components/admin/bulk-actions"
import { AdvancedFilters } from "@/components/admin/advanced-filters"

async function getIssues(searchParams: any) {
  const supabase = await createClient()

  let query = supabase
    .from("issues")
    .select(`
      *,
      admin_users!issues_assigned_to_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false })

  // Apply filters
  if (searchParams.status && searchParams.status !== "all") {
    query = query.eq("status", searchParams.status)
  }
  if (searchParams.category && searchParams.category !== "all") {
    query = query.eq("category", searchParams.category)
  }
  if (searchParams.priority && searchParams.priority !== "all") {
    query = query.eq("priority", searchParams.priority)
  }
  if (searchParams.department && searchParams.department !== "all") {
    query = query.eq("assigned_department", searchParams.department)
  }
  if (searchParams.assignedTo && searchParams.assignedTo !== "all") {
    if (searchParams.assignedTo === "unassigned") {
      query = query.is("assigned_to", null)
    } else {
      query = query.eq("assigned_to", searchParams.assignedTo)
    }
  }
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }
  if (searchParams.dateFrom) {
    query = query.gte("created_at", searchParams.dateFrom)
  }
  if (searchParams.dateTo) {
    query = query.lte("created_at", searchParams.dateTo)
  }

  const { data: issues, error } = await query

  if (error) {
    console.error("Error fetching issues:", error)
    return []
  }

  return issues || []
}

async function getFilterData() {
  const supabase = await createClient()

  // Get unique departments
  const { data: departmentData } = await supabase
    .from("issues")
    .select("assigned_department")
    .not("assigned_department", "is", null)
  const departments = [...new Set(departmentData?.map((d) => d.assigned_department) || [])]

  // Get admin users
  const { data: adminUsers } = await supabase
    .from("admin_users")
    .select("id, full_name, email")
    .eq("is_active", true)
    .order("full_name")

  return { departments, adminUsers: adminUsers || [] }
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

export default async function AdminIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

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

  const issues = await getIssues(params)
  const { departments, adminUsers } = await getFilterData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Issues</h1>
              <p className="text-gray-600">Review and manage citizen reports ({issues.length} total)</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Advanced Filters */}
        <AdvancedFilters departments={departments} adminUsers={adminUsers} />

        {/* Bulk Actions */}
        <BulkActions issues={issues} adminUser={adminUser} />

        {/* Issues List */}
        <div className="space-y-4">
          {issues.map((issue: any) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox */}
                  <div className="pt-1">
                    <IssueSelector issue={issue} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{issue.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                          {issue.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="secondary" className={getCategoryColor(issue.category)}>
                          {issue.category.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{issue.location_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Reported: {new Date(issue.created_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Department:</span> {issue.assigned_department}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{issue.admin_users?.full_name || "Unassigned"}</span>
                      </div>
                    </div>

                    {issue.citizen_name && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Reporter:</span> {issue.citizen_name}
                        {issue.citizen_email && <span> ({issue.citizen_email})</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/admin/issues/${issue.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {issues.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 text-lg">No issues found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or check back later.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
