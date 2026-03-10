export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" });
  }

  try {

    const base44 = await import("@base44/sdk");

    const body = req.body;

    console.log("Webhook recebido:", body);

    const email = body?.buyer?.email || "teste@email.com";
    const product = body?.product?.name || "Produto Teste";
    const transaction = body?.purchase?.transaction || "HP_TEST";

    await base44.data.AccessRequests.create({
      email: email,
      product: product,
      transaction: transaction,
      status: "approved"
    });

    console.log("Registro criado no Base44");

    return res.status(200).json({
      success: true
    });

  } catch (error) {

    console.error("Erro no webhook:", error);

    return res.status(500).json({
      error: error.message
    });

  }

}
