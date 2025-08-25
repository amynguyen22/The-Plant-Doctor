import React from 'react'

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 ${props.className||''}`} />
}