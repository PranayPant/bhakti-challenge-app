const fs = require('fs');
const transliterate = require('./transliterate');
const raw2Json = require('./raw2json');

function processRawText() {
  try {
    if (fs.existsSync('data/hindi-challenges-raw.txt')) {
      const rawHindiText = fs.readFileSync('data/hindi-challenges-raw.txt', 'utf8');
      const rawEnglishText = transliterate(rawHindiText);

      fs.writeFileSync('data/english-challenges-raw.txt', rawEnglishText, {
        flag: 'w+'
      });

      return {
        rawHindiText,
        rawEnglishText
      };
    }
  } catch (error) {
    console.error('An error occurred while processing the raw text:', error);
    throw error;
  }
}

function main() {
  const { rawEnglishText, rawHindiText } = processRawText();
  let jsonEnglishChallenges = [];
  let jsonHindiChallenges = [];
  if (rawEnglishText) {
    jsonEnglishChallenges = raw2Json(rawEnglishText, 'english');
  }
  if (rawHindiText) {
    jsonHindiChallenges = raw2Json(rawHindiText, 'hindi');
  }

  fs.writeFileSync('data/english-challenges.json', JSON.stringify(jsonEnglishChallenges, null, 2), { flag: 'w+' });
  fs.writeFileSync('data/hindi-challenges.json', JSON.stringify(jsonHindiChallenges, null, 2), { flag: 'w+' });
}

main();
