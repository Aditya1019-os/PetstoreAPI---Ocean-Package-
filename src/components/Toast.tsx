import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { toastsAtom, type ToastMessage } from '@/atoms'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export function useToast() {
  const [, setToasts] = useAtom(toastsAtom)

  return {
    toast: (message: string, type: ToastMessage['type'] = 'info') => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    },
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useAtom(toastsAtom)

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg animate-slide-in',
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
            {t.type === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
            {t.type === 'info' && <Info className="h-4 w-4 text-primary" />}
          </span>
          <p className="flex-1 text-sm">{t.message}</p>
          <button onClick={() => dismiss(t.id)} className="mt-0.5 opacity-50 hover:opacity-100 transition-opacity">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
