export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" });
  }

  try {

    const body = req.body;

    console.log("Webhook recebido:", body);

    return res.status(200).json({
      success: true,
      received: body
    });

  } catch (error) {

    console.error("Erro no webhook:", error);

    return res.status(500).json({
      error: "Erro interno"
    });

  }

}
