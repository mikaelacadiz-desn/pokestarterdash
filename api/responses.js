const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb+srv://cadizm_db_user:1234@cluster0.xhikdct.mongodb.net/";

module.exports = async function handler(req, res) {
    // Prevent caching
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    let client;
    try {
        client = new MongoClient(uri, { 
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        });
        await client.connect();
        const db = client.db('responses');
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
        console.error('API error:', error.message);
        res.status(500).json({ error: 'Failed to process request: ' + error.message });
    } finally {
        if (client) {
            try {
                await client.close();
            } catch (err) {
                console.error('Error closing client:', err);
            }
        }
    }
}
