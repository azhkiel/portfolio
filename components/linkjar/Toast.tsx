'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface Props {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(onRemove, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onRemove])

  const borderColor =
    toast.type === 'error' ? 'border-red-300 text-red-700' :
    toast.type === 'warning' ? 'border-gray-400 text-gray-700' :
    'border-gray-200 text-gray-800'

  return (
    <div
      className={`bg-white border ${borderColor} ${exiting ? 'toast-exit' : 'toast-enter'}
        px-4 py-3 rounded-lg shadow-sm flex items-center gap-2 min-w-[200px] max-w-xs text-sm font-medium`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <span>{toast.message}</span>
    </div>
  )
}

export default function Toast({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  )
}
