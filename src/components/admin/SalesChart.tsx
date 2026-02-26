"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatPrice } from "@/lib/utils/format"

interface DailySales {
  date: string
  amount: number
  orders: number
}

interface ProductSales {
  name: string
  amount: number
}

interface PaymentMethodSales {
  method: string
  amount: number
}

interface SalesChartProps {
  dailySales: DailySales[]
}

interface ProductChartProps {
  productSales: ProductSales[]
}

interface PaymentChartProps {
  paymentSales: PaymentMethodSales[]
}

export function DailySalesChart({ dailySales }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dailySales}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => [formatPrice(Number(value)), "매출"]} />
        <Line type="monotone" dataKey="amount" stroke="#b45309" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ProductSalesChart({ productSales }: ProductChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={productSales} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} tick={{ fontSize: 12 }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
        <Tooltip formatter={(value) => [formatPrice(Number(value)), "매출"]} />
        <Bar dataKey="amount" fill="#b45309" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const PIE_COLORS = ["#b45309", "#d97706", "#f59e0b", "#fcd34d", "#fef3c7"]

export function PaymentMethodChart({ paymentSales }: PaymentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={paymentSales} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={100} label={({ method, percent }: { method?: string; percent?: number }) => `${method ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}>
          {paymentSales.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatPrice(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  )
}
