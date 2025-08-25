import * as React from 'react'
import { cx } from '../../lib/cx'
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref)=>{
  return <textarea ref={ref} className={cx('w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50', className)} {...props} />
})
Textarea.displayName='Textarea'
export default Textarea