import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

const PROTECTED = ["/account"];
const AUTH_PAGES = ["/sign-in", "/create-account", "/forgot-password"];

/** Refreshes the session cookie and guards /account. Validates with getUser(), never getSession(). */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!data.user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const to = request.nextUrl.clone();
    to.pathname = "/sign-in";
    to.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(to);
  }
  // /sign-in?email=... or ?add=1 is the "switch / add account" flow and must stay reachable while signed in.
  const q = request.nextUrl.searchParams;
  const switching = path === "/sign-in" && (q.has("email") || q.get("add") === "1");
  if (data.user && AUTH_PAGES.includes(path) && !switching) {
    const to = request.nextUrl.clone();
    to.pathname = "/account";
    to.search = "";
    return NextResponse.redirect(to);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
