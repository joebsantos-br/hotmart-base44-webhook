export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {

    const data = req.body;

    console.log("Webhook recebido:", data);

    return res.status(200).json({
      success: true,
      message: "Webhook recebido com sucesso"
    });

  } catch (error) {

    console.error("Erro no webhook:", error);

    return res.status(500).json({
      error: "Erro interno"
    });

  }

}
