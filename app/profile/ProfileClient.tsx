"use client";

import { useState, useRef, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { PostgrestError } from "@supabase/supabase-js";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

interface ProfileClientProps {
  user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    avatar_url: user.avatar_url || "",
  });
  const [previewUrl, setPreviewUrl] = useState(user.avatar_url || "");

  // 古い画像のURLをクリーンアップ
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      // HEICファイルかどうかをチェック
      if (file.type === "image/heic" || file.type === "image/heif") {
        // heic2anyを動的にインポート
        const heic2any = (await import("heic2any")).default;

        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });

          // 複数のBlobが返される可能性があるため、最初のものを使用
          const jpegBlob = Array.isArray(convertedBlob)
            ? convertedBlob[0]
            : convertedBlob;

          // BlobをFileに変換
          const fileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
          return new File([jpegBlob], fileName, { type: "image/jpeg" });
        } catch (conversionError) {
          let parsedError;
          try {
            parsedError =
              typeof conversionError === "string"
                ? JSON.parse(conversionError)
                : conversionError;
          } catch (parseError) {
            parsedError = conversionError;
          }

          console.error("HEIC変換の詳細エラー:", {
            originalError: conversionError,
            parsedError,
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
            },
          });

          let errorMessage = "HEIC画像の変換に失敗しました";

          if (
            parsedError?.code === 2 ||
            (typeof parsedError?.message === "string" &&
              parsedError.message.includes("ERR_LIBHEIF"))
          ) {
            errorMessage =
              "この形式のHEIC画像はサポートされていません。iPhoneの設定で「互換性を優先」をオンにして再度撮影してください。";
          } else if (parsedError?.message?.includes("memory")) {
            errorMessage =
              "画像サイズが大きすぎます。より小さいサイズの画像を使用してください。";
          } else if (
            parsedError?.message?.includes("corrupt") ||
            parsedError?.message?.includes("invalid")
          ) {
            errorMessage =
              "画像ファイルが破損しているか無効です。別の画像を試してください。";
          }

          throw new Error(errorMessage);
        }
      }
      return file;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("HEIC画像の変換に失敗しました");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      let file = e.target.files?.[0];
      if (!file) return;

      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ファイルサイズは5MB以下にしてください");
        return;
      }

      // 画像タイプチェック
      if (!file.type.startsWith("image/")) {
        toast.error("画像ファイルをアップロードしてください");
        return;
      }

      // HEIC/HEIF形式の場合、JPEG形式に変換
      try {
        file = await convertHeicToJpeg(file);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "画像の変換に失敗しました";
        console.error("画像変換エラー:", errorMessage);
        toast.error(errorMessage);
        return;
      }

      // 古いプレビューURLをクリーンアップ
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      // プレビュー表示
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // 古い画像を削除
      if (formData.avatar_url) {
        const oldFilePath = formData.avatar_url.split("/").slice(-2).join("/");
        try {
          await supabase.storage.from("profile-images").remove([oldFilePath]);
        } catch (error) {
          console.error("古い画像の削除に失敗しました:", error);
        }
      }

      // Supabaseにアップロード
      const fileExt = "jpg"; // 変換後は常にJPG
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      // 公開URLを取得
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);

      // フォームデータを更新
      setFormData((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));

      // 即座にデータベースを更新
      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success("画像をアップロードしました");
      router.refresh();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast.success("プロフィールを更新しました");
      router.refresh();
    } catch (error) {
      const pgError = error as PostgrestError;
      console.error("Error updating profile:", {
        message: pgError.message,
        details: pgError.details,
        hint: pgError.hint,
        code: pgError.code,
      });

      let errorMessage = "プロフィールの更新に失敗しました";
      if (pgError.message) {
        errorMessage += `: ${pgError.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* ヘッダーセクション */}
          <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/50 to-transparent">
              <h1 className="text-3xl font-bold text-white mb-2">
                プロフィール設定
              </h1>
              <p className="text-gray-200">
                {user.role === "teacher" ? "講師" : "受講者"}として登録
              </p>
            </div>
          </div>

          {/* プロフィール情報 */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* プロフィール画像セクション */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group" onClick={handleImageClick}>
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl}
                          alt="プロフィール画像"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-400"
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
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium">画像を変更</span>
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      アップロード中...
                    </span>
                  </div>
                )}
              </div>

              {/* 個人情報フォーム */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    名
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    姓
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              {/* アカウント情報 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-medium text-gray-900">
                  アカウント情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      登録日: {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 送信ボタン */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all ${
                    loading || uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>更新中...</span>
                    </span>
                  ) : (
                    "プロフィールを更新"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
