import { Base44Client } from "@base44/sdk";

const base44 = new Base44Client({
  apiKey: process.env.BASE44_API_KEY,
  projectId: process.env.BASE44_PROJECT_ID,
});

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {

    const payload = req.body;

    const event = payload.event;
    const email = payload?.data?.buyer?.email;
    const product = payload?.data?.product?.name;
    const transaction = payload?.data?.purchase?.transaction;

    if (!email || !transaction) {
      return res.status(400).json({ error: "Missing required data" });
    }

    console.log("Evento recebido:", event, email);

    if (event === "PURCHASE_APPROVED") {

      await base44.entities.AccessRequests.create({
        email: email,
        product: product,
        transaction: transaction,
        status: "approved"
      });

    }

    if (event === "PURCHASE_REFUNDED" || event === "PURCHASE_CANCELED") {

      const records = await base44.entities.AccessRequests.list({
        filter: {
          transaction: transaction
        }
      });

      if (records.length > 0) {
        await base44.entities.AccessRequests.update(records[0].id, {
          status: "revoked"
        });
      }

    }

    return res.status(200).json({ success: true });

  } catch (error) {

    console.error("Erro no webhook:", error);

    return res.status(500).json({
      error: "Internal error"
    });

  }

}
