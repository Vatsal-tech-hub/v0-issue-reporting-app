import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, MapPin, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { NotificationCenter } from "@/components/admin/notification-center"
import { ThemeToggle } from "@/components/theme-toggle"

async function getAdminStats() {
  const supabase = await createClient()

  // Get total issues count
  const { count: totalIssues } = await supabase.from("issues").select("*", { count: "exact", head: true })

  // Get issues by status
  const { data: statusData } = await supabase.from("issues").select("status")

  // Get issues by category
  const { data: categoryData } = await supabase.from("issues").select("category")

  // Get recent issues
  const { data: recentIssues } = await supabase
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Calculate stats
  const statusCounts =
    statusData?.reduce((acc: any, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1
      return acc
    }, {}) || {}

  const categoryCounts =
    categoryData?.reduce((acc: any, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {}) || {}

  return {
    totalIssues: totalIssues || 0,
    statusCounts,
    categoryCounts,
    recentIssues: recentIssues || [],
  }
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

export default async function AdminDashboard() {
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

  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back, {adminUser.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter adminUser={adminUser} />
              <Badge variant="secondary">{adminUser.role}</Badge>
              <ThemeToggle />
              <Link href="/admin/logout">
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalIssues}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.statusCounts.submitted || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.statusCounts.in_progress || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.statusCounts.resolved || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Issues */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Issues</CardTitle>
                    <CardDescription>Latest reports from citizens</CardDescription>
                  </div>
                  <Link href="/admin/issues">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentIssues.map((issue: any) => (
                    <div
                      key={issue.id}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{issue.title}</h4>
                          <div className="flex gap-2 shrink-0">
                            <Badge variant="outline" className={getStatusColor(issue.status)}>
                              {issue.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{issue.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{issue.location_address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/admin/issues/${issue.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {stats.recentIssues.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No issues reported yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Breakdown of issue types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.categoryCounts).map(([category, count]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getCategoryColor(category)}>
                          {category.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.categoryCounts).length === 0 && (
                    <p className="text-center text-gray-500 py-4">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/admin/issues" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Manage Issues
                    </Button>
                  </Link>
                  <Link href="/admin/departments" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      Departments
                    </Button>
                  </Link>
                  <Link href="/admin/reports" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
