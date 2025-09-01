import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neon: "bg-gradient-to-r text-white font-black border-2 border-white/20 backdrop-blur-sm hover:scale-105 hover:shadow-2xl transform transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-r before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        glass: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:scale-105 transform transition-all duration-300 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
        epic: "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-black border-2 border-white/30 backdrop-blur-sm hover:scale-110 hover:shadow-[0_0_50px_rgba(139,69,255,0.6)] transform transition-all duration-500 animate-gradient-shift"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-3",
        lg: "h-16 rounded-xl px-10 text-lg",
        xl: "h-20 rounded-2xl px-12 text-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {variant === "neon" || variant === "epic" ? (
          <>
            <span className="relative z-10">{children}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
