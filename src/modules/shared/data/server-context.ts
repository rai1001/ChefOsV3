import { redirect } from "next/navigation";
import { getServerUser } from "@/modules/auth/data/session.server";
import { getActiveMembership } from "@/modules/orgs/data/orgs.server";

export const requireUserContext = async () => {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const membership = await getActiveMembership(user.id);
  if (!membership) redirect("/login");

  return { user, membership };
};
