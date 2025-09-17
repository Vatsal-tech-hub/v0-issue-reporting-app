"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { MapPin, Send, ArrowLeft, CheckCircle, Camera, X } from "lucide-react"
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
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > 3) {
      setError("You can upload a maximum of 3 images")
      return
    }

    const newImages = [...selectedImages, ...files]
    setSelectedImages(newImages)

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
    setError(null)
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])

    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
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
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-black text-foreground font-serif">Report an Issue</h1>
                <p className="text-sm text-muted-foreground font-light">Help us make your community better</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="premium-shadow border-0 bg-card backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl font-black font-serif">Report a Community Issue</CardTitle>
            <CardDescription className="text-primary-foreground/90 font-light">
              Provide details about the issue you'd like to report. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium text-foreground">
                  Issue Title *
                </Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className="border-border focus:border-primary focus:ring-primary"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="font-medium text-foreground">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                  required
                >
                  <SelectTrigger className="border-border focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-sm text-muted-foreground font-light">{category.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="font-medium text-foreground">
                  Priority
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className="border-border focus:border-primary focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div>
                          <div className="font-medium">{priority.label}</div>
                          <div className="text-sm text-muted-foreground font-light">{priority.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium text-foreground">
                  Detailed Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the issue, including any relevant details that would help city workers address it."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  required
                  className="border-border focus:border-primary focus:ring-primary"
                />
              </div>

              {/* Issue Photos (Optional) */}
              <div className="space-y-2">
                <Label className="font-medium text-foreground">Issue Photos (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2 font-light">
                      Upload photos to help illustrate the issue (Max 3 images)
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-md cursor-pointer hover:bg-primary/20 transition-colors text-sm font-medium"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Images
                    </Label>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Issue photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-light">
                  Supported formats: JPG, PNG, GIF. Max file size: 5MB per image.
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="font-medium text-foreground">
                  Location *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Street address or intersection"
                    value={formData.location_address}
                    onChange={(e) => handleInputChange("location_address", e.target.value)}
                    required
                    className="border-border focus:border-primary focus:ring-primary"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="shrink-0 border-primary/30 hover:bg-primary/10 bg-transparent"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground font-light">
                  Click the location icon to use your current location
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground font-serif">Contact Information</h3>
                <p className="text-sm text-muted-foreground font-light">
                  We'll use this information to send you updates about your report.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium text-foreground">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Full name"
                      value={formData.citizen_name}
                      onChange={(e) => handleInputChange("citizen_name", e.target.value)}
                      className="border-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium text-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.citizen_phone}
                      onChange={(e) => handleInputChange("citizen_phone", e.target.value)}
                      className="border-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.citizen_email}
                    onChange={(e) => handleInputChange("citizen_email", e.target.value)}
                    className="border-border focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm font-light">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-bold premium-shadow hover:shadow-xl transition-all duration-200"
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
