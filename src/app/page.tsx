import { redirect } from "next/navigation";
import { getServerSession } from "@/modules/auth/data/session.server";

const HomePage = async () => {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  redirect("/dashboard");
};

export default HomePage;
