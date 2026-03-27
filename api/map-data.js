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

            // Count each starter ONCE per response (for most popular by country)
            // Fire starter
            if (response.fireStarter) {
                const starter = response.fireStarter.toLowerCase();
                countryStarters[country][starter] = (countryStarters[country][starter] || 0) + 1;
            }
            // Water starter
            if (response.waterStarter) {
                const starter = response.waterStarter.toLowerCase();
                countryStarters[country][starter] = (countryStarters[country][starter] || 0) + 1;
            }
            // Grass starter
            if (response.grassStarter) {
                const starter = response.grassStarter.toLowerCase();
                countryStarters[country][starter] = (countryStarters[country][starter] || 0) + 1;
            }
        });

        // Count global votes (each starter counted per response it appears in)
        allResponses.forEach(response => {
            [response.fireStarter, response.waterStarter, response.grassStarter].forEach(starter => {
                if (starter) {
                    const starterName = starter.toLowerCase();
                    globalStarterVotes[starterName] = (globalStarterVotes[starterName] || 0) + 1;
                }
            });
        });

        console.log(`✓ Processed countries:`, Object.keys(countryStarters).length);
        console.log(`✓ All responses count: ${allResponses.length}`);
        console.log(`✓ Global starter votes:`, Object.entries(globalStarterVotes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([name, votes]) => `${name}(${votes})`)
            .join(', '));

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
        res.status(200).json({
            countryData,
            top10MapData: top10,
            totalVotes: allResponses.length
        });
    } catch (error) {
        console.error('Error calculating map data:', error.message);
        res.status(500).json({ error: 'Failed to calculate map data: ' + error.message });
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
