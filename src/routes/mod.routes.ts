import { FastifyInstance } from "fastify";
import { getAllMods, getModById } from "src/controllers/mod.controller";

export async function routes(fastify: FastifyInstance, options) {
  fastify.get("/", getAllMods);
  fastify.get("/:id", getModById);
}
