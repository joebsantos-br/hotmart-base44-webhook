import { createClient } from "@base44/sdk";

const base44 = createClient({
  appId: "SEU_APP_ID" // ex: "6982aeeac07b5fe31993f3f1" — está na URL do editor do Base44
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "Webhook ativo" })
  }

  const body = req.body
  const email = body?.data?.buyer?.email
  const product = body?.data?.product?.name
  const transaction = body?.data?.purchase?.transaction

  console.log("Compra recebida:", email)

  await base44.entities.AccessRequests.create({
    email,
    product,
    transaction,
    status: "approved",
    processed: false,
  });

  console.log("Registrado no Base44!")
  return res.status(200).json({ received: true })
}
