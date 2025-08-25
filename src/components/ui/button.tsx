import React from 'react'

type Variant = 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'
const styles: Record<Variant, string> = {
  default: 'bg-emerald-600 text-white hover:bg-emerald-700',
  secondary: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200',
  outline: 'border bg-white hover:bg-emerald-50',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700',
  ghost: 'hover:bg-gray-100',
}

export function Button({ variant = 'default', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition ${styles[variant]} ${className}`}
      {...props}
    />
  )
}