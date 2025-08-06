import { createChallengeStore, loadChallengesData } from './challenges';
import { sortDohas, filterChallenges } from './utils';
import defaultHindiChallenges from '@/data/hindi-challenges.json';
import defaultEnglishChallenges from '@/data/english-challenges.json';

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
});

describe('Challenge LoadChallengesData Function', () => {
  it('should load challenges from local storage or default data', async () => {
    const language = 'hindi';
    const challenges = await loadChallengesData(language, [], [], '');
    expect(challenges.selectedChallenges).toHaveLength(defaultHindiChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultHindiChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
  });

  it('should load English challenges correctly', async () => {
    const language = 'english';
    const challenges = await loadChallengesData(language, [], [], '');
    expect(challenges.selectedChallenges).toHaveLength(defaultEnglishChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultEnglishChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
    expect(challenges.selectedChallenges?.[0].title).toBe('Bhakti Challenge');
  });

  it('should preserve existing selected challenges when provided', async () => {
    const language = 'hindi';
    const existingSelectedChallenges = defaultHindiChallenges.slice(10, 32);
    const existingDohas = existingSelectedChallenges.flatMap((c) => c.dohas);
    const filterString = '12,21';

    const challenges = await loadChallengesData(language, existingSelectedChallenges, existingDohas, filterString);

    expect(challenges.selectedChallenges).toHaveLength(2);
    expect(challenges.dohas).toHaveLength(existingDohas.length);
    expect(challenges.challengesData).toHaveLength(defaultHindiChallenges.length);
    expect(challenges.selectedChallenges?.[0].id).toBe(12);
    expect(challenges.selectedChallenges?.[1].id).toBe(21);
  });

  it('should filter challenges by ID range when filter string is provided', async () => {
    const language = 'hindi';
    const filterString = '1,2,3';

    const challenges = await loadChallengesData(language, [], [], filterString);

    expect(challenges.selectedChallenges).toHaveLength(3);
    expect(challenges.selectedChallenges?.[0].id).toBe(1);
    expect(challenges.selectedChallenges?.[1].id).toBe(2);
    expect(challenges.selectedChallenges?.[2].id).toBe(3);
  });

  it('should filter challenges with range syntax (1-3)', async () => {
    const language = 'hindi';
    const filterString = '1-3';

    const challenges = await loadChallengesData(language, [], [], filterString);

    expect(challenges.selectedChallenges).toHaveLength(3);
    expect(challenges.selectedChallenges?.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  it('should filter challenges with plus syntax (5+)', async () => {
    const language = 'hindi';
    const filterString = '5+';

    const challenges = await loadChallengesData(language, [], [], filterString);

    const expectedIds = defaultHindiChallenges.filter((c) => c.id >= 5).map((c) => c.id);
    expect(challenges.selectedChallenges?.map((c) => c.id)).toEqual(expectedIds);
  });

  it('should handle mixed filter syntax (1,3-5,7+)', async () => {
    const language = 'hindi';
    const filterString = '1,3-5,7+';

    const challenges = await loadChallengesData(language, [], [], filterString);

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

  it('should update existing selected challenges with new data', async () => {
    const language = 'hindi';
    const existingSelectedChallenges = [{ ...defaultHindiChallenges[0], title: 'Old Title' }];
    const existingDohas = existingSelectedChallenges.flatMap((c) => c.dohas);

    const challenges = await loadChallengesData(language, existingSelectedChallenges, existingDohas, '');

    // Should update with new data from challengesData
    expect(challenges.selectedChallenges?.[0].title).toBe(defaultHindiChallenges[0].title);
    expect(challenges.selectedChallenges?.[0].title).not.toBe('Old Title');
  });

  it('should update existing dohas with new data', async () => {
    const language = 'hindi';
    const existingSelectedChallenges = defaultHindiChallenges.slice(0, 1);
    const existingDohas = [{ ...defaultHindiChallenges[0].dohas[0], line1: 'Old Line 1' }];

    const challenges = await loadChallengesData(language, existingSelectedChallenges, existingDohas, '');

    // Should update with new data from challengesData
    expect(challenges.dohas?.[0].line1).toBe(defaultHindiChallenges[0].dohas[0].line1);
    expect(challenges.dohas?.[0].line1).not.toBe('Old Line 1');
  });

  it('should return empty object when no challenges found', async () => {
    const language = 'hindi';
    // Mock empty challengesData scenario
    const originalConsoleLog = console.log;
    console.log = jest.fn();

    // This test would need to mock the data loading to return empty array
    // For now, we'll test with a filter that returns no results
    const challenges = await loadChallengesData(language, [], [], '999');

    expect(challenges.selectedChallenges).toHaveLength(0);
    expect(challenges.dohas).toHaveLength(0);

    console.log = originalConsoleLog;
  });

  it('should handle invalid filter strings gracefully', async () => {
    const language = 'hindi';
    const invalidFilterString = 'invalid-filter-123abc';

    const challenges = await loadChallengesData(language, [], [], invalidFilterString);

    // Should return all challenges when filter doesn't match the pattern
    expect(challenges.selectedChallenges).toHaveLength(defaultHindiChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultHindiChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
  });

  it('should handle empty filter string', async () => {
    const language = 'hindi';

    const challenges = await loadChallengesData(language, [], [], '');

    expect(challenges.selectedChallenges).toHaveLength(defaultHindiChallenges.length);
    expect(challenges.dohas).toHaveLength(defaultHindiChallenges.reduce((acc, c) => acc + c.dohas.length, 0));
  });

  it('should maintain doha order and structure', async () => {
    const language = 'hindi';

    const challenges = await loadChallengesData(language, [], [], '');

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
});

describe('Challenge Store Utils', () => {
  describe('sortDohas', () => {
    const mockDohas = [
      { id: 1, line1: 'Line 1', line2: 'Line 2', sequence: 2, challengeId: 1 },
      { id: 2, line1: 'Line 3', line2: 'Line 4', sequence: 1, challengeId: 1 },
      { id: 3, line1: 'Line 5', line2: 'Line 6', sequence: 1, challengeId: 2 },
      { id: 4, line1: 'Line 7', line2: 'Line 8', sequence: 2, challengeId: 2 },
      { id: 5, line1: 'Line 9', line2: 'Line 10', sequence: 1, challengeId: 3 }
    ];

    it('should sort dohas in ascending order by challengeId then sequence', () => {
      const result = sortDohas([...mockDohas], 'asc');

      expect(result[0]).toEqual(mockDohas[1]); // challengeId: 1, sequence: 1
      expect(result[1]).toEqual(mockDohas[0]); // challengeId: 1, sequence: 2
      expect(result[2]).toEqual(mockDohas[2]); // challengeId: 2, sequence: 1
      expect(result[3]).toEqual(mockDohas[3]); // challengeId: 2, sequence: 2
      expect(result[4]).toEqual(mockDohas[4]); // challengeId: 3, sequence: 1
    });

    it('should sort dohas in descending order by challengeId then sequence', () => {
      const result = sortDohas([...mockDohas], 'desc');

      expect(result[0]).toEqual(mockDohas[4]); // challengeId: 3, sequence: 1
      expect(result[1]).toEqual(mockDohas[3]); // challengeId: 2, sequence: 2
      expect(result[2]).toEqual(mockDohas[2]); // challengeId: 2, sequence: 1
      expect(result[3]).toEqual(mockDohas[0]); // challengeId: 1, sequence: 2
      expect(result[4]).toEqual(mockDohas[1]); // challengeId: 1, sequence: 1
    });

    it('should handle empty array', () => {
      const result = sortDohas([], 'asc');
      expect(result).toEqual([]);
    });

    it('should handle single doha', () => {
      const singleDoha = [mockDohas[0]];
      const result = sortDohas([...singleDoha], 'asc');
      expect(result).toEqual(singleDoha);
    });

    it('should mutate original array (current behavior)', () => {
      const original = [...mockDohas];
      const originalCopy = [...mockDohas];

      const result = sortDohas(original, 'desc');

      // Current implementation mutates the original array
      expect(original).not.toEqual(originalCopy);
      expect(original).toEqual(result);
    });
  });

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
  });
});
