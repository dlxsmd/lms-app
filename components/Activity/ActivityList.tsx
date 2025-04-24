"use client";

import { Activity } from "@/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { ActivityType, ActivityContent } from "@/lib/activity";

interface ActivityListProps {
  userId: string;
  limit?: number;
}

export default function ActivityList({ userId, limit = 5 }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error("アクティビティの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId, limit, supabase]);

  const getActivityMessage = (activity: Activity) => {
    const { type, content } = activity;
    switch (type) {
      case "submission":
        return `${content.assignment_title}を提出しました`;
      case "grade_received":
        return `${content.assignment_title}の採点結果を受け取りました（${content.grade}点）`;
      case "feedback_received":
        return `${content.assignment_title}のフィードバックを受け取りました`;
      case "course_enrolled":
        return `${content.course_title}に登録しました`;
      case "assignment_created":
        return `${content.course_title}に新しい課題「${content.assignment_title}」が追加されました`;
      default:
        return "不明なアクティビティ";
    }
  };

  const getActivityLink = (activity: Activity) => {
    const { type, content } = activity;
    if (content.course_id && content.assignment_id) {
      return `/courses/${content.course_id}/assignments/${content.assignment_id}`;
    }
    if (content.course_id) {
      return `/courses/${content.course_id}`;
    }
    return "#";
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-center py-4">アクティビティはありません</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">最近のアクティビティ</h2>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div className="flex-1">
              <Link
                href={getActivityLink(activity)}
                className="text-blue-600 hover:text-blue-800"
              >
                {getActivityMessage(activity)}
              </Link>
              <p className="text-sm text-gray-500">
                {format(new Date(activity.created_at), "yyyy年MM月dd日 HH:mm", {
                  locale: ja,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
