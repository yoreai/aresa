import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { books } from "../../lib/publications";

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br via-blue-50 to-indigo-100 transition-colors duration-300 from-slate-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center px-4 py-2 mb-8 space-x-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full">
              <BookOpen className="w-4 h-4" />
              <span>Research Books</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl dark:text-gray-100">
              In-Depth Research Books
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Comprehensive explorations of mathematics, machine learning, and
              AI systems—from theoretical foundations to production
              implementations.
            </p>
          </div>

          {/* Books Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {books.map((book) => (
              <Link
                key={book.slug}
                href={`/books/${book.slug}`}
                className="p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 transform group bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="flex items-start space-x-6">
                  {/* Book Cover */}
                  <div
                    className={`w-40 h-56 bg-gradient-to-br ${book.coverGradient} rounded-lg shadow-xl flex flex-col items-center justify-center p-4 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <BookOpen className="mb-3 w-12 h-12 text-white/80" />
                    <div className="text-xs font-medium text-center text-white/90 line-clamp-3">
                      {book.title}
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1">
                    <h2 className="mb-2 text-2xl font-bold text-gray-900 transition-colors dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {book.title}
                    </h2>

                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      by {book.author} • {book.date}
                    </p>

                    <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-400">
                      {book.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {book.chapters} Chapters
                      </span>
                      <span className="flex items-center font-medium text-purple-600 dark:text-purple-400">
                        Read Book{" "}
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
