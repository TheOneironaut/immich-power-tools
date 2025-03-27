import { db } from "@/config/db";
import { getCurrentUser } from "@/handlers/serverUtils/user.utils";
import { assets, exif } from "@/schema";
import { and, count, desc, eq, isNotNull, ne } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

const columnMap = {
  make: exif.make,
  model: exif.model,
  'focal-length': exif.focalLength,
  city: exif.city,
  state: exif.state,
  country: exif.country,
  iso: exif.iso,
  exposureTime: exif.exposureTime,
  lensModel: exif.lensModel,
  projectionType: exif.projectionType,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { property } = req.query as { property: string };

  const column = columnMap[property as keyof typeof columnMap];
  
  if (!column) {
    return res.status(400).json({
      name: "Error",
    });
  }
  
  try {
    const currentUser = await getCurrentUser(req);
    const dataFromDB = await db.select({
      value: count(),
      label: column,
    })
    .from(exif)
    .leftJoin(assets, eq(assets.id, exif.assetId))
    .where(and(
      isNotNull(column),
      eq(assets.ownerId, currentUser.id),
    ))
    .limit(20)
    .groupBy(column).orderBy(desc(count()));

    return res.status(200).json(dataFromDB);
  } catch (error: any) {
    res.status(500).json({
      error: error?.message,
    });
  }
}
