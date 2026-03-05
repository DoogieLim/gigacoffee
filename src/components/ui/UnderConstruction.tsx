interface UnderConstructionProps {
  title?: string
  description?: string
}

export function UnderConstruction({
  title = "개발중입니다",
  description = "이 기능은 현재 개발 중이며, 곧 제공될 예정입니다.",
}: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* 공사 중 일러스트 (SVG) */}
      <svg
        className="mb-8 h-48 w-48 text-amber-400"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 바닥 그림자 */}
        <ellipse cx="100" cy="175" rx="70" ry="8" fill="#f3f4f6" />

        {/* 교통 콘 */}
        <path d="M85 170 L100 80 L115 170 Z" fill="currentColor" />
        <rect x="80" y="168" width="40" height="6" rx="2" fill="#d97706" />
        <rect x="88" y="110" width="24" height="8" rx="1" fill="white" opacity="0.8" />
        <rect x="91" y="134" width="18" height="6" rx="1" fill="white" opacity="0.8" />

        {/* 기어 아이콘 (왼쪽) */}
        <g transform="translate(45, 55)">
          <circle cx="20" cy="20" r="12" stroke="#9ca3af" strokeWidth="3" fill="none" />
          <circle cx="20" cy="20" r="5" fill="#9ca3af" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <rect
              key={i}
              x="18"
              y="5"
              width="4"
              height="8"
              rx="1"
              fill="#9ca3af"
              transform={`rotate(${angle} 20 20)`}
            />
          ))}
        </g>

        {/* 기어 아이콘 (오른쪽, 작은 것) */}
        <g transform="translate(130, 45)">
          <circle cx="15" cy="15" r="9" stroke="#d1d5db" strokeWidth="2.5" fill="none" />
          <circle cx="15" cy="15" r="3.5" fill="#d1d5db" />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <rect
              key={i}
              x="13.5"
              y="4"
              width="3"
              height="6"
              rx="1"
              fill="#d1d5db"
              transform={`rotate(${angle} 15 15)`}
            />
          ))}
        </g>

        {/* 렌치 */}
        <g transform="translate(135, 90) rotate(30)">
          <rect x="0" y="8" width="40" height="4" rx="2" fill="#6b7280" />
          <path d="M-2 4 Q5 0 12 4 L12 16 Q5 20 -2 16 Z" fill="#6b7280" />
        </g>
      </svg>

      <h2 className="mb-3 text-2xl font-bold text-gray-900">{title}</h2>
      <p className="max-w-md text-gray-500">{description}</p>
    </div>
  )
}
