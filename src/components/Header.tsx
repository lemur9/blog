import Link from "next/link";
import DarkModeToggle from "./DarkModeToggle";
import { BookOpen, Tag, User, Lock } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>前端爪の博客</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            首页
          </Link>
          <Link href="/tags" className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Tag className="w-4 h-4" />
            标签
          </Link>
          <Link href="/about" className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <User className="w-4 h-4" />
            关于
          </Link>
          <Link href="/admin/login" className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Lock className="w-4 h-4" />
            登录
          </Link>
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
