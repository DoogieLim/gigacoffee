import { AdminSidebar } from "@/components/layout/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 모바일 경고 배너 */}
      <div className="fixed inset-x-0 top-0 z-50 bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white lg:hidden">
        관리자 페이지는 PC(1024px 이상)에서 사용해주세요.
      </div>

      {/* 사이드바 */}
      <div className="hidden lg:flex lg:w-60 lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}
