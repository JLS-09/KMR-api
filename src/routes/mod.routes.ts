import { FastifyInstance } from "fastify";
import { getAllMods, getModById } from "src/controllers/mod.controller";
import { getVersionByModId } from "src/controllers/version.controller";

export async function routes(fastify: FastifyInstance) {
  fastify.get("/", getAllMods);
  fastify.get("/:id", getModById);
  fastify.get("/:id/versions", getVersionByModId);
}
