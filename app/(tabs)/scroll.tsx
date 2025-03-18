import { ScrollableCardList } from "@/components/ScrollableCards/ScrollableCardList";
import { ScrollableItems } from "@/constants/Trivia";

export default function ScrollScreen() {
  return <ScrollableCardList items={ScrollableItems} />;
}
