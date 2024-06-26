const { generateEmbeddings } = require('./generateEmbeddings');
const {connectDB , client} = require('./azuredbconnect');

async function vectorSearch(db, collectionName, query, numResults = 3) {
    const collection = db.collection(collectionName);
    const queryEmbedding = await generateEmbeddings(query);
    const pipeline = [
        {
            $search: {
                index: "VectorSearchIndex",
                knnBeta: {
                    vector: queryEmbedding,
                    path: "embedding",
                    k: numResults,
                }
            },
        },
    ];
    const results = await collection.aggregate(pipeline).toArray();
    return results;
}


// const main = async () => {
//     await connectDB();
//     console.log('Connected to MongoDB');

//     const db = client.db('main');
//     const collection = db.collection('embeddings');
//     console.log('Connected to main database and embeddings collection');

//     const question = 'Queens Gambit Accepted'

//     const numResults = 3;

//     const collectionName = 'embeddings';

//     console.log(await vectorSearch(db, collectionName, question, numResults));
// }

module.exports = { vectorSearch };

// main().catch(console.error);
