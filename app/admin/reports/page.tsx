import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Download } from "lucide-react"
import Link from "next/link"

async function getAnalyticsData() {
  const supabase = await createClient()

  // Get issues by month for the last 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: monthlyData } = await supabase
    .from("issues")
    .select("created_at, status")
    .gte("created_at", sixMonthsAgo.toISOString())

  // Get resolution times
  const { data: resolvedIssues } = await supabase
    .from("issues")
    .select("created_at, resolved_at")
    .not("resolved_at", "is", null)

  // Get issues by department
  const { data: departmentData } = await supabase.from("issues").select("assigned_department")

  // Process monthly data
  const monthlyStats = monthlyData?.reduce((acc: any, issue) => {
    const month = new Date(issue.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    if (!acc[month]) {
      acc[month] = { total: 0, resolved: 0 }
    }
    acc[month].total++
    if (issue.status === "resolved") {
      acc[month].resolved++
    }
    return acc
  }, {})

  // Calculate average resolution time
  const resolutionTimes =
    resolvedIssues?.map((issue) => {
      const created = new Date(issue.created_at)
      const resolved = new Date(issue.resolved_at)
      return Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) // days
    }) || []

  const avgResolutionTime =
    resolutionTimes.length > 0 ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length) : 0

  // Department stats
  const departmentStats =
    departmentData?.reduce((acc: any, issue) => {
      const dept = issue.assigned_department || "Unassigned"
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {}) || {}

  return {
    monthlyStats: monthlyStats || {},
    avgResolutionTime,
    departmentStats,
    totalIssues: monthlyData?.length || 0,
    resolvedIssues: resolvedIssues?.length || 0,
  }
}

export default async function AdminReportsPage() {
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

  const analytics = await getAnalyticsData()

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
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-600">Insights and trends from community issue reports</p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalIssues}</p>
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
                  <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.resolvedIssues}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.totalIssues > 0
                      ? Math.round((analytics.resolvedIssues / analytics.totalIssues) * 100)
                      : 0}
                    %
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                  <p className="text-3xl font-bold text-orange-600">{analytics.avgResolutionTime}</p>
                  <p className="text-sm text-gray-500">days</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Issues reported and resolved over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.monthlyStats).map(([month, stats]: [string, any]) => (
                  <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{month}</p>
                      <p className="text-sm text-gray-600">
                        {stats.resolved} of {stats.total} resolved
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                      <p className="text-sm text-green-600">
                        {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}% resolved
                      </p>
                    </div>
                  </div>
                ))}
                {Object.keys(analytics.monthlyStats).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No data available for the selected period.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Department</CardTitle>
              <CardDescription>Distribution of issues across city departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.departmentStats)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([department, count]: [string, any]) => (
                    <div key={department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{department}</p>
                        <p className="text-sm text-gray-600">
                          {Math.round((count / analytics.totalIssues) * 100)}% of total issues
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{count}</p>
                      </div>
                    </div>
                  ))}
                {Object.keys(analytics.departmentStats).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No department data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
