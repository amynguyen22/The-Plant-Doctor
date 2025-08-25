import * as React from 'react'
import { cx } from '../../lib/cx'
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref)=>{
  return <input ref={ref} className={cx('w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50', className)} {...props} />
})
Input.displayName='Input'
export default Input