require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB, client } = require('./azuredbconnect');
const extractTextFromPDF = require('./extractText');
const { generateEmbeddings, aoaiClient } = require('./generateEmbeddings');

const processPdfs = async (folderPath) => {
  await connectDB();
  console.log('Connected to MongoDB');

  const db = client.db('main');
  const collection = db.collection('embeddings');
  const processedFilesCollection = db.collection('processedFiles');
  console.log('Connected to chess database and collections');

  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);

    
    const fileProcessed = await processedFilesCollection.findOne({ fileName: file });
    if (fileProcessed) {
      console.log(`Skipping already processed file: ${file}`);
      continue;
    }

    console.log(`Processing ${file}`);
    const paragraphs = await extractTextFromPDF(filePath);
    console.log(`Extracted ${paragraphs.length} paragraphs from ${file}`);

    const embeddingsBatch = [];

    for (const [index, paragraph] of paragraphs.entries()) {
      if (paragraph.trim()) {
        const embedding = await generateEmbeddings(paragraph);
        console.log(`Generated embedding for paragraph ${index} of ${file}`);

        const newEmbedding = {
          title: file,
          section: index,
          content: paragraph,
          embedding: embedding
        };

        embeddingsBatch.push(newEmbedding);
      }
    }

    if (embeddingsBatch.length > 0) {
      await collection.insertMany(embeddingsBatch);
      console.log(`Processed and saved ${embeddingsBatch.length} sections of ${file}`);
    }

    // Mark the file as processed
    await processedFilesCollection.insertOne({ fileName: file, processedAt: new Date() });
  }
  
  console.log(`Checking if vector index exists in the embeddings collection`)
  const vectorIndexExists = await collection.indexExists('VectorSearchIndex');
  if (!vectorIndexExists) {
      await db.command({
          "createIndexes": 'embeddings',
          "indexes": [
          {
              "name": "VectorSearchIndex",
              "key": {
              "embedding": "cosmosSearch"
              },
              "cosmosSearchOptions": {                  
              "kind": "vector-ivf",
              "numLists": 1,
              "similarity": "COS",
              "dimensions": 1536
              }
          }
          ]
      });
      console.log(`Created index on embedding field on embeddings collection`);
  }
  else {
      console.log(`index already exists on embedding field in the embeddings collection`);
  }
  client.close();
};

const folderPath = '../pdfs';
processPdfs(folderPath).then(() => {
  console.log('All PDFs processed');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
