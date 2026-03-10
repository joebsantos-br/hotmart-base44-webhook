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

  console.log("Evento recebido:", event, email);

  // Compra aprovada → cria acesso
  if (event === "PURCHASE_APPROVED") {
    const existing = await base44.entities.AccessRequests.filter({ transaction });
    if (existing && existing.length > 0) {
      console.log("Duplicata ignorada:", transaction);
      return res.status(200).json({ received: true, duplicate: true });
    }

    await base44.entities.AccessRequests.create({
      email,
      product,
      transaction,
      status: "approved",
      processed: false,
    });

    console.log("Acesso criado para:", email);
    return res.status(200).json({ received: true });
  }

  // Cancelamento ou reembolso → revoga acesso
  if (event === "PURCHASE_CANCELLED" || event === "PURCHASE_REFUNDED") {
    // Desativa o PremiumAccess pelo email (user_id = email)
    const premiumList = await base44.entities.PremiumAccess.filter({ user_id: email });
    for (const premium of premiumList) {
      await base44.entities.PremiumAccess.update(premium.id, { ativo: false });
    }

    // Marca o AccessRequest como cancelado
    const requests = await base44.entities.AccessRequests.filter({ transaction });
    for (const req of requests) {
      await base44.entities.AccessRequests.update(req.id, { status: "cancelled" });
    }

    console.log("Acesso revogado para:", email);
    return res.status(200).json({ received: true, revoked: true });
  }

  // Qualquer outro evento, ignora
  return res.status(200).json({ received: true, ignored: true });
}
