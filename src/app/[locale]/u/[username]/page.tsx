import { ProfilePage } from "@/components/profile-page"
import { db } from "@/db"
import { user as userTable } from "@/db/schema"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { buildPageMetadata } from "@/lib/metadata"
import { buildProfileData, type ProfileUser } from "@/lib/profile-data"
import { eq, or } from "drizzle-orm"
import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ locale: string; username: string }>
}

/** Resolves a public profile by GitHub handle, falling back to the user id (older accounts). */
async function resolveUser(handle: string): Promise<ProfileUser | null> {
  const decoded = decodeURIComponent(handle)
  const row = await db.query.user.findFirst({
    where: or(eq(userTable.username, decoded), eq(userTable.id, decoded)),
    columns: { id: true, name: true, image: true, createdAt: true },
  })
  return row ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, username } = await params
  const found = await resolveUser(username)
  const t = await getTranslations({ locale, namespace: "PublicProfile" })

  if (!found) {
    return buildPageMetadata({
      title: t("notFoundTitle"),
      description: t("notFoundDesc"),
      path: `/u/${username}`,
      locale,
      type: "website",
    })
  }

  return buildPageMetadata({
    title: t("metaTitle", { name: found.name }),
    description: t("metaDesc", { name: found.name }),
    path: `/u/${username}`,
    locale,
    type: "website",
  })
}

export default async function PublicProfileRoute({ params }: Props) {
  const { locale, username } = await params
  const found = await resolveUser(username)
  if (!found) notFound()

  const [data, t] = await Promise.all([
    buildProfileData(found, locale as Locale),
    getTranslations({ locale, namespace: "PublicProfile" }),
  ])

  return (
    <div>
      <div className="mx-auto max-w-[820px] px-5 pt-6 md:px-10">
        <Link
          href="/directory"
          className="text-fg-dim hover:text-fg-muted inline-flex items-center gap-1.5 font-mono text-[12px] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          {t("backToDirectory")}
        </Link>
      </div>
      <ProfilePage {...data} />
    </div>
  )
}
