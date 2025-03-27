import { NextApiRequest } from "next";

import { db } from "@/config/db";
import { getCurrentUser } from "@/handlers/serverUtils/user.utils";
import { NextApiResponse } from "next";
import { albums } from "@/schema/albums.schema";
import { count, desc, eq, and, isNotNull } from "drizzle-orm";
import { assets } from "@/schema/assets.schema";
import { albumsAssetsAssets } from "@/schema/albumAssetsAssets.schema";
import { assetFaces, person } from "@/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id } = req.query as { id: string };

  const dbAlbumPeople = await db.select({
    id: person.id,
    name: person.name,
    thumbnailAssetId: person.faceAssetId,
    numberOfPhotos: count(assets.id), 
  })
    .from(albums)
    .leftJoin(albumsAssetsAssets, eq(albums.id, albumsAssetsAssets.albumsId))
    .leftJoin(assets, eq(albumsAssetsAssets.assetsId, assets.id))
    .leftJoin(assetFaces, eq(assets.id, assetFaces.assetId))
    .leftJoin(person, and(eq(assetFaces.personId, person.id), eq(person.isHidden, false)))
    .where(and(eq(albums.ownerId, currentUser.id), eq(albums.id, id), isNotNull(person.id)))
    .orderBy(desc(person.name))
    .groupBy(person.id);  

  res.status(200).json(dbAlbumPeople);
}