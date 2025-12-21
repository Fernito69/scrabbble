import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

// Wrapper component that supports both hover and click/tap
const Tooltip = ({ children, ...props }: TooltipPrimitive.TooltipProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <TooltipPrimitive.Root open={open} onOpenChange={setOpen} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TooltipTrigger) {
          return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => {
              e.preventDefault()
              setOpen(!open)
            },
            onPointerDown: (e: React.PointerEvent) => {
              // Prevent default to avoid issues with touch
              if (e.pointerType === "touch") {
                e.preventDefault()
              }
            },
          } as any)
        }
        return child
      })}
    </TooltipPrimitive.Root>
  )
}

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
