import { FastifyReply, FastifyRequest } from "fastify";
import { Version } from "src/models/version.model";

export async function getVersionByModId(request: FastifyRequest, reply: FastifyReply) {
  try {
    const params: any = request.params;
    const versions = await Version.find({identifier: params.id});
    reply.send(versions);
  } catch (error) {
    reply.status(500).send(error);
  }
}
