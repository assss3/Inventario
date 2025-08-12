'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  className?: string
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2 ${className}`}
    >
      ← Atrás
    </button>
  )
}