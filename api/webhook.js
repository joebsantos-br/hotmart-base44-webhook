export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" })
  }

  try {

    const body = req.body

    console.log("Webhook recebido:", body)

    const event = body?.event

    // Aceitar apenas compra aprovada
    if (event !== "PURCHASE_APPROVED") {

      console.log("Evento ignorado:", event)

      return res.status(200).json({
        received: true,
        ignored: true
      })

    }

    const email = body?.data?.buyer?.email
    const product = body?.data?.product?.name
    const transaction = body?.data?.purchase?.transaction

    console.log("Compra aprovada para:", email)

    // Criar registro na entity AccessRequests
    await fetch(process.env.BASE44_API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.BASE44_API_KEY}`
      },

      body: JSON.stringify({

        email: email,
        product: product,
        transaction: transaction,
        status: "approved"

      })

    })

    console.log("Registro enviado ao Base44")

    return res.status(200).json({
      received: true,
      processed: true
    })

  } catch (error) {

    console.error("Erro no webhook:", error)

    return res.status(200).json({
      received: true,
      error: true
    })

  }

}
