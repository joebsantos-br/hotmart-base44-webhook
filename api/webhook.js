export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" })
  }

  try {

    const body = req.body

    console.log("Webhook recebido:", body)

    const email = body?.data?.buyer?.email
    const product = body?.data?.product?.name
    const transaction = body?.data?.purchase?.transaction

    console.log("Email:", email)
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

    // aqui você pode salvar no Base44 depois

    return res.status(200).json({ received: true })

  } catch (error) {

    console.error("Erro no webhook:", error)

    return res.status(200).json({
      received: true,
      error: true
    })

  }

}
