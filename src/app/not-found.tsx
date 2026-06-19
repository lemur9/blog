import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">页面未找到</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">抱歉，您访问的页面不存在。</p>
      <div className="flex gap-4">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          <Home className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
