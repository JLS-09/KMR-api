import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "src/models/user.model";

export async function getAllUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await User.find().exec();
    reply.send(users);
  } catch (error) {
    reply.status(500).send(error)
  }
}

export async function getUserById(request: FastifyRequest, reply: FastifyReply) {
  try {
    reply.send("not implemented yet")
  } catch (error) {
    reply.status(500).send(error)
  }
}

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = new User(request.body);
    const result = await user.save();
    reply.send(result);
  } catch (error) {
    reply.status(500).send(error)
  }
}
