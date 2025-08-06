import { Challenge, Doha } from './challenges';

export const sortDohas = (dohas: Doha[], sortOrder: string) => {
  const sortedDohas = dohas.sort((a, b) => {
    if (sortOrder === 'asc') {
      if (a.challengeId !== b.challengeId) {
        return a.challengeId - b.challengeId;
      }
      return a.sequence - b.sequence;
    } else {
      if (a.challengeId !== b.challengeId) {
        return b.challengeId - a.challengeId;
      }
      return b.sequence - a.sequence;
    }
  });
  return [...sortedDohas];
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
