import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench,
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

async function getRecentIssues() {
  try {
    const supabase = await createClient()

    const { data: issues, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("Error fetching issues:", error)
      return [
        {
          id: 1,
          title: "Pothole on Main Street",
          description: "Large pothole causing traffic issues near the intersection",
          category: "pothole",
          status: "submitted",
          location_address: "123 Main Street",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Broken Streetlight",
          description: "Street light has been out for several days",
          category: "streetlight",
          status: "in_progress",
          location_address: "456 Oak Avenue",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          title: "Graffiti Cleanup Needed",
          description: "Vandalism on public building wall",
          category: "vandalism",
          status: "resolved",
          location_address: "789 Pine Road",
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ]
    }

    return issues || []
  } catch (error) {
    console.error("Database connection error:", error)
    return [
      {
        id: 1,
        title: "Pothole on Main Street",
        description: "Large pothole causing traffic issues near the intersection",
        category: "pothole",
        status: "submitted",
        location_address: "123 Main Street",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Broken Streetlight",
        description: "Street light has been out for several days",
        category: "streetlight",
        status: "in_progress",
        location_address: "456 Oak Avenue",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        title: "Graffiti Cleanup Needed",
        description: "Vandalism on public building wall",
        category: "vandalism",
        status: "resolved",
        location_address: "789 Pine Road",
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ]
  }
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
      return "bg-red-100 text-red-800 border-red-300"
    case "streetlight":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "sanitation":
      return "bg-green-100 text-green-800 border-green-300"
    case "traffic":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "vandalism":
      return "bg-purple-100 text-purple-800 border-purple-300"
    default:
      return "bg-pink-100 text-pink-800 border-pink-300"
  }
}

export default async function HomePage() {
  const recentIssues = await getRecentIssues()

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center premium-shadow">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-chart-4 to-chart-3 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-gradient">CivicReport</h1>
                <p className="text-sm text-muted-foreground font-light">Making our city better, together</p>
              </div>
            </div>
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 bg-transparent border-2 border-primary/30 font-medium"
              >
                Admin Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-32 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/modern-city-skyline-silhouette-at-dusk.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 text-balance leading-tight drop-shadow-2xl [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
              Report Issues in Your
              <span className="text-yellow-200 block drop-shadow-2xl [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
                Community
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-12 text-pretty max-w-3xl mx-auto font-light leading-relaxed drop-shadow-xl [text-shadow:_1px_1px_3px_rgb(0_0_0_/_70%)]">
              Help make our city safer and cleaner by reporting potholes, broken streetlights, sanitation problems, and
              more. Your voice matters in building a better community.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up">
            <Link href="/report">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-50 px-10 py-4 text-lg font-semibold rounded-xl premium-shadow hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Report an Issue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/track">
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 bg-black/20 backdrop-blur-sm"
              >
                Track Your Report
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-foreground mb-4">Why Choose CivicReport?</h3>
            <p className="text-lg text-muted-foreground font-light">
              Trusted by thousands of citizens and city officials
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 premium-shadow hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in bg-card backdrop-blur-sm">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">24/7</h4>
                <p className="text-muted-foreground font-light">Report issues anytime, anywhere</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 premium-shadow hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in bg-card backdrop-blur-sm">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-secondary" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">Fast</h4>
                <p className="text-muted-foreground font-light">Quick response from city departments</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 premium-shadow hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in bg-card backdrop-blur-sm">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-chart-3/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-chart-3" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">Secure</h4>
                <p className="text-muted-foreground font-light">Your data is protected and private</p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 premium-shadow hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in bg-card backdrop-blur-sm">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-chart-4/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-chart-1" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">Impact</h4>
                <p className="text-muted-foreground font-light">Track real community improvements</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-foreground mb-4">Recent Community Reports</h3>
            <p className="text-lg text-muted-foreground font-light">
              See what your neighbors are reporting and track progress
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentIssues.map((issue, index) => (
              <Card
                key={issue.id}
                className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 premium-shadow bg-card backdrop-blur-sm animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg line-clamp-2 text-balance font-bold text-foreground">
                      {issue.title}
                    </CardTitle>
                    <div className="flex-shrink-0">{getStatusIcon(issue.status)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className={`${getCategoryColor(issue.category)} font-medium border`}>
                      {issue.category.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className={`${getStatusColor(issue.status)} font-medium`}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 font-light">{issue.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="line-clamp-1 font-light">{issue.location_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-secondary" />
                      <span className="font-light">{new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {recentIssues.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-light">
                No issues reported yet. Be the first to make a difference!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-6 drop-shadow-lg">
            Ready to Make a Difference?
          </h3>
          <p className="text-xl text-white/95 mb-10 font-light drop-shadow-md">
            Join thousands of citizens working together to improve our community
          </p>
          <Link href="/report">
            <Button
              size="lg"
              className="px-10 py-4 text-lg font-semibold rounded-xl premium-shadow hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white text-primary hover:bg-gray-50"
            >
              Report Your First Issue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-black text-foreground">CivicReport</h4>
              </div>
              <p className="text-muted-foreground mb-6 font-light leading-relaxed">
                Empowering citizens to improve their communities through easy issue reporting. Making cities better, one
                report at a time.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-foreground">Quick Links</h5>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/report"
                    className="text-muted-foreground hover:text-primary transition-colors font-light"
                  >
                    Report Issue
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="text-muted-foreground hover:text-primary transition-colors font-light">
                    Track Report
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors font-light">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-foreground">Contact</h5>
              <ul className="space-y-3">
                <li className="text-muted-foreground font-light">support@civicreport.gov</li>
                <li className="text-muted-foreground font-light">(555) 123-4567</li>
                <li className="text-muted-foreground font-light">Emergency: 911</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-muted-foreground font-light">
              &copy; 2024 CivicReport. Making communities better, together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
