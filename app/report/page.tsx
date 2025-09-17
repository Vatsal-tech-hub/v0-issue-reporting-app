"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Send, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const categories = [
  { value: "pothole", label: "Pothole", description: "Road damage, potholes, or pavement issues" },
  { value: "streetlight", label: "Street Light", description: "Broken or malfunctioning street lights" },
  { value: "sanitation", label: "Sanitation", description: "Trash, recycling, or cleanliness issues" },
  { value: "traffic", label: "Traffic", description: "Traffic signals, signs, or road safety" },
  { value: "vandalism", label: "Vandalism", description: "Graffiti, property damage, or vandalism" },
  { value: "other", label: "Other", description: "Any other community issue" },
]

const priorities = [
  { value: "low", label: "Low", description: "Minor issue, not urgent" },
  { value: "medium", label: "Medium", description: "Moderate issue, needs attention" },
  { value: "high", label: "High", description: "Important issue, requires prompt action" },
  { value: "urgent", label: "Urgent", description: "Safety hazard, immediate attention needed" },
]

export default function ReportPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location_address: "",
    citizen_name: "",
    citizen_email: "",
    citizen_phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("issues")
        .insert([
          {
            ...formData,
            assigned_department: getDepartmentForCategory(formData.category),
          },
        ])
        .select()
        .single()

      if (error) throw error

      setIsSubmitted(true)

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push(`/track?id=${data.id}`)
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDepartmentForCategory = (category: string) => {
    switch (category) {
      case "pothole":
        return "Public Works"
      case "streetlight":
        return "Utilities"
      case "sanitation":
        return "Sanitation"
      case "traffic":
        return "Transportation"
      case "vandalism":
        return "Code Enforcement"
      default:
        return "Public Works"
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates to get an address
          const { latitude, longitude } = position.coords
          handleInputChange("location_address", `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`)
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 font-sans">Report Submitted!</h2>
            <p className="text-gray-600 mb-4 font-light">
              Thank you for helping improve our community. You'll receive updates about your report via email.
            </p>
            <p className="text-sm text-gray-500 font-light">Redirecting to tracking page...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-emerald-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-black text-gray-900 font-sans">Report an Issue</h1>
              <p className="text-sm text-gray-600 font-light">Help us make your community better</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-black font-sans">Report a Community Issue</CardTitle>
            <CardDescription className="text-emerald-50 font-light">
              Provide details about the issue you'd like to report. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium text-gray-700">
                  Issue Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="font-medium text-gray-700">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                  required
                >
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-sm text-gray-500 font-light">{category.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="font-medium text-gray-700">
                  Priority
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div>
                          <div className="font-medium">{priority.label}</div>
                          <div className="text-sm text-gray-500 font-light">{priority.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium text-gray-700">
                  Detailed Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the issue, including any relevant details that would help city workers address it."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  required
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="font-medium text-gray-700">
                  Location *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Street address or intersection"
                    value={formData.location_address}
                    onChange={(e) => handleInputChange("location_address", e.target.value)}
                    required
                    className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="shrink-0 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 font-light">Click the location icon to use your current location</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 font-sans">Contact Information</h3>
                <p className="text-sm text-gray-600 font-light">
                  We'll use this information to send you updates about your report.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium text-gray-700">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Full name"
                      value={formData.citizen_name}
                      onChange={(e) => handleInputChange("citizen_name", e.target.value)}
                      className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.citizen_phone}
                      onChange={(e) => handleInputChange("citizen_phone", e.target.value)}
                      className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.citizen_email}
                    onChange={(e) => handleInputChange("citizen_email", e.target.value)}
                    className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-light">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting Report..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
