import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const variant = (props as any).variant as
          | 'default'
          | 'success'
          | 'info'
          | 'warning'
          | 'destructive'
          | undefined

        const Icon =
          variant === 'success' ? CheckCircle2 :
          variant === 'info' ? Info :
          variant === 'warning' ? AlertTriangle :
          variant === 'destructive' ? XCircle :
          undefined

        const iconClass =
          variant === 'success' ? 'text-honey-600' :
          variant === 'info' ? 'text-blue-600' :
          variant === 'warning' ? 'text-amber-600' :
          variant === 'destructive' ? 'text-red-600' :
          'text-muted-foreground'
        return (
          <Toast key={id} {...props}>
            {Icon ? <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconClass}`} /> : null}
            <div className="grid gap-0.5">
              {title && <ToastTitle className="text-sm">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs leading-relaxed">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
