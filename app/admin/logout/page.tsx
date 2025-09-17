"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AdminLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const signOut = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/admin/login")
    }

    signOut()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Signing you out...</p>
        </CardContent>
      </Card>
    </div>
  )
}
