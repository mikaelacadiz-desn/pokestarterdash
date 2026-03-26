const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://cadizm_db_user:1234@cluster0.xhikdct.mongodb.net/";
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('responses');
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
}

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('pokeresponses');

        if (req.method === 'GET') {
            const responses = await collection.find({}).toArray();
            res.status(200).json(responses);
        } else if (req.method === 'POST') {
            const response = req.body;
            const result = await collection.insertOne(response);
            res.status(201).json({
                message: 'Response submitted successfully!',
                id: result.insertedId
            });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}
