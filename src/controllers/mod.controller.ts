import { FastifyReply, FastifyRequest } from "fastify";
import { Mod } from "src/models/mod.model";
import { Version } from "src/models/version.model";

interface CursorQuery {
  page_size?: string;
  cursor?: string;
  mod_filter?: string;
  author_filter?: string;
}

export async function getAllMods(request: FastifyRequest<{ Querystring: CursorQuery }>, reply: FastifyReply) {
  try {
    const { page_size, cursor, mod_filter, author_filter } = request.query;
    const limit = Math.min(parseInt(page_size ?? '20', 10), 100);
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const conditions: any[] = [];

    if (cursor) {
      conditions.push({ _id: { $gte: cursor } });
    }
    if (mod_filter) {
      const regex = new RegExp(escapeRegex(mod_filter), 'i');
      conditions.push({
        $or: [
          { _id: regex },
          { name: regex },
        ],
      });
    }
    if (author_filter) {
      conditions.push({ author: { $regex: escapeRegex(author_filter), $options: 'i' } });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};
    const mods = await Mod.find(filter)
      .sort({ _id: 1 })
      .limit(limit + 1)
      .exec();

    const hasNextPage = mods.length > limit;
    const nextCursor = hasNextPage ? mods[mods.length - 1]._id : null;
    const items = hasNextPage ? mods.slice(0, limit) : mods;

    const ids = items.map(m => m._id);
    const latestVersions = await Version.aggregate([
      { $match: { identifier: { $in: ids } } },
      { $sort: { release_date: -1 } },
      {
        $group: {
          _id: '$identifier',
          latest: { $first: '$$ROOT' },
        },
      },
    ]);

    const latestByMod = new Map<string, any>();
    for (const entry of latestVersions) {
      latestByMod.set(entry._id, entry.latest);
    }

    const data = items.map(m => ({
      ...m.toObject(),
      latest_version: latestByMod.get(m._id as string) ?? null,
    }));

    reply.send({
      data,
      pagination: { nextCursor, hasNextPage },
    });
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
