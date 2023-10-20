import fastify from "fastify";
import { knex } from "./database";

const app = fastify();

app.get("/hello", async () => {
  console.log("teste");
  const tables = await knex("sqlite_schema").select("*");

  return tables;
});

const port = 3333;

app
  .listen({
    port,
  })
  .then(() => {
    console.log(`HTTP Server Running! ${port}`);
  });
