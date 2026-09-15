import { next, rewrite } from "@vercel/functions";

const LOCAL_PREFIXES = ["/classic", "/admin", "/api", "/beats", "/assets"];

function isLocalPath(pathname: string) {
  return LOCAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function middleware(request: Request) {
  const url = new URL(request.url);

  if (isLocalPath(url.pathname)) {
    return next();
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    return rewrite(new URL(`https://www.pypes.dev/emmanuel-ajala${url.search}`));
  }

  return rewrite(new URL(`https://www.pypes.dev${url.pathname}${url.search}`));
}

export const config = {
  matcher: ["/((?!classic|admin|api|beats|assets).*)"],
};
