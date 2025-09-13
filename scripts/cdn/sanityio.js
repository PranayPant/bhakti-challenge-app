const { createClient } = require('@sanity/client');
const { parseArgs } = require('util');
const hindiChallenges = require('../../data/hindi-challenges.json');
const englishChallenges = require('../../data/english-challenges.json');

const client = createClient({
  projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.EXPO_PUBLIC_SANITY_DATASET,
  useCdn: true,
  apiVersion: process.env.EXPO_PUBLIC_SANITY_API_VERSION,
  token: process.env.EXPO_PUBLIC_SANITY_API_TOKEN
});

const options = {
  count: { type: 'string', short: 'c' },
  delete: { type: 'boolean', short: 'd' }
};

const args = parseArgs({ options });

const createOrReplaceDocuments = async (docs, type) => {
  try {
    const responses = await Promise.all(
      docs.map((doc) =>
        client.createOrReplace({
          _id: `${doc.id}_${type}`,
          _type: type,
          ...doc
        })
      )
    );
    responses.forEach((response) => {
      console.log('Document created or replaced:', response);
    });
  } catch (error) {
    console.error('Error creating or replacing document:', error);
  }
};

const main = async () => {
  if (args.values.count) {
    const type = args.values.count;
    await getDocumentsCount(type);
  } else if (args.values.delete) {
    console.log('Deleting Hindi challenges...');
    await deleteDocuments('hindi');
    console.log('Deleting English challenges...');
    await deleteDocuments('english');
  } else {
    console.log('Creating or replacing Hindi challenges...');
    await createOrReplaceDocuments(hindiChallenges, 'hindi');
    console.log('Creating or replacing English challenges...');
    await createOrReplaceDocuments(englishChallenges, 'english');
  }
};

const deleteDocuments = async (type) => {
  try {
    const query = `*[_type == "${type}"]`;
    const documents = await client.fetch(query);
    if (documents.length > 0) {
      const deletePromises = documents.map((doc) => client.delete(doc._id));
      await Promise.all(deletePromises);
      console.log(`Deleted ${documents.length} documents of type ${type}`);
    } else {
      console.log(`No documents found for type ${type}`);
    }
  } catch (error) {
    console.error('Error deleting documents:', error);
  }
};

const getDocumentsCount = async (type = 'hindi') => {
  try {
    const query = `count(*[_type == "${type}"])`;
    const count = await client.fetch(query);
    console.log(`Total documents of type ${type}: ${count}`);
  } catch (error) {
    console.error('Error fetching document count:', error);
  }
};

main();
