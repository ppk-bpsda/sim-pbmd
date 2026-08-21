import { redirect } from "next/navigation";

export default function RootPage() {
  // Middleware yang menentukan tujuan akhir (dashboard jika sudah login, login jika belum)
  redirect("/dashboard");
}
