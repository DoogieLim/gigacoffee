"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Spinner } from "@/components/ui/Spinner"
import { Button } from "@/components/ui/Button"

interface ImageUploaderProps {
  images: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  maxSizeMB?: number
  uploadEndpoint?: string
}

export function ImageUploader({
  images,
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
  uploadEndpoint = "/api/posts/upload",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 최대 파일 수 확인
    if (images.length + files.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 이미지만 첨부할 수 있습니다.`)
      return
    }

    // 각 파일 업로드
    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다. (${file.name})`)
        continue
      }
      const tempKey = `${Date.now()}_${file.name}`
      setUploading((prev) => ({ ...prev, [tempKey]: true }))

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(uploadEndpoint, {
          method: "POST",
          body: formData,
        })

        const result = await response.json()
        if (result.success && result.data?.url) {
          onChange([...images, result.data.url])
        } else {
          alert("이미지 업로드에 실패했습니다.")
        }
      } catch (error) {
        console.error("Upload error:", error)
        alert("이미지 업로드 중 오류가 발생했습니다.")
      } finally {
        setUploading((prev) => {
          const newState = { ...prev }
          delete newState[tempKey]
          return newState
        })
      }
    }

    // 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = (url: string) => {
    onChange(images.filter((img) => img !== url))
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="image-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이미지 첨부 ({images.length}/{maxFiles})
        </label>
        <p className="text-xs text-gray-500 mb-2">이미지당 최대 {maxSizeMB}MB</p>
        <input
          ref={fileInputRef}
          id="image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={images.length >= maxFiles}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* 미리보기 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={url}
                alt="preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
                  hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 중 */}
      {Object.keys(uploading).length > 0 && (
        <div className="flex gap-2">
          <Spinner />
          <span className="text-sm text-gray-600">업로드 중...</span>
        </div>
      )}
    </div>
  )
}
