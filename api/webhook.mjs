import { createClient } from "@base44/sdk";

const base44 = createClient({
  appId: "SEU_APP_ID"
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" });
  }

  const body = req.body;
  const event = body?.event;
  const email = body?.data?.buyer?.email;
  const product = body?.data?.product?.name;
  const transaction = body?.data?.purchase?.transaction;

  // IMPORTANTE: logue o evento para ver o nome exato que a Hotmart envia
  console.log("Evento recebido:", JSON.stringify({ event, email, transaction }));

  if (event === "PURCHASE_APPROVED") {
    if (!transaction) {
      return res.status(200).json({ received: true, skipped: "no transaction" });
    }

    const existing = await base44.entities.AccessRequests.filter({ transaction });
    if (existing && existing.length > 0) {
      console.log("Duplicata ignorada:", transaction);
      return res.status(200).json({ received: true, duplicate: true });
    }

    await base44.entities.AccessRequests.create({
      email, product, transaction,
      status: "approved",
      processed: false,
    });

    console.log("Acesso criado para:", email);
    return res.status(200).json({ received: true });
  }

  if (event === "PURCHASE_CANCELLED" || event === "PURCHASE_REFUNDED" || event === "PURCHASE_CANCELED") {
    const premiumList = await base44.entities.PremiumAccess.filter({ user_id: email });
    for (const record of premiumList) {  // ← era "req", conflitava com o handler
      await base44.entities.PremiumAccess.update(record.id, { ativo: false });
    }

    const accessList = await base44.entities.AccessRequests.filter({ transaction });
    for (const record of accessList) {
      await base44.entities.AccessRequests.update(record.id, { status: "cancelled" });
    }

    console.log("Acesso revogado para:", email);
    return res.status(200).json({ received: true, revoked: true });
  }

  return res.status(200).json({ received: true, ignored: event });
}
