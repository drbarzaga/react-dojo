import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"
import { getLocale } from "next-intl/server"
import { cookies } from "next/headers"

const themeScript = `(function(){try{var s=localStorage.getItem("theme"),p=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches,t=s||(p?"dark":"light");document.documentElement.dataset.theme=t;if(t==="dark")document.documentElement.classList.add("dark")}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.classList.add("dark")}})();`

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark"

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} ${theme === "dark" ? "dark" : ""}`.trim()}
    >
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
