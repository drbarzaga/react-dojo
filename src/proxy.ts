import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "./lib/auth"
import { PROTECTED_API_ROUTES } from "./lib/constants"

const intlMiddleware = createMiddleware(routing)

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
