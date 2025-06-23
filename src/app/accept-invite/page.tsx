import { acceptWorkspaceInvitation } from "@/app/actions/workspace/actions";
import { redirect } from "next/navigation";

interface AcceptInvitePageProps {
  searchParams: { token?: string };
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const token = searchParams.token;
  if (!token) {
    redirect("/");
  }
  await acceptWorkspaceInvitation(token as string);
  redirect("/");
}
