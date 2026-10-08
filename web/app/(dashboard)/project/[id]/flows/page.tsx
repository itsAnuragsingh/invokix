import { redirect } from "next/navigation"

type Props = { params: Promise<{ id: string }> }

export default async function FlowsPage({ params }: Props) {
  const { id } = await params
  redirect(`/project/${id}`)
}
