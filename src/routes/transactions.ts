import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, replay) => {
      const { sessionId } = request.cookies;

      console.log(sessionId);

      const transactions = await knex("transactions")
        .where("session_id", sessionId)
        .select();
      return { transactions };
    }
  );

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex("transactions")
      .where({
        session_id: sessionId,
        id,
      })
      .first();

    return { transaction };
  });

  app.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request, replay) => {
      const { sessionId } = request.cookies;

      const summary = await knex("transactions")
        .where("session_id", sessionId)
        .sum("amount", { as: "amount" })
        .first();

      return { summary };
    }
  );

  app.post("/", async (request, replay) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sesseionId = request.cookies.sesseionId;

    if (!sesseionId) {
      sesseionId = randomUUID();

      replay.cookie("sessionId", sesseionId, {
        path: "/",
        maxAge: 1000 * 60 * 24 * 7, // 7 dias
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sesseionId,
    });

    return replay.status(201).send();
  });
}
