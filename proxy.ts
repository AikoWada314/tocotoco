import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { COOKIE_OPTIONS } from "@/app/_libs/cookieOptions";

// tocotocoは未ログインでも閲覧できる公開型のため、保護したいパスだけを列挙する
const PROTECTED_PATHS = ["/mypage", "/posts/new", "/spots/new", "/events/new"];

export const proxy = async (request: NextRequest) => {
  const ref = { response: NextResponse.next({ request }) };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          ref.response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            ref.response.cookies.set(name, value, {
              ...options,
              ...COOKIE_OPTIONS,
            }),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected =
    PROTECTED_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.endsWith("/reviews/new") ||
    pathname.endsWith("/edit");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return ref.response;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
