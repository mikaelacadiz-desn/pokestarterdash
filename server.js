const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// MongoDB connection string
const uri = "mongodb+srv://cadizm_db_user:1234@cluster0.xhikdct.mongodb.net/";
const client = new MongoClient(uri);

let db;
let collection;

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas!');
        db = client.db('responses');
        collection = db.collection('pokeresponses');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

connectDB();

// API Routes

// Get all responses
app.get('/api/responses', async (req, res) => {
    try {
        const responses = await collection.find({}).toArray();
        res.json(responses);
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ error: 'Failed to fetch responses' });
    }
});

// Submit a new response
app.post('/api/responses', async (req, res) => {
    try {
        const response = req.body;
        const result = await collection.insertOne(response);
        res.status(201).json({
            message: 'Response submitted successfully!',
            id: result.insertedId
        });
    } catch (error) {
        console.error('Error submitting response:', error);
        res.status(500).json({ error: 'Failed to submit response' });
    }
});

// Get response statistics (for dashboard)
app.get('/api/stats', async (req, res) => {
    try {
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
                // Split by comma and trim whitespace, then count each type
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

        res.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
});

// Get map data (country starter popularity for map visualization)
app.get('/api/map-data', async (req, res) => {
    try {
        const allResponses = await collection.find({}).toArray();
        console.log(`✓ Found ${allResponses.length} responses in MongoDB`);

        // Starter IDs mapping - all 27 starters across 9 generations
        const starterIds = {
            // Gen 1
            bulbasaur:1, charmander:4, squirtle:7,
            // Gen 2
            chikorita:152, cyndaquil:155, totodile:158,
            // Gen 3
            treecko:252, torchic:255, mudkip:258,
            // Gen 4
            turtwig:387, chimchar:390, piplup:393,
            // Gen 5
            snivy:495, tepig:498, oshawott:501,
            // Gen 6
            chespin:650, fennekin:653, froakie:656,
            // Gen 7
            rowlet:722, litten:725, popplio:728,
            // Gen 8
            grookey:810, scorbunny:813, sobble:816,
            // Gen 9
            sprigatito:906, fuecoco:909, quaxly:912
        };

        const starterTypes = {
            // Gen 1
            bulbasaur:'grass', charmander:'fire', squirtle:'water',
            // Gen 2
            chikorita:'grass', cyndaquil:'fire', totodile:'water',
            // Gen 3
            treecko:'grass', torchic:'fire', mudkip:'water',
            // Gen 4
            turtwig:'grass', chimchar:'fire', piplup:'water',
            // Gen 5
            snivy:'grass', tepig:'fire', oshawott:'water',
            // Gen 6
            chespin:'grass', fennekin:'fire', froakie:'water',
            // Gen 7
            rowlet:'grass', litten:'fire', popplio:'water',
            // Gen 8
            grookey:'grass', scorbunny:'fire', sobble:'water',
            // Gen 9
            sprigatito:'grass', fuecoco:'fire', quaxly:'water'
        };

        // Country ISO codes mapping
        const countryIsoCodes = {
            'Canada': 124, 'United States': 840, 'Mexico': 484, 'Brazil': 76, 'Argentina': 32,
            'Colombia': 170, 'Peru': 604, 'Chile': 152, 'Ecuador': 218, 'Venezuela': 862,
            'Bolivia': 68, 'Paraguay': 600, 'Uruguay': 858, 'Guatemala': 320, 'Honduras': 340,
            'United Kingdom': 826, 'France': 250, 'Germany': 276, 'Spain': 724, 'Italy': 380,
            'Poland': 616, 'Netherlands': 528, 'Belgium': 56, 'Sweden': 752, 'Norway': 578,
            'Denmark': 208, 'Finland': 246, 'Austria': 40, 'Switzerland': 756, 'Portugal': 620,
            'Greece': 300, 'Czech Republic': 203, 'Ukraine': 804, 'Russia': 643, 'Bulgaria': 100,
            'Romania': 642, 'Hungary': 348, 'Slovakia': 703, 'Slovenia': 705, 'Croatia': 191,
            'Serbia': 688, 'Bosnia': 57, 'North Macedonia': 807, 'Albania': 8, 'Montenegro': 499,
            'Kosovo': 688, 'Estonia': 233, 'Latvia': 428, 'Lithuania': 440, 'Belarus': 112,
            'Moldova': 498, 'Ireland': 372, 'Japan': 392, 'China': 156, 'South Korea': 410,
            'India': 356, 'Bangladesh': 50, 'Pakistan': 586, 'Thailand': 764, 'Vietnam': 704,
            'Indonesia': 360, 'Malaysia': 458, 'Philippines': 608, 'Singapore': 702, 'Myanmar': 104,
            'Cambodia': 116, 'Laos': 418, 'Sri Lanka': 144, 'Nepal': 524, 'Bhutan': 64,
            'Mongolia': 496, 'Kazakhstan': 398, 'Uzbekistan': 860, 'Turkey': 792, 'Iraq': 368,
            'Iran': 364, 'Saudi Arabia': 682, 'UAE': 784, 'Jordan': 400, 'Lebanon': 422,
            'Syria': 760, 'Israel': 376, 'Egypt': 818, 'South Africa': 710, 'Nigeria': 566,
            'Kenya': 404, 'Morocco': 504, 'Algeria': 12, 'Tunisia': 788, 'Libya': 434,
            'Sudan': 729, 'Ethiopia': 231, 'Uganda': 800, 'Tanzania': 834, 'Mozambique': 508,
            'Zimbabwe': 716, 'Malawi': 454, 'Zambia': 894, 'DR Congo': 180, 'Angola': 24,
            'Senegal': 686, 'Ghana': 288, 'Ivory Coast': 384, 'Burkina Faso': 854, 'Mali': 466,
            'Niger': 562, 'Australia': 36, 'New Zealand': 554, 'Papua New Guinea': 598
        };

        // Count starters by country
        const countryStarters = {}; // { countryName: { starterName: count, ... }, ... }
        const globalStarterVotes = {}; // Total votes per starter worldwide

        allResponses.forEach(response => {
            const country = response.country;
            if (!country) {
                console.log('⚠ Response missing country:', response);
                return;
            }

            const isoCode = countryIsoCodes[country];
            if (!isoCode) {
                console.log(`⚠ Country "${country}" not found in mapping`);
                return;
            }

            // Initialize country if not exists
            if (!countryStarters[country]) {
                countryStarters[country] = {};
            }

            // Count all three starters for this response
            [response.fireStarter, response.waterStarter, response.grassStarter].forEach(starter => {
                if (starter) {
                    const starterName = starter.toLowerCase();
                    countryStarters[country][starterName] = (countryStarters[country][starterName] || 0) + 1;
                    globalStarterVotes[starterName] = (globalStarterVotes[starterName] || 0) + 1;
                }
            });
        });

        console.log(`✓ Processed countries:`, Object.keys(countryStarters).length);

        // Build country data with proper vote counting
        const countryData = {};

        Object.entries(countryStarters).forEach(([country, starters]) => {
            const isoCode = countryIsoCodes[country];
            
            // Find dominant starter (most votes in this country)
            const dominantStarter = Object.entries(starters).reduce((a, b) => 
                b[1] > a[1] ? b : a
            )[0];

            const totalCountryVotes = Object.values(starters).reduce((sum, v) => sum + v, 0);
            const type = starterTypes[dominantStarter] || 'fire';
            const starterId = starterIds[dominantStarter] || 4;
            const pct = Math.round((starters[dominantStarter] / totalCountryVotes) * 100);

            countryData[isoCode] = {
                type,
                name: country,
                starter: dominantStarter.charAt(0).toUpperCase() + dominantStarter.slice(1),
                id: starterId,
                votes: starters[dominantStarter],
                pct
            };
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

        console.log('✓ Top 10:', top10.map(p => `${p.name}(${p.votes})`).join(', '));
        res.json({
            countryData,
            top10MapData: top10,
            totalVotes: allResponses.length
        });
    } catch (error) {
        console.error('Error calculating map data:', error);
        res.status(500).json({ error: 'Failed to calculate map data' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
