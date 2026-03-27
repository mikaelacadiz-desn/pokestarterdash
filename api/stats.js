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

        // Calculate statistics
        const stats = {
            totalResponses: allResponses.length,
            starterStats: {
                fire: {},
                water: {},
                grass: {}
            },
            typeStats: {},
            generationStats: {},
            countryStats: {},
            ageRangeStats: {},
            choiceMethodStats: {},
            firstGameStats: {}
        };

        allResponses.forEach(response => {
            // Count starters
            if (response.fireStarter) {
                stats.starterStats.fire[response.fireStarter] =
                    (stats.starterStats.fire[response.fireStarter] || 0) + 1;
            }
            if (response.waterStarter) {
                stats.starterStats.water[response.waterStarter] =
                    (stats.starterStats.water[response.waterStarter] || 0) + 1;
            }
            if (response.grassStarter) {
                stats.starterStats.grass[response.grassStarter] =
                    (stats.starterStats.grass[response.grassStarter] || 0) + 1;
            }

            // Count favorite types
            if (response.favouriteTypes) {
                const types = response.favouriteTypes.split(',').map(t => t.trim());
                types.forEach(type => {
                    if (type) {
                        stats.typeStats[type] =
                            (stats.typeStats[type] || 0) + 1;
                    }
                });
            }

            // Count generations
            if (response.favouriteGeneration) {
                stats.generationStats[response.favouriteGeneration] =
                    (stats.generationStats[response.favouriteGeneration] || 0) + 1;
            }

            // Count countries
            if (response.country) {
                stats.countryStats[response.country] =
                    (stats.countryStats[response.country] || 0) + 1;
            }

            // Count age ranges
            if (response.ageRange) {
                stats.ageRangeStats[response.ageRange] =
                    (stats.ageRangeStats[response.ageRange] || 0) + 1;
            }

            // Count choice methods
            if (response.choiceMethod) {
                stats.choiceMethodStats[response.choiceMethod] =
                    (stats.choiceMethodStats[response.choiceMethod] || 0) + 1;
            }

            // Count first games
            if (response.firstGame) {
                stats.firstGameStats[response.firstGame] =
                    (stats.firstGameStats[response.firstGame] || 0) + 1;
            }
        });

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error.message);
        res.status(500).json({ error: 'Failed to calculate statistics: ' + error.message });
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
