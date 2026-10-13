import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// The site is dark-only, so toasts are pinned to the dark palette rather than
// following the OS theme (which rendered white toasts on light-mode machines).
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#16161a] group-[.toaster]:text-slate-100 group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg group-[.toaster]:shadow-black/40",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-violet-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-slate-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
