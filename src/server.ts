import fastify from "fastify";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";

const app = fastify();

app.register(transactionsRoutes);
app.register(transactionsRoutes, {
  prefix: "transactions",
});

const port = env.PORT;

app
  .listen({
    port,
  })
  .then(() => {
    console.log(`HTTP Server Running! ${port}`);
  });
