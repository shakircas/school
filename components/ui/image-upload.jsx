"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, X } from "lucide-react"

export function ImageUpload({ value, onChange, label = "Upload Image" }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          onChange(data.url)
        }
      } catch (error) {
        console.error("Upload failed:", error)
      } finally {
        setIsUploading(false)
      }
    },
    [onChange],
  )

  const handleRemove = useCallback(() => {
    onChange("")
  }, [onChange])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={value || ""} />
          <AvatarFallback className="bg-muted">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        {value && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <label className="cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
        <Button type="button" variant="outline" size="sm" asChild disabled={isUploading}>
          <span>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : label}
          </span>
        </Button>
      </label>
    </div>
  )
}
