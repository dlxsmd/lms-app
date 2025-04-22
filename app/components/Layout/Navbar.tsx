"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { User } from "../../types";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setUser(userData);
        }
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(userData);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/auth/login");
      }
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md text-gray-800 shadow-md"
          : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold flex items-center">
              <svg
                className="h-8 w-8 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"
                  stroke={scrolled ? "#4F46E5" : "white"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className={`transition-colors duration-300 ${
                  scrolled ? "text-indigo-600" : "text-white"
                }`}
              >
                学習管理システム
              </span>
            </Link>
          </div>

          {!loading && (
            <div className="flex items-center">
              {user ? (
                <>
                  <div className="hidden sm:flex space-x-4 items-center">
                    <Link
                      href="/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        scrolled
                          ? "hover:bg-indigo-100 hover:text-indigo-600"
                          : "hover:bg-indigo-700 hover:text-white"
                      }`}
                    >
                      ダッシュボード
                    </Link>
                    {user.role === "teacher" && (
                      <Link
                        href="/courses"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          scrolled
                            ? "hover:bg-indigo-100 hover:text-indigo-600"
                            : "hover:bg-indigo-700 hover:text-white"
                        }`}
                      >
                        コース管理
                      </Link>
                    )}
                    {user.role === "student" && (
                      <Link
                        href="/enrolled"
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          scrolled
                            ? "hover:bg-indigo-100 hover:text-indigo-600"
                            : "hover:bg-indigo-700 hover:text-white"
                        }`}
                      >
                        マイコース
                      </Link>
                    )}
                    <div className="relative ml-3">
                      <button
                        type="button"
                        className="flex items-center space-x-2 rounded-full focus:outline-none"
                        onClick={() => setMenuOpen(!menuOpen)}
                      >
                        <span className="mr-2 text-sm font-medium">
                          {user.first_name} {user.last_name}
                        </span>
                        <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-white/30 transition duration-300 hover:ring-white/50">
                          <img
                            className="h-full w-full object-cover"
                            src={
                              user.avatar_url ||
                              `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`
                            }
                            alt={`${user.first_name} ${user.last_name}`}
                          />
                        </div>
                      </button>

                      {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-lg z-10 border border-gray-100 animate-fade-in">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-indigo-600">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-2 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            プロフィール
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            ログアウト
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* モバイルメニュー */}
                  <div className="sm:hidden">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="inline-flex items-center justify-center p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
                      aria-expanded="false"
                    >
                      <svg
                        className={`h-6 w-6 transition-transform duration-300 ${
                          menuOpen ? "rotate-90" : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            menuOpen
                              ? "M6 18L18 6M6 6l12 12"
                              : "M4 6h16M4 12h16M4 18h16"
                          }
                        />
                      </svg>
                    </button>

                    {menuOpen && (
                      <div className="absolute top-16 right-0 left-0 mt-2 bg-white shadow-lg rounded-b-xl z-10 text-black animate-slide-up overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden">
                              <img
                                className="h-full w-full object-cover"
                                src={
                                  user.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`
                                }
                                alt={`${user.first_name} ${user.last_name}`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-indigo-600">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg
                            className="w-5 h-5 mr-3 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          ダッシュボード
                        </Link>
                        {user.role === "teacher" && (
                          <Link
                            href="/courses"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 mr-3 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            コース管理
                          </Link>
                        )}
                        {user.role === "student" && (
                          <Link
                            href="/enrolled"
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            <svg
                              className="w-5 h-5 mr-3 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            マイコース
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg
                            className="w-5 h-5 mr-3 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          プロフィール
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          ログアウト
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    href="/auth/login"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      scrolled
                        ? "text-indigo-600 hover:bg-indigo-50"
                        : "text-white hover:bg-indigo-700"
                    }`}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/auth/signup"
                    className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all duration-200 ${
                      scrolled
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-white text-indigo-600 hover:bg-gray-50"
                    }`}
                  >
                    登録
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
