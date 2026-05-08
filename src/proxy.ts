import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "./lib/auth"

const intlMiddleware = createMiddleware(routing)

const PROTECTED_API_ROUTES = ["/api/users", "/api/progress/sync"]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/api")) return intlMiddleware(request)

  const isProtectedApi = PROTECTED_API_ROUTES.some((path) => pathname.startsWith(path))
  if (!isProtectedApi) return NextResponse.next()

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
}
