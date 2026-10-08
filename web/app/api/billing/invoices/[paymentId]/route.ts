import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/server"
import { DodoPayments } from "dodopayments"

const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment: "test_mode",
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentId } = await params

    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 })
    }

    // Retrieve invoice PDF from Dodo
    const invoiceResponse = await dodoPayments.invoices.payments.retrieve(paymentId)

    const arrayBuffer = await invoiceResponse.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invokix-invoice-${paymentId}.pdf"`,
      },
    })
  } catch (err: any) {
    console.error("[dodo-invoice-download-error]", err)
    return NextResponse.json(
      { error: err?.message || "Failed to download invoice" },
      { status: 500 }
    )
  }
}
