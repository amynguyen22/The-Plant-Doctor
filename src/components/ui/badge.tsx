import React from 'react'

type Variant = 'default' | 'secondary' | 'destructive'
const styles: Record<Variant, string> = {
  default: 'bg-emerald-600 text-white',
  secondary: 'bg-gray-100 text-gray-700',
  destructive: 'bg-rose-600 text-white',
}

export function Badge({ variant = 'default', className = '', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`} {...props} />
}