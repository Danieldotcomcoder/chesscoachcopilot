const { connectDB, client } = require('./azuredbconnect');
const { vectorSearch } = require('./vectorsearch');
const { aoaiClient } = require('./generateEmbeddings');

async function ragWithVectorsearch(db, collectionName, question, numResults = 3) {
  const systemPrompt = `
        You are ChessPilot, a helpful, fun, and friendly AI Chess Coach.
        Only answer questions related to chess. If the list of chess information is empty, answer based on your knowledge.
        Respond with "I am a Chess Coach and I can only answer questions related to chess" for non-chess-related queries unless it is a greeting of introduction.
        
        List of Chess Information:
    `;

  results = await vectorSearch(db, collectionName, question, numResults);
  productList = "";

  for (const result of results) {
    // delete result['document']['contentVector'];
    productList += JSON.stringify(result.content + "\n\n");

  }

  if (productList.length > 750) {
    productList = productList.substring(0, 750);
  }

  const formattedPrompt = systemPrompt + productList;
  

  const messages = [
    {
      "role": "system",
      "content": formattedPrompt
    },
    {
      "role": "user",
      "content": question
    }
  ];



  
  const completion = await aoaiClient.getChatCompletions("gpt-4", messages);

  return completion.choices[0].message.content;
}


async function getChessMoves(chessinformation) {
 
  const systemMessage = {
    role: "system",
    content: `You are a part of an ai chess coach system.
      Your job is only to reply chess positions and moves. 

      
      The moves always starts from the starting position of the board, DO NOT use numbers.
      DO NOT put moves that doesnt start from the starting position of the board.

      Make sure the castling moves are capital O's and not zeros.

      Good moves example: e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3 Bd6 O-O O-O c4 Bg4 cxd5 f5 Re1 Bxh2+ Kxh2 Nxf2 Qe2 Nxd3 Qxd3 Bxf3 Qxf3 Qh4+
      Use the exact format below

      {
        "name": "Monticelli Trap - Opening",
        "moves": "d4 Nf6 c4 e6 Nf3 Bb4+ Bd2 Bxd2+ Qxd2 b6"
      },
      {
        "name": "Queen's Gambit Declined",
        "moves": "d4 d5 c4 e6"
      }

      The chess position could be any position in a chess game, and the moves are the moves that lead to that position from the starting position.
      If the list of chess information doesnt contain any chess positions, return the example provided above.
      `
  };

  const userMessage = {
    role: "user",
    content: chessinformation
  };

  const messages = [systemMessage, userMessage];

  
  const completion = await aoaiClient.getChatCompletions("gpt-4", messages);
  
  return completion.choices[0].message.content;
}

// const main = async () => {
//   await connectDB();


//   const db = client.db('main');


//   const question = 'tell me about the queens gambit'

//   const numResults = 1;

//   const collectionName = 'embeddings';

//   let result = await ragWithVectorsearch(db, collectionName, question, numResults)

//   console.log('result', result);

//   let chessmoves = await getChessMoves(result)

//   console.log('chessmoves', chessmoves);

// }


// main().catch(console.error);

module.exports = { ragWithVectorsearch, getChessMoves };