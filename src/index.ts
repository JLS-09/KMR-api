import Fastify from "fastify";
import scheduleGitActions from "./git/gitActions";
import mongoose from "mongoose";
import { routes } from "./routes/user.routes";

const dbUrl = process.env.DATABASE_URL;

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

fastify.register(routes, { prefix: '/api/users' })

async function main() {
  await fastify.listen({
    port: 3000,
    host: "0.0.0.0"
  })

  try {
    if (dbUrl){
      await mongoose.connect(dbUrl);
    }
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
    }
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(error) {
    console.log(error);
  }

  scheduleGitActions();
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close()

    process.exit(0);
  })
})

main();
