import { getDevelopers } from "@/lib/get-developers"

export async function GET() {
  const developers = await getDevelopers()
  return Response.json(developers)
}
