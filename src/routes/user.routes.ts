import { FastifyInstance } from "fastify";
import { getAllUsers, getUserById, createUser } from "../controllers/user.controller"

export async function routes(fastify: FastifyInstance, options) {
  fastify.get("/", getAllUsers);
  fastify.get("/:id", getUserById);
  fastify.post("/", createUser);
}
