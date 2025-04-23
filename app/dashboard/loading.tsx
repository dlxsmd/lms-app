export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-t-4 border-indigo-600 rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        <p className="mt-2 text-sm text-gray-500">コンテンツを準備しています</p>
      </div>
    </div>
  );
}
