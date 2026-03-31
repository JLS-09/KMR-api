import { FastifyReply, FastifyRequest } from "fastify";
import { Mod } from "src/models/mod.model";


export async function getAllMods(request: FastifyRequest, reply: FastifyReply) {
  try {
    const urlParameters: any = request.query;
        
    const mods = await Mod.find(
      {},
      null,
      {
        skip: (urlParameters.page - 1) * urlParameters.page_size,
        limit: urlParameters.page_size
      }
    ).exec();
    
    reply.send(mods);
  } catch (error) {
    reply.status(500).send(error);
  }
}

export async function getModById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const params: any = request.params;
    
    const mod = await Mod.findOne({_id: params.id}).exec();
    reply.send(mod);
  } catch (error) {
    reply.status(500).send(error);
  }
}
