import { createClient } from "@base44/sdk";

const base44 = createClient({
  appId: "6982aeeac07b5fe31993f3f1"
});

const ORDERBUMP_PRODUCT_ID = "104845969";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" });
  }

  try {
    const body = req.body;
    const event = body?.event;
    const email = body?.data?.buyer?.email;
    const product = body?.data?.product?.name;
    const productId = String(body?.data?.product?.id || "");
    const transaction = body?.data?.purchase?.transaction;

    const isOrderBump =
      body?.data?.order_bump?.is_order_bump === true ||
      productId === ORDERBUMP_PRODUCT_ID;

    console.log("Evento recebido:", JSON.stringify({ event, email, transaction, product, productId, isOrderBump }));

    if (!transaction) {
      return res.status(200).json({ received: true, skipped: "no transaction" });
    }

    // --- LÓGICA DE COMPRA APROVADA ---
    if (event === "PURCHASE_APPROVED") {
      // Verifica se já existe um registro de APROVAÇÃO para esta transação
      const existing = await base44.entities.AccessRequests.filter({ 
        transaction: transaction,
        status: "approved" 
      });

      if (existing && existing.length > 0) {
        console.log("Duplicata de APROVAÇÃO ignorada:", transaction);
        return res.status(200).json({ received: true, duplicate: true });
      }

      await base44.entities.AccessRequests.create({
        email, product, transaction,
        status: "approved",
        processed: false,
        orderbump: isOrderBump,
      });

      console.log("Acesso criado para:", email, "| OrderBump:", isOrderBump);
      return res.status(200).json({ received: true });
    }

    // --- LÓGICA DE CANCELAMENTO / REEMBOLSO ---
    if (event === "PURCHASE_CANCELLED" || event === "PURCHASE_REFUNDED" || event === "PURCHASE_CANCELED") {
      
      // 1. Atualiza a tabela de Acessos Premium (Bloqueio no App)
      const premiumList = await base44.entities.PremiumAccess.filter({ user_id: email });
      for (const record of premiumList) {
        if (isOrderBump) {
          await base44.entities.PremiumAccess.update(record.id, { orderbump: false });
        } else {
          await base44.entities.PremiumAccess.update(record.id, { ativo: false });
        }
      }

      // 2. Atualiza o status na tabela de pedidos para 'cancelled'
      // Aqui removemos a trava de duplicata para permitir a atualização
      const accessList = await base44.entities.AccessRequests.filter({ transaction });
      for (const record of accessList) {
        // Só atualiza se ainda não estiver cancelado
        if (record.status !== "cancelled") {
          await base44.entities.AccessRequests.update(record.id, { status: "cancelled" });
        }
      }

      console.log("Acesso revogado com sucesso para:", email);
      return res.status(200).json({ received: true, revoked: true });
    }

    return res.status(200).json({ received: true, ignored: event });

  } catch (err) {
    console.error("ERRO no webhook:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
