import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Menjaga session Supabase tetap valid (refresh token) pada setiap request,
 * dan menjadi tempat pertama untuk memblokir akses ke area (dashboard) jika belum login.
 * Ini adalah lapisan kenyamanan UX saja — otorisasi sesungguhnya tetap ditegakkan oleh RLS.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");

  // Aplikasi ini tidak punya halaman publik selain /login (§20: default deny).
  // Route group "(dashboard)" TIDAK menambah prefix "/dashboard" pada URL asli
  // (mis. "/profile", "/assets" tetap di path root), jadi seluruh path SELAIN
  // /login diperlakukan sebagai privat.
  if (!user && !isAuthRoute) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
