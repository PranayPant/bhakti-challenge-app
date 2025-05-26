import { renderHook, act } from "@testing-library/react-native";
import { useCardPriorities } from "./useCardPriorities";

describe("useCardPriorities", () => {
  it("should initialize card priorities correctly", () => {
    const { result } = renderHook(() => useCardPriorities());
    expect(result.current.priorityOne.value).toBe(0);
    expect(result.current.priorityTwo.value).toBe(1);
    expect(result.current.priorityThree.value).toBe(2);
    expect(result.current.dataIndexOne.value).toBe(0);
    expect(result.current.dataIndexTwo.value).toBe(1);
    expect(result.current.dataIndexThree.value).toBe(2);
  });

  it("should update card priorities on shuffle", () => {
    const { result } = renderHook(() => useCardPriorities());
    act(() => {
      result.current.shuffle();
    });
    expect(result.current.priorityOne.value).toBe(2);
    expect(result.current.priorityTwo.value).toBe(0);
    expect(result.current.priorityThree.value).toBe(1);
    expect(result.current.dataIndexOne.value).toBe(0);
    expect(result.current.dataIndexTwo.value).toBe(1);
    expect(result.current.dataIndexThree.value).toBe(2);

    act(() => {
      result.current.shuffle();
    });
    expect(result.current.priorityOne.value).toBe(1);
    expect(result.current.priorityTwo.value).toBe(2);
    expect(result.current.priorityThree.value).toBe(0);
    expect(result.current.dataIndexOne.value).toBe(3);
    expect(result.current.dataIndexTwo.value).toBe(4);
    expect(result.current.dataIndexThree.value).toBe(2);

    act(() => {
      result.current.shuffle();
    });
    expect(result.current.priorityOne.value).toBe(0);
    expect(result.current.priorityTwo.value).toBe(1);
    expect(result.current.priorityThree.value).toBe(2);
    expect(result.current.dataIndexOne.value).toBe(3);
    expect(result.current.dataIndexTwo.value).toBe(4);
    expect(result.current.dataIndexThree.value).toBe(5);
  });

  it("should update data indices correctly", () => {
    const { result } = renderHook(() => useCardPriorities());

    // Simulate multiple shuffles
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.shuffle();
      });
    }

    // Check if data indices are updated correctly
    expect(result.current.dataIndexOne.value).toEqual(6);
    expect(result.current.dataIndexTwo.value).toEqual(7);
    expect(result.current.dataIndexThree.value).toEqual(5);
  });
});
