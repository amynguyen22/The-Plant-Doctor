import * as React from 'react'
import { cx } from '../../lib/cx'
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>){ return <div className={cx('rounded-2xl border bg-white shadow-sm', className)} {...props} /> }
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>){ return <div className={cx('p-5 border-b', className)} {...props} /> }
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>){ return <h3 className={cx('text-lg font-semibold', className)} {...props} /> }
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>){ return <p className={cx('text-sm text-gray-500', className)} {...props} /> }
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>){ return <div className={cx('p-5', className)} {...props} /> }
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>){ return <div className={cx('p-5 border-t', className)} {...props} /> }
export default Card