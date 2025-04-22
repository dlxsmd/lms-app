import React from "react";
import AssignmentDetailsClient from "./AssignmentDetailsClient";

type PageProps = {
  params: Promise<{ id: string; assignmentId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id, assignmentId } = await params;
  return <AssignmentDetailsClient id={id} assignmentId={assignmentId} />;
}
