import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: '6982aeeac07b5fe31993f3f1',
  apiKey: process.env.BASE44_API_KEY
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const data = req.body;

    const email = data?.data?.buyer?.email;
    const produto = data?.data?.product?.name || "Baby Recetas";

    if (!email) {
      return res.status(400).json({ error: "Email não encontrado" });
    }

    await base44.asServiceRole.entities.AccessRequests.create({
      email: email,
      produto: produto,
      status: "approved"
    });

    return res.status(200).json({ success: true });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Erro ao processar webhook"
    });

  }

}
