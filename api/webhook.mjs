import { createClient } from "@base44/sdk";

const base44 = createClient({
  appId: "SEU_APP_ID"
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" });
  }

  const body = req.body;
  const email = body?.data?.buyer?.email;
  const product = body?.data?.product?.name;
  const transaction = body?.data?.purchase?.transaction;

  console.log("Compra recebida:", email, transaction);

  // Verifica se já existe um registro com essa transaction
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

  console.log("Registrado no Base44!");
  return res.status(200).json({ received: true });
}
