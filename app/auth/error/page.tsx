import { redirect } from "next/navigation";

export default function AuthErrorRedirectPage() {
  redirect("/kk/auth/error");
}
