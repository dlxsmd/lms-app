import { Suspense } from "react";
import QuizEditorClient from "./QuizEditorClient";

interface PageProps {
  params: Promise<{
    id: string;
    assignmentId: string;
  }>;
}

export default async function QuizEditorPage({ params }: PageProps) {
  const { id, assignmentId } = await params;
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <QuizEditorClient params={{ id, assignmentId }} />
    </Suspense>
  );
}
