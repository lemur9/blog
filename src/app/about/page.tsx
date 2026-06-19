import { Book, Globe, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">关于</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
            L
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lemur</h2>
            <p className="text-gray-500 dark:text-gray-400">前端开发工程师</p>
          </div>
        </div>

        <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            你好！我是一名 Java 软件开发工程师，同时也对前端技术充满热情。
            这个博客是我记录前端技术学习心得和实践经验的场所。
          </p>
          <p>
            我专注于 <strong className="text-gray-900 dark:text-white">Next.js</strong>、
            <strong className="text-gray-900 dark:text-white">React</strong>、
            <strong className="text-gray-900 dark:text-white">TypeScript</strong> 和
            <strong className="text-gray-900 dark:text-white">Tailwind CSS</strong>，
            也会分享一些工程化和性能优化的经验。
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-600" />
            常用技术栈
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Java", "PostgreSQL"].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
          <a href="#" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Globe className="w-5 h-5" />
            GitHub
          </a>
          <a href="#" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Mail className="w-5 h-5" />
            联系我
          </a>
        </div>
      </div>
    </div>
  );
}
