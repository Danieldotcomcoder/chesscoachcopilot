require('dotenv').config();
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const embeddingsDeploymentName = "text-embedding-3-small";
const aoaiClient = new OpenAIClient(process.env.AOAI_ENDPOINT,
  new AzureKeyCredential(process.env.AOAI_KEY))

async function generateEmbeddings(text) {
  const embeddings = await aoaiClient.getEmbeddings(embeddingsDeploymentName, text);

  await new Promise(resolve => setTimeout(resolve, 500));
 
  return embeddings.data[0].embedding;
}


module.exports = { generateEmbeddings, aoaiClient };

