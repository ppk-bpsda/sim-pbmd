import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/repositories/profileRepository";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const currentUser = await getCurrentUser(supabase);

  // Lapisan kedua selain middleware (§20: jangan andalkan satu lapis saja).
  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-surface-muted">
      <Sidebar roles={currentUser.roles} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={currentUser} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
