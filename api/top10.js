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

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
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
        const allResponses = await collection.find({}).toArray();

        // Starter IDs for quick mapping
        const starterIds = {
            bulbasaur:1, charmander:4, squirtle:7,
            chikorita:152, cyndaquil:155, totodile:158,
            treecko:252, torchic:255, mudkip:258,
            turtwig:387, chimchar:390, piplup:393,
            snivy:495, tepig:498, oshawott:501,
            chespin:650, fennekin:653, froakie:656,
            rowlet:722, litten:725, popplio:728,
            grookey:810, scorbunny:813, sobble:816,
            sprigatito:906, fuecoco:909, quaxly:912
        };

        const starterTypes = {
            bulbasaur:'grass', charmander:'fire', squirtle:'water',
            chikorita:'grass', cyndaquil:'fire', totodile:'water',
            treecko:'grass', torchic:'fire', mudkip:'water',
            turtwig:'grass', chimchar:'fire', piplup:'water',
            snivy:'grass', tepig:'fire', oshawott:'water',
            chespin:'grass', fennekin:'fire', froakie:'water',
            rowlet:'grass', litten:'fire', popplio:'water',
            grookey:'grass', scorbunny:'fire', sobble:'water',
            sprigatito:'grass', fuecoco:'fire', quaxly:'water'
        };

        // Count global votes
        const globalStarterVotes = {};
        allResponses.forEach(response => {
            [response.fireStarter, response.waterStarter, response.grassStarter].forEach(starter => {
                if (starter) {
                    const starterName = starter.toLowerCase();
                    globalStarterVotes[starterName] = (globalStarterVotes[starterName] || 0) + 1;
                }
            });
        });

        // Get top 10 starters
        const top10 = Object.entries(globalStarterVotes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, votes]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                id: starterIds[name] || 4,
                type: starterTypes[name] || 'fire',
                votes
            }));

        console.log('✓ Top 10 calculated:', top10.map(p => `${p.name}(${p.votes})`).join(', '));
        res.status(200).json(top10);
    } catch (error) {
        console.error('Error calculating top 10:', error.message);
        res.status(500).json({ error: 'Failed to calculate top 10: ' + error.message });
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
