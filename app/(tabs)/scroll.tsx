import { useAssets } from "expo-asset";
import { ScrollableCardList } from "@/components/ScrollableCards/ScrollableCardList";
import { useMemo } from "react";

export default function ScrollScreen() {
  const [assets] = useAssets([
    require("@/assets/images/image_01.png"),
    require("@/assets/images/image_02.jpg"),
    require("@/assets/images/image_03.jpg"),
    require("@/assets/images/image_04.jpg"),
    require("@/assets/images/image_02.jpg"),
    require("@/assets/images/image_03.jpg"),
    require("@/assets/images/image_04.jpg"),
  ]);
  const items = useMemo(
    () =>
      assets?.map((item, index) => ({
        asset: item,
      })),
    [assets]
  );
  return <ScrollableCardList items={items ?? []} />;
}
