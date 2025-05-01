const fs = require("fs");
const rawText = require("../data/hindi-challenges-raw");

/**
 * Parse raw Hindi Bhakti text into an array of BhaktiChallenge objects
 * @param rawText - The raw Hindi text containing multiple challenges
 * @returns An array of BhaktiChallenge objects
 */
function parseBhaktiChallenges(rawText) {
  // Regular expression to match challenge titles and their content

  const titleRegex = /(.+?)\s*\|\s*Bhakti Challenge (\d+)(?:\s*\|\s*(.+))?/;
  const dohaLine1Regex = /(.+?)\s*।$/;
  const dohaLine2Regex = /(.+?)॥\s*(\d+)\s*.*$/;
  const radhaGovindGeetRegex = /गोविंद राधे$/;

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
        book: "राधा गोविंद गीत", // Updated book name
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
        const isRadhaGovindGeet = radhaGovindGeetRegex.test(
          dohaMatch1[1].trim()
        );
        dohaToAdd = {
          line1: dohaText,
        };
        lastChallenge.book = isRadhaGovindGeet
          ? "राधा गोविंद गीत"
          : "श्यामा श्याम गीत";
      } else if (dohaMatch2) {
        const dohaText = dohaMatch2[1].trim() + "॥";
        const sequence = lastChallenge.dohas.length + 1;
        const line = parseInt(dohaMatch2[2], 10);
        dohaToAdd = {
          line1: dohaToAdd.line1,
          line2: dohaText,
          challengeId: lastChallenge.id,
          sequence,
          line,
        };
        lastChallenge.dohas.push(dohaToAdd);
      } else {
        // Handle cases where the doha doesn't have a number at the end
        const dohaText = trimmedLine.trim();
        const dohaSequenceNumber = lastChallenge.dohas.length + 1;
        const dohaLineNumber = lastChallenge.dohas.length + 1;
        lastChallenge.dohas.push({
          dohaText,
          dohaSequenceNumber,
          dohaLineNumber,
          challengeId: lastChallenge.id,
        });
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
function parseBhaktiText(rawText) {
  // First try the regex-based parser
  let challenges = parseBhaktiChallenges(rawText);

  return challenges;
}

// Example usage

const challenges = parseBhaktiText(rawText);
fs.writeFileSync("data/hindi-challenges.json", JSON.stringify(challenges, null, 2));
