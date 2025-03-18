import { useAssets } from "expo-asset";
import { ScrollableCardList } from "@/components/ScrollableCards/ScrollableCardList";
import { ScrollableItems } from "@/constants/Trivia";
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
      ScrollableItems.map((item, index) => ({
        asset: assets?.[index],
      })),
    [assets]
  );
  return <ScrollableCardList items={items} />;
}
