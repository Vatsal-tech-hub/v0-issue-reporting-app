import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, CheckCircle, AlertTriangle, Wrench } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

async function getRecentIssues() {
  const supabase = await createClient()

  const { data: issues, error } = await supabase
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6)

  if (error) {
    console.error("Error fetching issues:", error)
    return []
  }

  return issues || []
}

function getStatusIcon(status: string) {
  switch (status) {
    case "resolved":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "in_progress":
      return <Wrench className="h-4 w-4 text-blue-600" />
    default:
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
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

export default async function HomePage() {
  const recentIssues = await getRecentIssues()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CivicReport</h1>
                <p className="text-sm text-gray-600">Making our city better, together</p>
              </div>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
            Report Issues in Your Community
          </h2>
          <p className="text-xl text-gray-600 mb-8 text-pretty max-w-2xl mx-auto">
            Help make our city safer and cleaner by reporting potholes, broken streetlights, sanitation problems, and
            more. Your voice matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg"
              >
                Report an Issue
              </Button>
            </Link>
            <Link href="/track">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
                Track Your Report
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center border-blue-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7</h3>
                <p className="text-gray-600">Report issues anytime, anywhere</p>
              </CardContent>
            </Card>
            <Card className="text-center border-green-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Fast</h3>
                <p className="text-gray-600">Quick response from city departments</p>
              </CardContent>
            </Card>
            <Card className="text-center border-orange-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Updates</h3>
                <p className="text-gray-600">Get notified about progress</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Issues */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Recent Community Reports</h3>
            <p className="text-lg text-gray-600">See what your neighbors are reporting and track progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIssues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2 text-balance">{issue.title}</CardTitle>
                    {getStatusIcon(issue.status)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={getCategoryColor(issue.category)}>
                      {issue.category.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(issue.status)}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{issue.location_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {recentIssues.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No issues reported yet. Be the first to make a difference!</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Make a Difference?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of citizens working together to improve our community
          </p>
          <Link href="/report">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Report Your First Issue
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold">CivicReport</h4>
              </div>
              <p className="text-gray-400">
                Empowering citizens to improve their communities through easy issue reporting.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/report" className="hover:text-white transition-colors">
                    Report Issue
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="hover:text-white transition-colors">
                    Track Report
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@civicreport.gov</li>
                <li>Phone: (555) 123-4567</li>
                <li>Emergency: 911</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CivicReport. Making communities better, together.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
