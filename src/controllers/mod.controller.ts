import { FastifyReply, FastifyRequest } from "fastify";
import { Mod } from "src/models/mod.model";


export async function getAllMods(request: FastifyRequest, reply: FastifyReply) {
  try {
    const mods = await Mod.find().exec();
    reply.send(mods);
  } catch (error) {
    reply.status(500).send(error);
  }
}

export async function getModById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const mod = await Mod.findById(request.id);
    reply.send(mod);
  } catch (error) {
    reply.status(500).send(error);
  }
}
