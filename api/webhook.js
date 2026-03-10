export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" });
  }

  try {

    const body = req.body;

    console.log("Webhook recebido:", body);

    const email = body?.buyer?.email || "teste@email.com";
    const product = body?.product?.name || "Produto Teste";
    const transaction = body?.purchase?.transaction || "HP_TEST";

    const response = await fetch(
      `https://api.base44.com/v1/${process.env.BASE44_PROJECT_ID}/data/AccessRequests`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.BASE44_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          product,
          transaction,
          status: "approved"
        })
      }
    );

    const result = await response.json();

    console.log("Base44 resposta:", result);

    return res.status(200).json({ success: true });

  } catch (error) {

    console.error("Erro no webhook:", error);

    return res.status(500).json({ error: error.message });

  }

}
