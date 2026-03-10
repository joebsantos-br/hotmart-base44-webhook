export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" })
  }

  try {

    const body = req.body

    const event = body?.event

    if (event !== "PURCHASE_APPROVED") {
      console.log("Evento ignorado:", event)
      return res.status(200).json({ received: true })
    }

    const email = body?.data?.buyer?.email
    const product = body?.data?.product?.name
    const transaction = body?.data?.purchase?.transaction

    console.log("Email:", email)

    const url = `https://app.base44.com/apps/6982aeeac07b5fe31993f3f1/webhook-access?email=${encodeURIComponent(email)}&product=${encodeURIComponent(product)}&transaction=${encodeURIComponent(transaction)}`

    await fetch(url)

    console.log("Registro enviado ao Base44")

    return res.status(200).json({ received: true })

  } catch (error) {

    console.error("Erro no webhook:", error)

    return res.status(200).json({
      received: true,
      error: true
    })

  }

}
