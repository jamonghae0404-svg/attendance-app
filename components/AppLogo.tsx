export default function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
        <span className="text-white text-xs font-black tracking-tight">ALE</span>
      </div>
      <div className="leading-none">
        <div className="text-base font-bold text-gray-900">ALE 출석부</div>
        <div className="text-[10px] text-gray-400 mt-0.5">
          <span className="text-indigo-500 font-medium">A</span>rdim{' '}
          <span className="text-indigo-500 font-medium">L</span>ifelong{' '}
          <span className="text-indigo-500 font-medium">E</span>ducation
        </div>
      </div>
    </div>
  )
}
