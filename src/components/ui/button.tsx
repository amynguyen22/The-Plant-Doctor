import * as React from 'react'
import { cx } from '../../lib/cx'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{ variant?: 'default'|'secondary'|'destructive'|'outline'|'ghost' }
export function Button({ className, variant='default', ...props }: ButtonProps){
  const base='inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50'
  const styles: Record<string,string>={ default:'bg-emerald-600 text-white hover:bg-emerald-700', secondary:'bg-emerald-100 text-emerald-900 hover:bg-emerald-200', destructive:'bg-rose-600 text-white hover:bg-rose-700', outline:'border border-gray-300 hover:bg-gray-50', ghost:'hover:bg-gray-100' }
  return <button className={cx(base, styles[variant], className)} {...props} />
}
export default Button