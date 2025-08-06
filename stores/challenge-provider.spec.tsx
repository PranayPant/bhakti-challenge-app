import { renderHook } from '@testing-library/react-native';
import { ChallengeStoreProvider, useChallengeStore } from './challenge-provider';

describe('useChallengeStore', () => {
  it('should initialize state correctly', () => {
    // Test implementation
    const { result } = renderHook(() => useChallengeStore((state) => state), {
      wrapper: ChallengeStoreProvider
    });
    expect(result.current.language).toBe('hindi');
    expect(result.current.filterString).toBe('');
    expect(result.current.sortOrder).toBe('asc');
    expect(result.current.dataIndexOne).toBe(0);
    expect(result.current.dataIndexTwo).toBe(1);
    expect(result.current.dataIndexThree).toBe(2);
  });

  it('should throw error when used outside of provider', () => {
    // Test that the hook throws an error when used without the provider
    expect(() => {
      renderHook(() => useChallengeStore((state) => state));
    }).toThrow('useChallengeStore must be used within ChallengeStoreProvider');
  });
});
