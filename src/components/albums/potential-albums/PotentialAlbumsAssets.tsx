import { usePhotoSelectionContext } from "@/contexts/PhotoSelectionContext";
import { listPotentialAlbumsAssets } from "@/handlers/api/album.handler";
import type { IAsset } from "@/types/asset";
import React, { useEffect, useMemo, useState } from "react";
import { CalendarArrowUp, Hourglass } from "lucide-react";
import { useConfig } from "@/contexts/ConfigContext";
import AssetGrid from "@/components/shared/AssetGrid";

export default function PotentialAlbumsAssets() {
  const { exImmichUrl } = useConfig();
  const {
    selectedIds,
    assets,
    updateContext,
    config
  } = usePhotoSelectionContext();
  const { startDate } = config;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAssets = async () => {
    if (!startDate) return;
    setLoading(true);
    updateContext({
      assets: [],
      selectedIds: [],
    });
    return listPotentialAlbumsAssets({ startDate })
      .then((fetchedAssets) => updateContext({ assets: fetchedAssets }))
      .catch(setErrorMessage)
      .finally(() => setLoading(false));
  };

  const processedAssets = useMemo(() => {
    const sortedAssets = [...assets].sort((a, b) => {
      try {
        return new Date(a.dateTimeOriginal ?? 0).getTime() - new Date(b.dateTimeOriginal ?? 0).getTime();
      } catch {
        return 0;
      }
    });

    return sortedAssets.map((asset) => ({
      ...asset,
      tags: [
        {
          title: "Immich Link",
          value: (
            <a href={`${exImmichUrl}/photos/${asset.id}`} target="_blank" rel="noreferrer">
              Open in Immich
            </a>
          ),
        },
      ],
    }));
  }, [assets, exImmichUrl]);

  const handleSelectionChange = (ids: string[]) => {
    updateContext({ selectedIds: ids });
  };

  useEffect(() => {
    if (startDate) fetchAssets();
  }, [startDate]);

  if (loading)
    return (
      <div className="flex flex-col gap-2 min-h-full justify-center items-center w-full">
        <Hourglass />
        <p className="text-lg">Loading...</p>
      </div>
    );

  if (!startDate)
    return (
      <div className="flex flex-col gap-2 min-h-full justify-center items-center w-full">
        <CalendarArrowUp />
        <p className="text-lg">Please select a date</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-400">
          When you select a date from the left, you will see all the potential album
          assets captured on that date
        </p>
      </div>
    );

  return (
    <div className="w-full overflow-y-auto max-h-[calc(100vh-60px)]">
      <AssetGrid
        assets={processedAssets}
        isInternal={true}
        selectable={true}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
