import { Router } from "express";
import { z } from "zod";
import { pushPublicKey, removeSubscription, saveSubscription } from "../db/push.js";
import { authenticate } from "../middleware/authenticate.js";

export const pushRouter = Router();

/** Açıq açar — brauzerin abunə olması üçün. Açar yoxdursa null qaytarılır. */
pushRouter.get("/key", (_request, response) => {
  response.json({ data: { publicKey: pushPublicKey() } });
});

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({
    p256dh: z.string().min(20).max(300),
    auth: z.string().min(10).max(300),
  }).strict(),
}).strict();

pushRouter.post("/subscribe", authenticate, async (request, response) => {
  const input = subscriptionSchema.parse(request.body);
  await saveSubscription(request.auth!.userId, input, request.get("user-agent") ?? "");
  response.status(201).json({ data: { subscribed: true } });
});

pushRouter.post("/unsubscribe", authenticate, async (request, response) => {
  const { endpoint } = z.object({ endpoint: z.string().url().max(1000) }).strict().parse(request.body);
  await removeSubscription(request.auth!.userId, endpoint);
  response.status(204).send();
});
