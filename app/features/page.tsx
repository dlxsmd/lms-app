import Image from "next/image";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCode,
  FaChartLine,
} from "react-icons/fa";
import { MdQuiz, MdFeedback } from "react-icons/md";

export default function FeaturesPage() {
  const features = [
    {
      title: "インタラクティブな学習体験",
      description:
        "リアルタイムのコーディング環境とインタラクティブな教材で、実践的なプログラミング学習を提供します。",
      icon: <FaCode className="w-8 h-8 text-indigo-500" />,
      image: "/images/features/coding.jpg",
    },
    {
      title: "プログレッシブな学習カリキュラム",
      description:
        "初心者から上級者まで、段階的に成長できる体系的なカリキュラムを用意しています。",
      icon: <FaGraduationCap className="w-8 h-8 text-indigo-500" />,
      image: "/images/features/curriculum.jpg",
    },
    {
      title: "リアルタイムフィードバック",
      description:
        "課題の自動採点システムと講師からの詳細なフィードバックで、効果的な学習をサポートします。",
      icon: <MdFeedback className="w-8 h-8 text-indigo-500" />,
      image: "/images/features/feedback.jpg",
    },
    {
      title: "進捗管理とデータ分析",
      description:
        "詳細な学習分析と進捗トラッキングで、自身の成長を可視化します。",
      icon: <FaChartLine className="w-8 h-8 text-indigo-500" />,
      image: "/images/features/analytics.jpg",
    },
    {
      title: "対話型クイズと演習",
      description:
        "理解度を確認するためのインタラクティブなクイズと実践的な演習問題を提供します。",
      icon: <MdQuiz className="w-8 h-8 text-indigo-500" />,
      image: "/images/features/quiz.jpg",
    },
    {
      title: "経験豊富な講師陣",
      description: "業界経験豊富な講師陣が、実践的な知識とスキルを提供します。",
      icon: <FaChalkboardTeacher className="w-8 h-8 text-indigo-500" />,
      image: "/images/features/teachers.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ヒーローセクション */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              プログラミング学習を
              <br className="hidden sm:block" />
              より効果的に
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              最新のテクノロジーと実践的なカリキュラムで、
              あなたのプログラミングスキルを次のレベルへ。
            </p>
          </div>
        </div>
      </div>

      {/* 機能一覧セクション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            充実した学習機能
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            効果的な学習をサポートする様々な機能を提供しています
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                <Image
                  src={feature.image}
                  alt={feature.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-gray-900 ml-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAセクション */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              今すぐ学習を始めましょう
            </h2>
            <p className="text-xl mb-8 opacity-90">
              無料トライアルで充実した学習機能をお試しいただけます
            </p>
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105">
              無料で始める
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
