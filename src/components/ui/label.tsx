import React from 'react'

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`mb-1 block text-sm font-medium ${props.className||''}`} />
}