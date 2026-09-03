import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    
    let variantClass = "bg-[var(--accent-primary)] text-[var(--text-inverse)] hover:opacity-90 border-none";
    if (variant === "outline") variantClass = "border border-[var(--border-primary)] bg-transparent hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]";
    if (variant === "ghost") variantClass = "bg-transparent border-none hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)]";

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          variantClass,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
