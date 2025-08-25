import React, { createContext, useContext, useState } from 'react'

const TabsContext = createContext<{ value: string; setValue: (v: string) => void } | null>(null)

export function Tabs({ defaultValue, children, className = '' }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [value, setValue] = useState(defaultValue)
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>
}

export function TabsList({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`inline-grid gap-2 rounded-xl bg-gray-100 p-1 ${className}`} {...props} />
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!
  const active = ctx.value === value
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={`rounded-lg px-3 py-1.5 text-sm transition ${active ? 'bg-white shadow font-medium' : 'text-gray-600 hover:bg-white/60'}`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!
  if (ctx.value !== value) return null
  return <div>{children}</div>
}