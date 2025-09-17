"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, MapPin, Clock, User, Phone, Mail, CheckCircle, AlertTriangle, Wrench } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"

interface Issue {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  location_address: string
  citizen_name: string
  citizen_email: string
  citizen_phone: string
  assigned_department: string
  created_at: string
  updated_at: string
  resolved_at: string | null
}

function getStatusIcon(status: string) {
  switch (status) {
    case "resolved":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "in_progress":
      return <Wrench className="h-5 w-5 text-blue-600" />
    default:
      return <AlertTriangle className="h-5 w-5 text-orange-600" />
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

export default function TrackPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [issue, setIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setSearchQuery(id)
      handleSearch(id)
    }
  }, [searchParams])

  const handleSearch = async (query?: string) => {
    const searchId = query || searchQuery
    if (!searchId.trim()) return

    setIsLoading(true)
    setError(null)
    setIssue(null)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("issues").select("*").eq("id", searchId.trim()).single()

      if (error) {
        if (error.code === "PGRST116") {
          setError("No report found with that ID. Please check the ID and try again.")
        } else {
          throw error
        }
      } else {
        setIssue(data)
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Track Your Report</h1>
              <p className="text-sm text-gray-600">Check the status of your community issue report</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Your Report</CardTitle>
            <CardDescription>Enter your report ID to check its current status and progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Report ID
                </Label>
                <Input
                  id="search"
                  placeholder="Enter your report ID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issue Details */}
        {issue && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-balance">{issue.title}</CardTitle>
                    <CardDescription className="mt-2">Report ID: {issue.id}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">{getStatusIcon(issue.status)}</div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Issue Description</h4>
                    <p className="text-gray-600">{issue.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-1 shrink-0" />
                      <span>{issue.location_address}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Report Submitted</h5>
                      <p className="text-sm text-gray-600">
                        Your report was successfully submitted and assigned to {issue.assigned_department}.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(issue.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {issue.status === "in_progress" && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <Wrench className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold">Work in Progress</h5>
                        <p className="text-sm text-gray-600">
                          City workers have been assigned and are working on resolving this issue.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(issue.updated_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {issue.status === "resolved" && issue.resolved_at && (
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold">Issue Resolved</h5>
                        <p className="text-sm text-gray-600">
                          This issue has been successfully resolved by the city team.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(issue.resolved_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(issue.citizen_name || issue.citizen_email || issue.citizen_phone) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>The information provided when this report was submitted.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Department Information */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Department</CardTitle>
                <CardDescription>This report has been assigned to the appropriate city department.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{issue.assigned_department}</h4>
                    <p className="text-sm text-gray-600">
                      Responsible for handling {issue.category.replace("_", " ")} issues
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold mb-2">Can't find your report?</h5>
                <p className="text-sm text-gray-600 mb-2">
                  Make sure you're using the correct report ID. It should be a long string of letters and numbers.
                </p>
                <Link href="/report">
                  <Button variant="outline" size="sm">
                    Submit New Report
                  </Button>
                </Link>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Questions or concerns?</h5>
                <p className="text-sm text-gray-600 mb-2">
                  Contact us if you have questions about your report or need additional assistance.
                </p>
                <p className="text-sm text-gray-600">
                  Email: support@civicreport.gov
                  <br />
                  Phone: (555) 123-4567
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
