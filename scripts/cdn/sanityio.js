const { createClient } = require('@sanity/client');
const hindiChallenges = require('../../data/hindi-challenges.json');
const englishChallenges = require('../../data/english-challenges.json');

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2025-07-28', // use current date (YYYY-MM-DD) to target the latest API version. Note: this should always be hard coded. Setting API version based on a dynamic value (e.g. new Date()) may break your application at a random point in the future.
  token: process.env.SANITY_API_TOKEN // Needed for certain operations like updating content, accessing drafts or using draft perspectives
});

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
  const args = process.argv.slice(2);
  if (args.includes('delete')) {
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

main();
