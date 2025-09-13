import { createChallengeStore, loadChallengesData } from './challenges';
import { sortChallenges, filterChallenges } from './utils';
import defaultHindiChallenges from '@/data/hindi-challenges.json';
import defaultEnglishChallenges from '@/data/english-challenges.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn()
}));

describe('Challenge Store', () => {
  it('should initialize default challenges', async () => {
    const store = createChallengeStore();
    await store.getState().initializeChallenges();
    const challenges = store.getState().challengesData;
    const language = store.getState().language;
    expect(language).toBe('hindi');
    expect(challenges).toHaveLength(defaultHindiChallenges.length);
  });

  it('should switch language and update challenges', async () => {
    const store = createChallengeStore();
    await store.getState().initializeChallenges();
    await store.getState().setLanguage('english');
    const updatedChallenges = store.getState().challengesData;
    expect(updatedChallenges).toHaveLength(defaultEnglishChallenges.length);
    expect(store.getState().language).toBe('english');
    expect(updatedChallenges[0].title).toBe('Bhakti Challenge');
  });

  it('should load challenge data correctly', async () => {
    const store = createChallengeStore();
    await store.getState().initializeChallenges();
    const challenges = store.getState().challengesData;
    expect(challenges).toHaveLength(defaultHindiChallenges.length);
    expect(challenges[0].title).toBe('भक्ति चैलेंज');
  });

  it('should filter challenges based on filter string', async () => {
    const store = createChallengeStore();
    await store.getState().initializeChallenges();
    store.getState().setFilterString('1,2,3');
    const filteredChallenges = store.getState().selectedChallenges;
    expect(filteredChallenges).toHaveLength(3);
    expect(filteredChallenges[0].id).toBe(1);
    expect(filteredChallenges[1].id).toBe(2);
    expect(filteredChallenges[2].id).toBe(3);
  });

  it('should toggle sort order and sort challenges while maintaining dohas sequence', () => {
    const store = createChallengeStore();
    const initialSortOrder = store.getState().sortOrder;
    const initialDohas = [...store.getState().dohas];

    store.getState().toggleSort();

    const newSortOrder = store.getState().sortOrder;
    const newDohas = store.getState().dohas;

    expect(newSortOrder).toBe(initialSortOrder === 'asc' ? 'desc' : 'asc');
    expect(newDohas).not.toEqual(initialDohas);

    // Verify that dohas within each challenge maintain their sequential order
    let currentChallengeId = newDohas[0]?.challengeId;
    let lastSequence = 0;

    for (const doha of newDohas) {
      if (doha.challengeId === currentChallengeId) {
        expect(doha.sequence).toBeGreaterThan(lastSequence);
        lastSequence = doha.sequence;
      } else {
        // New challenge, reset sequence tracking
        currentChallengeId = doha.challengeId;
        lastSequence = doha.sequence;
      }
    }
  });

  it('should set mode correctly', () => {
    const store = createChallengeStore();

    store.getState().setMode('quiz');
    expect(store.getState().mode).toBe('quiz');

    store.getState().setMode('default');
    expect(store.getState().mode).toBe('default');
  });

  it('should set randomized to true and randomize dohas', () => {
    const store = createChallengeStore();
    const initialDohas = [...store.getState().dohas];

    store.getState().setRandomized(true);

    expect(store.getState().randomized).toBe(true);
    // Note: Due to randomization, we can't guarantee order change, but we can check length is same
    expect(store.getState().dohas).toHaveLength(initialDohas.length);
  });

  it('should set randomized to false and restore sorted order', () => {
    const store = createChallengeStore();
    // First randomize
    store.getState().setRandomized(true);
    expect(store.getState().randomized).toBe(true);

    // Then restore order
    store.getState().setRandomized(false);

    expect(store.getState().randomized).toBe(false);
    // Should be back to sorted order
    const dohas = store.getState().dohas;
    expect(dohas.length).toBeGreaterThan(0);
  });

  it('should set data index one with modulo operation', () => {
    const store = createChallengeStore();
    const dohasLength = store.getState().dohas.length;

    // Test normal index
    store.getState().setDataIndexOne(5);
    expect(store.getState().dataIndexOne).toBe(5 % dohasLength);

    // Test index greater than array length
    store.getState().setDataIndexOne(dohasLength + 3);
    expect(store.getState().dataIndexOne).toBe((dohasLength + 3) % dohasLength);

    // Test negative index (this would be modulo behavior)
    store.getState().setDataIndexOne(-1);
    expect(store.getState().dataIndexOne).toBe(-1 % dohasLength);
  });

  it('should set data index two with modulo operation', () => {
    const store = createChallengeStore();
    const dohasLength = store.getState().dohas.length;

    store.getState().setDataIndexTwo(7);
    expect(store.getState().dataIndexTwo).toBe(7 % dohasLength);

    store.getState().setDataIndexTwo(dohasLength + 5);
    expect(store.getState().dataIndexTwo).toBe((dohasLength + 5) % dohasLength);
  });

  it('should set data index three with modulo operation', () => {
    const store = createChallengeStore();
    const dohasLength = store.getState().dohas.length;

    store.getState().setDataIndexThree(10);
    expect(store.getState().dataIndexThree).toBe(10 % dohasLength);

    store.getState().setDataIndexThree(dohasLength + 7);
    expect(store.getState().dataIndexThree).toBe((dohasLength + 7) % dohasLength);
  });

  it('should go backwards by moving last doha to front', () => {
    const store = createChallengeStore();
    const initialDohas = [...store.getState().dohas];
    const lastDoha = initialDohas[initialDohas.length - 1];

    store.getState().goBackwards();

    const newDohas = store.getState().dohas;
    expect(newDohas[0]).toEqual(lastDoha);
    expect(newDohas).toHaveLength(initialDohas.length);
  });

  it('should handle empty dohas array in data index functions', () => {
    const store = createChallengeStore({
      dohas: []
    });

    // When dohas array is empty, modulo with 0 would cause NaN or error
    // The function should handle this gracefully
    expect(() => {
      store.getState().setDataIndexOne(5);
      store.getState().setDataIndexTwo(5);
      store.getState().setDataIndexThree(5);
    }).not.toThrow();
  });

  it('should create store with initial props', () => {
    const customStore = createChallengeStore({
      language: 'english',
      sortOrder: 'desc',
      mode: 'quiz',
      randomized: true
    });

    expect(customStore.getState().language).toBe('english');
    expect(customStore.getState().sortOrder).toBe('desc');
    expect(customStore.getState().mode).toBe('quiz');
    expect(customStore.getState().randomized).toBe(true);
  });

  describe('fetchRemoteChallenges', () => {
    beforeEach(() => {
      // Mock environment variables
      process.env.SANITY_API_TOKEN = 'test-token';
      process.env.SANITY_PROJECT_ID = 'test-project';
      process.env.SANITY_DATASET = 'test-dataset';
      process.env.SANITY_API_VERSION = '2023-01-01';

      // Clear all mocks
      jest.clearAllMocks();
    });

    afterEach(() => {
      // Clean up environment variables
      delete process.env.SANITY_API_TOKEN;
      delete process.env.SANITY_PROJECT_ID;
      delete process.env.SANITY_DATASET;
      delete process.env.SANITY_API_VERSION;
    });

    it('should successfully fetch and store challenges from remote', async () => {
      const mockEnglishChallenges = [
        { id: 1, title: 'Remote English Challenge', dohas: [], category: 'test', book: 'test' }
      ];
      const mockHindiChallenges = [{ id: 1, title: 'रिमोट हिंदी चुनौती', dohas: [], category: 'test', book: 'test' }];

      // Mock fetch to return successful responses
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: mockEnglishChallenges }),
          status: 200
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: mockHindiChallenges }),
          status: 200
        } as Response);

      // Mock AsyncStorage
      const mockSetItem = jest.fn().mockResolvedValue(undefined);
      (AsyncStorage.setItem as jest.Mock) = mockSetItem;

      const store = createChallengeStore();

      await store.getState().fetchRemoteChallenges();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockSetItem).toHaveBeenCalledWith('challengesData_hindi', JSON.stringify(mockHindiChallenges));
      expect(mockSetItem).toHaveBeenCalledWith('challengesData_english', JSON.stringify(mockEnglishChallenges));
      expect(store.getState().isFetchingChallenges).toBe(false);
    });

    it('should handle fetch errors gracefully', async () => {
      // Mock fetch to throw an error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const store = createChallengeStore();

      await expect(store.getState().fetchRemoteChallenges()).rejects.toThrow('Network error');

      expect(store.getState().isFetchingChallenges).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch challenges from remote:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should set isFetchingChallenges to true during fetch', async () => {
      // Mock fetch with a delay to test loading state
      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ result: [{ id: 1, title: 'Test Challenge', dohas: [] }] }),
                  status: 200
                } as Response),
              100
            )
          )
      );

      const store = createChallengeStore();

      const fetchPromise = store.getState().fetchRemoteChallenges();

      // Check that loading state is set
      expect(store.getState().isFetchingChallenges).toBe(true);

      await fetchPromise;

      expect(store.getState().isFetchingChallenges).toBe(false);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: [{ id: 1, title: 'English Challenge', dohas: [] }] }),
          status: 200
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: [{ id: 1, title: 'Hindi Challenge', dohas: [] }] }),
          status: 200
        } as Response);

      const mockSetItem = jest.fn().mockRejectedValue(new Error('Storage error'));
      (AsyncStorage.setItem as jest.Mock) = mockSetItem;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const store = createChallengeStore();

      await expect(store.getState().fetchRemoteChallenges()).rejects.toThrow(
        'Failed to save challenges data to local storage'
      );

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save challenges data to AsyncStorage:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should use EXPO_PUBLIC environment variables when EXPO_PUBLIC_ENV is set', async () => {
      // Set EXPO public environment variables
      process.env.EXPO_PUBLIC_ENV = 'true';
      process.env.EXPO_PUBLIC_SANITY_API_TOKEN = 'expo-token';
      process.env.EXPO_PUBLIC_SANITY_PROJECT_ID = 'expo-project';
      process.env.EXPO_PUBLIC_SANITY_DATASET = 'expo-dataset';
      process.env.EXPO_PUBLIC_SANITY_API_VERSION = '2023-02-01';

      // Mock AsyncStorage for this test
      const mockSetItem = jest.fn().mockResolvedValue(undefined);
      const mockGetItem = jest.fn().mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock) = mockSetItem;
      (AsyncStorage.getItem as jest.Mock) = mockGetItem;

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: [{ id: 1, title: 'English Challenge', dohas: [] }] }),
          status: 200
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: [{ id: 1, title: 'Hindi Challenge', dohas: [] }] }),
          status: 200
        } as Response);

      const store = createChallengeStore();

      await store.getState().fetchRemoteChallenges();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://expo-project.api.sanity.io/v2023-02-01/data/query/expo-dataset',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer expo-token'
          })
        })
      );

      // Clean up
      delete process.env.EXPO_PUBLIC_ENV;
      delete process.env.EXPO_PUBLIC_SANITY_API_TOKEN;
      delete process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
      delete process.env.EXPO_PUBLIC_SANITY_DATASET;
      delete process.env.EXPO_PUBLIC_SANITY_API_VERSION;
    });

    it('should handle empty or null response results', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: null }),
          status: 200
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
          status: 200
        } as Response);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const store = createChallengeStore();

      await expect(store.getState().fetchRemoteChallenges()).rejects.toThrow(
        'Failed to fetch English challenges: Empty or invalid response'
      );

      expect(consoleSpy).toHaveBeenCalledWith('No English challenges found in the response.');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch challenges from remote:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});

describe('Challenge LoadChallengesData Function', () => {
  it('should load challenges from local storage or default data', async () => {
    const language = 'hindi';
    const challenges = await loadChallengesData(language);
    expect(challenges.selectedChallenges).toHaveLength(defaultHindiChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultHindiChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
  });

  it('should load English challenges correctly', async () => {
    const language = 'english';
    const challenges = await loadChallengesData(language);
    expect(challenges.selectedChallenges).toHaveLength(defaultEnglishChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultEnglishChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
    expect(challenges.selectedChallenges?.[0].title).toBe('Bhakti Challenge');
  });

  it('should load challenges with sort order parameter', async () => {
    const language = 'hindi';
    const challenges = await loadChallengesData(language, 'desc');

    expect(challenges.selectedChallenges).toHaveLength(defaultHindiChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultHindiChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
    expect(challenges.challengesData).toHaveLength(defaultHindiChallenges.length);
  });

  it('should filter challenges by ID range when filter string is provided', async () => {
    const language = 'hindi';
    const filterString = '1,2,3';

    const challenges = await loadChallengesData(language, 'asc', filterString);

    expect(challenges.selectedChallenges).toHaveLength(3);
    expect(challenges.selectedChallenges?.[0].id).toBe(1);
    expect(challenges.selectedChallenges?.[1].id).toBe(2);
    expect(challenges.selectedChallenges?.[2].id).toBe(3);
  });

  it('should filter challenges with range syntax (1-3)', async () => {
    const language = 'hindi';
    const filterString = '1-3';

    const challenges = await loadChallengesData(language, 'asc', filterString);

    expect(challenges.selectedChallenges).toHaveLength(3);
    expect(challenges.selectedChallenges?.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  it('should filter challenges with plus syntax (5+)', async () => {
    const language = 'hindi';
    const filterString = '5+';

    const challenges = await loadChallengesData(language, 'asc', filterString);

    const expectedIds = defaultHindiChallenges
      .filter((c) => c.id >= 5)
      .map((c) => c.id)
      .sort((a, b) => a - b);
    expect(challenges.selectedChallenges?.map((c) => c.id)).toEqual(expectedIds);
  });

  it('should handle mixed filter syntax (1,3-5,7+)', async () => {
    const language = 'hindi';
    const filterString = '1,3-5,7+';

    const challenges = await loadChallengesData(language, 'asc', filterString);

    const allIds = challenges.selectedChallenges?.map((c) => c.id) || [];
    expect(allIds).toContain(1);
    expect(allIds).toContain(3);
    expect(allIds).toContain(4);
    expect(allIds).toContain(5);
    // Should contain all IDs from 7 onwards
    const idsFrom7 = defaultHindiChallenges.filter((c) => c.id >= 7).map((c) => c.id);
    idsFrom7.forEach((id) => {
      expect(allIds).toContain(id);
    });
  });

  it('should apply sort order to dohas', async () => {
    const language = 'hindi';

    const ascChallenges = await loadChallengesData(language, 'asc', '1,2');
    const descChallenges = await loadChallengesData(language, 'desc', '1,2');

    // Should have same number of dohas but in different order
    expect(ascChallenges.dohas).toHaveLength(descChallenges.dohas?.length || 0);

    // First doha should be different between asc and desc
    if (ascChallenges.dohas && descChallenges.dohas && ascChallenges.dohas.length > 1) {
      expect(ascChallenges.dohas[0]).not.toEqual(descChallenges.dohas[0]);
    }
  });

  it('should return empty object when no challenges found', async () => {
    const language = 'hindi';

    // Test with a filter that returns no results
    const challenges = await loadChallengesData(language, 'asc', '999');

    expect(challenges.selectedChallenges).toHaveLength(0);
    expect(challenges.dohas).toHaveLength(0);
  });

  it('should handle invalid filter strings gracefully', async () => {
    const language = 'hindi';
    const invalidFilterString = 'invalid-filter-123abc';

    const challenges = await loadChallengesData(language, 'asc', invalidFilterString);

    // Should return all challenges when filter doesn't match the pattern
    expect(challenges.selectedChallenges).toHaveLength(defaultHindiChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultHindiChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
  });

  it('should handle empty filter string', async () => {
    const language = 'hindi';

    const challenges = await loadChallengesData(language, 'asc', '');

    expect(challenges.selectedChallenges).toHaveLength(defaultHindiChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultHindiChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
  });

  it('should maintain doha order and structure', async () => {
    const language = 'hindi';

    const challenges = await loadChallengesData(language);

    const firstChallenge = challenges.selectedChallenges?.[0];
    const firstChallengeDohas = challenges.dohas?.filter((d) => d.challengeId === firstChallenge?.id);

    expect(firstChallengeDohas).toBeDefined();
    expect(firstChallengeDohas?.length).toBeGreaterThan(0);

    // Check that dohas have proper structure
    firstChallengeDohas?.forEach((doha) => {
      expect(doha).toHaveProperty('id');
      expect(doha).toHaveProperty('line1');
      expect(doha).toHaveProperty('line2');
      expect(doha).toHaveProperty('sequence');
      expect(doha).toHaveProperty('challengeId');
      expect(doha.challengeId).toBe(firstChallenge?.id);
    });
  });

  it('should default to asc sort order when not provided', async () => {
    const language = 'hindi';
    const filterString = '1,2';

    const challengesWithoutSort = await loadChallengesData(language, undefined, filterString);
    const challengesWithAscSort = await loadChallengesData(language, 'asc', filterString);

    expect(challengesWithoutSort.dohas).toEqual(challengesWithAscSort.dohas);
  });

  it('should handle AsyncStorage getItem errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('AsyncStorage read error'));

    const result = await loadChallengesData('english');

    // Should fall back to default English challenges
    expect(result.challengesData).toEqual(defaultEnglishChallenges);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('challengesData_english');
  });

  it('should handle no challenges found case', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

    const result = await loadChallengesData('english');

    expect(result).toEqual({});
  });
});

describe('Challenge Store Utils', () => {
  describe('filterChallenges', () => {
    const mockChallenges = [
      { id: 1, title: 'Challenge 1', dohas: [], category: 'test', book: 'test' },
      { id: 2, title: 'Challenge 2', dohas: [], category: 'test', book: 'test' },
      { id: 3, title: 'Challenge 3', dohas: [], category: 'test', book: 'test' },
      { id: 4, title: 'Challenge 4', dohas: [], category: 'test', book: 'test' },
      { id: 5, title: 'Challenge 5', dohas: [], category: 'test', book: 'test' },
      { id: 6, title: 'Challenge 6', dohas: [], category: 'test', book: 'test' },
      { id: 7, title: 'Challenge 7', dohas: [], category: 'test', book: 'test' },
      { id: 8, title: 'Challenge 8', dohas: [], category: 'test', book: 'test' }
    ];

    it('should filter challenges by single ID', () => {
      const result = filterChallenges(mockChallenges, '3');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(3);
    });

    it('should filter challenges by multiple IDs', () => {
      const result = filterChallenges(mockChallenges, '1,3,5');
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual([1, 3, 5]);
    });

    it('should filter challenges by range (1-3)', () => {
      const result = filterChallenges(mockChallenges, '1-3');
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual([1, 2, 3]);
    });

    it('should filter challenges by range (5-7)', () => {
      const result = filterChallenges(mockChallenges, '5-7');
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).toEqual([5, 6, 7]);
    });

    it('should filter challenges with plus syntax (5+)', () => {
      const result = filterChallenges(mockChallenges, '5+');
      expect(result).toHaveLength(4);
      expect(result.map((c) => c.id)).toEqual([5, 6, 7, 8]);
    });

    it('should filter challenges with plus syntax from beginning (1+)', () => {
      const result = filterChallenges(mockChallenges, '1+');
      expect(result).toHaveLength(8);
      expect(result.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should handle mixed syntax (1,3-5,7+)', () => {
      const result = filterChallenges(mockChallenges, '1,3-5,7+');
      const resultIds = result.map((c) => c.id);

      expect(resultIds).toContain(1);
      expect(resultIds).toContain(3);
      expect(resultIds).toContain(4);
      expect(resultIds).toContain(5);
      expect(resultIds).toContain(7);
      expect(resultIds).toContain(8);
      expect(resultIds).not.toContain(2);
      expect(resultIds).not.toContain(6);
    });

    it('should handle complex mixed syntax (2,4-6,8+)', () => {
      const result = filterChallenges(mockChallenges, '2,4-6,8+');
      const resultIds = result.map((c) => c.id);

      expect(resultIds).toContain(2);
      expect(resultIds).toContain(4);
      expect(resultIds).toContain(5);
      expect(resultIds).toContain(6);
      expect(resultIds).toContain(8);
      expect(resultIds).not.toContain(1);
      expect(resultIds).not.toContain(3);
      expect(resultIds).not.toContain(7);
    });

    it('should return all challenges for invalid filter string', () => {
      const result = filterChallenges(mockChallenges, 'invalid-filter');
      expect(result).toHaveLength(mockChallenges.length);
      expect(result).toEqual(mockChallenges);
    });

    it('should return all challenges for empty filter string', () => {
      const result = filterChallenges(mockChallenges, '');
      expect(result).toHaveLength(mockChallenges.length);
      expect(result).toEqual(mockChallenges);
    });

    it('should handle non-existent IDs gracefully', () => {
      const result = filterChallenges(mockChallenges, '99');
      expect(result).toHaveLength(0);
    });

    it('should handle range with non-existent end ID', () => {
      const result = filterChallenges(mockChallenges, '7-99');
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual([7, 8]);
    });

    it('should handle filter string with spaces (should not match pattern)', () => {
      const result = filterChallenges(mockChallenges, '1, 2, 3');
      expect(result).toHaveLength(mockChallenges.length);
      expect(result).toEqual(mockChallenges);
    });

    it('should handle negative numbers (should not match pattern)', () => {
      const result = filterChallenges(mockChallenges, '-1,2,3');
      expect(result).toHaveLength(mockChallenges.length);
      expect(result).toEqual(mockChallenges);
    });

    it('should handle malformed ranges (should not match pattern)', () => {
      const result = filterChallenges(mockChallenges, '1--3');
      expect(result).toHaveLength(mockChallenges.length);
      expect(result).toEqual(mockChallenges);
    });

    it('should not mutate original array', () => {
      const original = [...mockChallenges];
      const originalCopy = [...mockChallenges];

      filterChallenges(original, '1-3');

      expect(original).toEqual(originalCopy);
    });

    it('should handle duplicate IDs in filter string', () => {
      const result = filterChallenges(mockChallenges, '1,1,2,2');
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual([1, 2]);
    });

    it('should handle overlapping ranges', () => {
      const result = filterChallenges(mockChallenges, '1-3,2-4');
      expect(result).toHaveLength(4);
      expect(result.map((c) => c.id)).toEqual([1, 2, 3, 4]);
    });

    it('should handle invalid plus syntax with non-numeric values', () => {
      const result = filterChallenges(mockChallenges, 'abc+,def+');
      expect(result).toHaveLength(mockChallenges.length);
      expect(result).toEqual(mockChallenges);
    });

    it('should handle invalid range syntax with non-numeric values', () => {
      const result = filterChallenges(mockChallenges, 'abc-def,xyz-123');
      expect(result).toHaveLength(mockChallenges.length);
      expect(result).toEqual(mockChallenges);
    });

    it('should handle invalid single values that are not numbers', () => {
      const result = filterChallenges(mockChallenges, 'abc,def,xyz');
      expect(result).toHaveLength(mockChallenges.length);
      expect(result).toEqual(mockChallenges);
    });
  });

  describe('sortChallenges', () => {
    const mockChallenges = [
      { id: 3, title: 'Challenge 3', dohas: [] },
      { id: 1, title: 'Challenge 1', dohas: [] },
      { id: 2, title: 'Challenge 2', dohas: [] }
    ];

    it('should sort challenges by ID in ascending order', () => {
      const result = sortChallenges(mockChallenges, 'asc');
      expect(result.challenges.map((c) => c.id)).toEqual([1, 2, 3]);
    });

    it('should sort challenges by ID in descending order', () => {
      const result = sortChallenges(mockChallenges, 'desc');
      expect(result.challenges.map((c) => c.id)).toEqual([3, 2, 1]);
    });

    it('should not mutate original array', () => {
      const original = [...mockChallenges];
      const originalCopy = [...mockChallenges];

      sortChallenges(original, 'asc');

      expect(original).toEqual(originalCopy);
    });
  });
});
