export default async function handler(req, res) {

  // Permite testar no navegador
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" })
  }

  try {

    const body = req.body

    const event = body?.event

    // Ignora eventos que não são compra aprovada
    console.log("Evento recebido:", event)

    const email = body?.data?.buyer?.email
    const product = body?.data?.product?.name
    const transaction = body?.data?.purchase?.transaction

    console.log("Compra recebida:", email)

    // URL do Base44
    const url = `https://baby-bites-hub.base44.app/webhookaccess?email=${encodeURIComponent(email)}&product=${encodeURIComponent(product)}&transaction=${encodeURIComponent(transaction)}`

    // Envia dados para o Base44
    await fetch(url, {
  method: "GET"
})

    console.log("Enviado para Base44")

    return res.status(200).json({ received: true })

  } catch (error) {

    console.error("Erro:", error)

    return res.status(200).json({
      received: true,
      error: true
    })

  }

}
