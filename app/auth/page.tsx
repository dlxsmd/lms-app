"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserGraduate,
  FaKey,
  FaGithub,
  FaGoogle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { signUp } from "@/lib/auth";
import { toast } from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const roleParam = searchParams.get("role") as "teacher" | "student" | null;

  // registeredパラメータがある場合はログインフォームを表示
  const [isLogin, setIsLogin] = useState(registered ? true : false);

  // ログインフォーム用の状態
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 登録フォーム用の状態
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">(
    roleParam || "student"
  );
  const [teacherPassphrase, setTeacherPassphrase] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 教師登録用のパスフレーズを環境変数から取得
  const TEACHER_PASSPHRASE = process.env.NEXT_PUBLIC_TEACHER_PASSPHRASE;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("パスワードが一致しません。");
      return;
    }

    if (role === "teacher") {
      if (!TEACHER_PASSPHRASE) {
        toast.error(
          "システムエラー：教師登録用パスフレーズが設定されていません。"
        );
        return;
      }
      if (teacherPassphrase !== TEACHER_PASSPHRASE) {
        toast.error("教師登録用のパスフレーズが正しくありません。");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      await signUp(email, password, firstName, lastName, role);
      toast.success("登録が完了しました！");
      setIsLogin(true); // 登録成功後、ログインフォームに切り替え
    } catch (err: any) {
      toast.error(err.message || "登録に失敗しました。");
      setError(err.message || "登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "github" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左側のイラスト部分 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <motion.h2
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-4xl font-bold mb-6"
          >
            {isLogin ? "おかえりなさい" : "新しい学びの始まり"}
          </motion.h2>
          <motion.p
            key={isLogin ? "login-text" : "signup-text"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xl mb-8 text-center"
          >
            プログラミング学習の新しい形へ。
            <br />
            あなたの成長をサポートします。
          </motion.p>
          <div className="w-full max-w-md">
            <Image
              src="/images/features/programming-illustration.svg"
              alt="Programming illustration"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
        {/* 装飾的な背景要素 */}
        <div className="absolute -bottom-32 -left-40 w-80 h-80 border-4 rounded-full border-opacity-30 border-t-8"></div>
        <div className="absolute -bottom-40 -left-20 w-80 h-80 border-4 rounded-full border-opacity-30 border-t-8"></div>
        <div className="absolute -top-40 -right-0 w-80 h-80 border-4 rounded-full border-opacity-30 border-t-8"></div>
      </div>

      {/* 右側のフォーム */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* タブ形式のトグルスイッチ */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 shadow-lg rounded-2xl p-2 inline-flex items-center gap-2">
              <motion.button
                onClick={() => setIsLogin(true)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold transition-all relative ${
                  isLogin
                    ? "text-white shadow-lg"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <FaUser
                  className={`w-5 h-5 ${
                    isLogin ? "text-white" : "text-indigo-500"
                  }`}
                />
                <span className="relative z-10">ログイン</span>
                {isLogin && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-500/25"
                    layoutId="auth-tab-background"
                    initial={false}
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}
              </motion.button>
              <motion.button
                onClick={() => setIsLogin(false)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold transition-all relative ${
                  !isLogin
                    ? "text-white shadow-lg"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <FaUserGraduate
                  className={`w-5 h-5 ${
                    !isLogin ? "text-white" : "text-indigo-500"
                  }`}
                />
                <span className="relative z-10">新規登録</span>
                {!isLogin && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-500/25"
                    layoutId="auth-tab-background"
                    initial={false}
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                  />
                )}
              </motion.button>
            </div>
          </div>

          <div className="text-center">
            <motion.h2
              key={isLogin ? "login-title" : "signup-title"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              {isLogin ? "ログイン" : "アカウント登録"}
            </motion.h2>
            <p className="text-gray-700">
              {isLogin
                ? "アカウントにサインインして学習を続けましょう"
                : "新しいアカウントを作成して学習を始めましょう"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login-form" : "signup-form"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLogin ? (
                // ログインフォーム
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      メールアドレス
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="your@email.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      パスワード
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "ログイン"
                    )}
                  </button>
                </form>
              ) : (
                // 登録フォーム
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        姓
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          placeholder="山田"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        名
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                          placeholder="太郎"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      メールアドレス
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="your@email.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      パスワード
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      パスワード（確認）
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ユーザー種別
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={`flex items-center justify-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${
                          role === "student"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        disabled={loading}
                      >
                        <FaUserGraduate className="h-5 w-5 mr-2" />
                        学生
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("teacher")}
                        className={`flex items-center justify-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${
                          role === "teacher"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        disabled={loading}
                      >
                        <FaUserGraduate className="h-5 w-5 mr-2" />
                        教師
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "登録"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
