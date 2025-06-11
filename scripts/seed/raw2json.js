/**
 * Parse raw Hindi Bhakti text into an array of BhaktiChallenge objects
 * @param rawText - The raw text containing multiple challenges
 * @param language - The language of the text (default: "hindi")
 * @returns An array of BhaktiChallenge objects
 */
function parseBhaktiChallenges(rawText, language) {
  // Regular expression to match challenge titles and their content

  const titleRegex = /(.*?)\s*\|\s*[a-zA-Z\s]+(\d+)(?:\s*\|\s*(.+))?/;
  const dohaLine1Regex = /(.+)\s*।$/;
  const dohaLine2Regex = /(.+)॥\s*(\d+)\s*.*$/;

  const challenges = [];
  const lines = rawText.split("\n");
  let match;
  let dohaToAdd = null;

  // Extract challenges using regex
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // Skip empty lines
    // Check if the line matches the challenge title format
    match = trimmedLine.match(titleRegex);

    if (match) {
      const title = match[1].trim();
      const id = parseInt(match[2], 10);
      const category = match[3] ? match[3].trim() : undefined;

      // Create a new challenge object
      const challenge = {
        id,
        title,
        dohas: [],
        category,
      };

      challenges.push(challenge);
    }
    // Check if the line matches the doha line format
    else if (challenges.length > 0) {
      const lastChallenge = challenges[challenges.length - 1];
      const dohaMatch1 = trimmedLine.match(dohaLine1Regex);
      const dohaMatch2 = trimmedLine.match(dohaLine2Regex);
      if (dohaMatch1) {
        const dohaText = dohaMatch1[1].trim() + "।";
        dohaToAdd = {
          line1: dohaText,
        };

      } else if (dohaMatch2) {
        const dohaText = dohaMatch2[1].trim() + "॥";
        const sequence = lastChallenge.dohas.length + 1;
        const line = parseInt(dohaMatch2[2], 10);
        dohaToAdd = {
          id: parseInt(`${lastChallenge.id.toString().padStart(3, '0')}${sequence.toString().padStart(2, '0')}`),
          line1: dohaToAdd.line1,
          line2: dohaText,
          challengeId: lastChallenge.id,
          sequence,
          line,
        };
        lastChallenge.dohas.push(dohaToAdd);
      } else {
        throw new Error(`Unrecognized line format: ${trimmedLine}`);
      }
    }
  }

  // Sort challenges by ID
  challenges.sort((a, b) => a.id - b.id);

  return challenges;
}

/**
 * Main function to handle both possible formats
 */
function raw2Json(rawText, language = "hindi") {
  // First try the regex-based parser
  let challenges = parseBhaktiChallenges(rawText, language);

  return challenges;
}

module.exports = raw2Json;
