import { FastifyInstance } from "fastify";
import { getAllMods, getAllModsWithVersions, getModById } from "src/controllers/mod.controller";
import { getVersionByModId } from "src/controllers/version.controller";

export async function routes(fastify: FastifyInstance) {
  fastify.get("/mods", getAllMods);
  fastify.get("/mods/:id", getModById);
  fastify.get("/mods/:id/versions", getVersionByModId);
  fastify.get("/mods/all", getAllModsWithVersions);
}
