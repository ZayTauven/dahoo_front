import { NextResponse, type NextRequest } from "next/server";

/*
 * Vérifications optimistes uniquement (guide Next « authentication ») : on se fie à la présence du
 * cookie de session, sans appel à l'API. L'autorisation réelle est faite par Django à chaque requête.
 */

const REFRESH_COOKIE = "dahoo_refresh";
const PROTECTED_PREFIXES = ["/espace", "/plateforme"];
const LOGIN_PATH = "/connexion";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Pages : une seule URL canonique, sans barre finale (le relais d'API la conserve, lui).
  if (pathname.length > 1 && pathname.endsWith("/") && !pathname.startsWith("/api/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }

  const hasSession = request.cookies.has(REFRESH_COOKIE);
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtected && !hasSession) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("suite", pathname + search);
    return NextResponse.redirect(url);
  }
  if (pathname === LOGIN_PATH && hasSession) {
    return NextResponse.redirect(new URL("/espace", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Ni les fichiers statiques, ni les images optimisées, ni les fichiers publics avec extension.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
