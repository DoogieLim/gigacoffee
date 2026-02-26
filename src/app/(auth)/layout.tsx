export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-amber-800">인생고민</h1>
          <p className="mt-2 text-sm text-gray-500">당신의 고민을 나눠드립니다</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm">{children}</div>
      </div>
    </div>
  )
}
