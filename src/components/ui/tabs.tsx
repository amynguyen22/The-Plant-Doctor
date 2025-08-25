import * as React from 'react'
import { cx } from '../../lib/cx'
type TabsContextType = { value: string; setValue: (v: string) => void }
const TabsCtx = React.createContext<TabsContextType | null>(null)
export function Tabs({ defaultValue, className, children }: { defaultValue: string; className?: string; children: React.ReactNode }){
  const [value, setValue] = React.useState(defaultValue); return <TabsCtx.Provider value={{value,setValue}}><div className={className}>{children}</div></TabsCtx.Provider>
}
export function TabsList({ className, children }: React.HTMLAttributes<HTMLDivElement>){ return <div className={cx('inline-grid gap-2 bg-gray-100 p-1 rounded-xl', className)}>{children}</div> }
export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }){ const ctx = React.useContext(TabsCtx)!; const active = ctx.value===value; return <button type='button' onClick={()=>ctx.setValue(value)} className={cx('px-3 py-1 rounded-lg text-sm', active?'bg-white shadow font-medium':'hover:bg-white/60')}>{children}</button> }
export function TabsContent({ value, children }: { value: string; children: React.ReactNode }){ const ctx = React.useContext(TabsCtx)!; if (ctx.value!==value) return null; return <div>{children}</div> }
export default Tabs