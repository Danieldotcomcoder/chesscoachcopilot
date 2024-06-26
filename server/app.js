require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectMongoDbSession = require('connect-mongodb-session');
const MongoDbStore = connectMongoDbSession(session);
const cors = require('cors')
const swagger = require('./swagger');
const { connectDB, client } = require('./azuredbconnect');
const { ragWithVectorsearch, getChessMoves } = require('./ragVictorSearch');
const util = require('util');

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'https://chesscopilot.azurewebsites.net',
  // origin: 'http://localhost:5173',
  credentials: true,
}));

const connectToDB = async () => {
  await connectDB();
  console.log('Connected to MongoDB');
};

connectToDB().catch(err => console.error(err));
const db = client.db('main');
console.log('Connected to DB');
const store = new MongoDbStore({
  uri: `mongodb+srv://${process.env.azurecosmosdb_username}:${process.env.azurecosmosdb_password}@main.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`,
  collection: 'sessions'
});
store.getAsync = util.promisify(store.get).bind(store);
store.setAsync = util.promisify(store.set).bind(store);


store.on('connected', () => {
  console.log('Connected to MongoDB session store');
});

store.on('error', (error) => {
  console.error('Session store error:', error);
});

app.use(session({
  secret: '!@#$%^&*()',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'Lax',
    domain: 'chesscopilot.azurewebsites.net'
  }
}));

app.post('/start-conversation', async (req, res) => {
  const sessionId = req.body.sessionId;

  if (!sessionId) {
    return res.status(400).send({ status: 'error', message: 'Session ID is required' });
  }

  try {
    const session = {
      conversation: [{ role: 'system', message: 'Welcome to our service!' }],
      chessmoves: `{
  "name": "Queen's Gambit Declined",
  "moves": "d4 d5 c4 e6"
},
  {
  "name": "Queen's Gambit Opening",
  "moves": "d4 d5 c4"
}`
    };

    await store.setAsync(sessionId, session);
    console.log('New session started with ID:', sessionId);

    res.send({
      status: 'success',
      message: 'New conversation started.',
      conversation: session.conversation,
      chessmoves: session.chessmoves,
      sessionId: sessionId,
    });
  } catch (err) {
    console.error('Error starting new conversation:', err);
    res.status(500).send({ status: 'error', message: 'Failed to start new conversation' });
  }
});


app.post('/chat', async (req, res) => {
  const textParam = req.body.textParam;
  const sessionId = req.body.sessionId;

  try {
    const session = await store.getAsync(sessionId);
    if (!session) {
      return res.status(400).send({ status: 'error', message: 'Invalid session ID' });
    }

    if (!session.conversation) {
      session.conversation = [{ role: 'system', message: 'Welcome to our service!' }];
    }

    session.conversation.push({ role: 'user', message: textParam });
    console.log('Received request with session ID:', sessionId);

    
    const numResults = 1;
    const collectionName = 'embeddings';

    const result = await ragWithVectorsearch(db, collectionName, textParam, numResults);
    console.log('Result is Ready');

    let chessmoves = await getChessMoves(result);
    console.log('Chess Moves are ready');
    session.chessmoves = chessmoves;
    session.conversation.push({ role: 'system', message: result });
    console.log('Updated conversation:')

    await store.setAsync(sessionId, session);
    console.log('Conversation saved:');

    res.send({ status: 'success', message: 'Message received.', conversation: session.conversation, chessmoves: session.chessmoves });
  } catch (err) {
    console.error('Error processing chat request:', err);
    res.status(500).send({ status: 'error', message: 'Failed to process chat request' });
  }
});





app.get('/conversation', async (req, res) => {
  const sessionId = req.query.sessionId;
  console.log('Received request for conversation with session ID:', sessionId);

  try {
    const session = await store.getAsync(sessionId);
    if (session) {
      res.send({ status: 'success', conversation: session.conversation, chessmoves: session.chessmoves });
    } else {
      const newSession = {
        conversation: [{ role: 'system', message: 'Welcome to our service!' }],
      };
      await store.setAsync(sessionId, newSession);
      console.log('New conversation created with session ID:', sessionId);
      res.send({ status: 'success', conversation: newSession.conversation });
    }
  } catch (err) {
    console.error('Error retrieving or creating conversation:', err);
    res.status(500).send({ status: 'error', message: 'Failed to retrieve or create conversation' });
  }
});


swagger(app);

app.get('/', (req, res) => {
  res.send({ "status": "ready" });
});

app.listen(80, () => {
  console.log(`Server started on port 80`);
});
