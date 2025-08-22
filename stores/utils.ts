import { Challenge } from './challenges';

export const sortChallenges = (challenges: Challenge[], sortOrder: string) => {
  // Sort challenges by ID
  const sortedChallenges = [...challenges].sort((a, b) => {
    return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
  });

  // Generate dohas from sorted challenges, keeping each challenge's dohas in sequence order
  const dohas = sortedChallenges.flatMap((challenge) => [...challenge.dohas].sort((a, b) => a.sequence - b.sequence));

  return {
    challenges: sortedChallenges,
    dohas
  };
};

export const sortChallenges = (challenges: Challenge[], sortOrder: string) => {
  const sortedChallenges = [...challenges].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.id - b.id;
    } else {
      return b.id - a.id;
    }
  });
  return sortedChallenges;
};

export const sortChallengesAndFlattenDohas = (challenges: Challenge[], sortOrder: string) => {
  const sortedChallenges = sortChallenges(challenges, sortOrder);
  return sortedChallenges.flatMap((challenge) => [...challenge.dohas].sort((a, b) => a.sequence - b.sequence));
};

export const filterChallenges = (challengeData: Challenge[], filterString: string) => {
  let filteredChallenges: Challenge[] = [...challengeData];
  if (filterString.match(/^\d+(-\d+)?(\+)?(,\d+(-\d+)?(\+)?)*$/)) {
    // Parse ranges, single ids, and "start+" syntax
    const ids = new Set<number>();
    filterString.split(',').forEach((part) => {
      if (part.endsWith('+')) {
        const start = Number(part.slice(0, -1));
        if (!isNaN(start)) {
          for (let i = start; i <= Math.max(...challengeData.map((c) => c.id)); i++) {
            ids.add(i);
          }
        }
      } else if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            ids.add(i);
          }
        }
      } else {
        const id = Number(part);
        if (!isNaN(id)) {
          ids.add(id);
        }
      }
    });
    filteredChallenges = challengeData.filter((challenge) => ids.has(challenge.id));
  }

  return filteredChallenges;
};
