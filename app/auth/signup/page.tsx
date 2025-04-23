"use client";

import { useSearchParams } from "next/navigation";
import SignupForm from "@/app/components/Auth/SignupForm";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as "student" | "teacher") || "student";
  return <SignupForm defaultRole={role} />;
}
