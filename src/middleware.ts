import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect semua route /nexoraa/* kecuali halaman login itu sendiri
  if (pathname.startsWith("/nexoraa") && pathname !== "/nexoraa") {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/nexoraa";
      return NextResponse.redirect(loginUrl);
    }
  }

  // Kalau sudah login dan akses halaman login, redirect ke dashboard
  if (pathname === "/nexoraa" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/nexoraa/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/nexoraa/:path*"],
};
