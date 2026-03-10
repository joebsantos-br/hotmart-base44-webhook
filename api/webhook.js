export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" })
  }

  try {
    const body = req.body
    const email = body?.data?.buyer?.email
    const product = body?.data?.product?.name
    const transaction = body?.data?.purchase?.transaction

    console.log("Compra recebida:", email)

    // Chama a API do Base44 diretamente
    const response = await fetch("https://api.base44.com/v1/apps/6982aeeac07b5fe31993f3f1/entities/AccessRequests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "c45a9003b8d54568abac2d6679810e45"
      },
      body: JSON.stringify({
        email,
        product,
        transaction,
        status: "approved",
        processed: false
      })
    })

    console.log("Resposta Base44:", response.status)
    return res.status(200).json({ received: true })

  } catch (error) {
    console.error("Erro:", error)
    return res.status(200).json({ received: true, error: true })
  }
}
