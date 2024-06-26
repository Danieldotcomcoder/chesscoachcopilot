require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.azurecosmosdb_username}:${process.env.azurecosmosdb_password}@main.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`;

const client = new MongoClient(uri);

const connectDB = async () => {
  try {
    await client.connect();
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = { connectDB, client };