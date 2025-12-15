import { FastifyReply, FastifyRequest } from "fastify";
import { Version } from "src/models/version.model";

export async function getVersionByModId(request: FastifyRequest, reply: FastifyReply) {
  try {
    const versions = await Version.find({identifier: request.id});
    reply.send(versions);
  } catch (error) {
    reply.status(500).send(error);
  }
}
