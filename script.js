// Text animation removed - using static arced text

// Pokemon starters data
const starters = {
    fire: [
        { name: 'charmander', id: 4, gen: 1 },
        { name: 'cyndaquil', id: 155, gen: 2 },
        { name: 'torchic', id: 255, gen: 3 },
        { name: 'chimchar', id: 390, gen: 4 },
        { name: 'tepig', id: 498, gen: 5 },
        { name: 'fennekin', id: 653, gen: 6 },
        { name: 'litten', id: 725, gen: 7 },
        { name: 'scorbunny', id: 813, gen: 8 },
        { name: 'fuecoco', id: 909, gen: 9 }
    ],
    water: [
        { name: 'squirtle', id: 7, gen: 1 },
        { name: 'totodile', id: 158, gen: 2 },
        { name: 'mudkip', id: 258, gen: 3 },
        { name: 'piplup', id: 393, gen: 4 },
        { name: 'oshawott', id: 501, gen: 5 },
        { name: 'froakie', id: 656, gen: 6 },
        { name: 'popplio', id: 728, gen: 7 },
        { name: 'sobble', id: 816, gen: 8 },
        { name: 'quaxly', id: 912, gen: 9 }
    ],
    grass: [
        { name: 'bulbasaur', id: 1, gen: 1 },
        { name: 'chikorita', id: 152, gen: 2 },
        { name: 'treecko', id: 252, gen: 3 },
        { name: 'turtwig', id: 387, gen: 4 },
        { name: 'snivy', id: 495, gen: 5 },
        { name: 'chespin', id: 650, gen: 6 },
        { name: 'rowlet', id: 722, gen: 7 },
        { name: 'grookey', id: 810, gen: 8 },
        { name: 'sprigatito', id: 906, gen: 9 }
    ]
};

// Pokemon types
const pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Remove active class from all buttons and contents
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Load Pokemon starters from PokeAPI
async function loadStarters() {
    for (const [type, pokemons] of Object.entries(starters)) {
        const container = document.getElementById(`${type}-starters`);

        for (const pokemon of pokemons) {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
                const data = await response.json();

                // Get the regular pixelated sprite
                const spriteUrl = data.sprites.front_default;

                // Create starter card
                const starterCard = document.createElement('div');
                starterCard.className = 'starter-card';
                starterCard.dataset.type = type;
                starterCard.dataset.pokemonId = pokemon.id;
                starterCard.dataset.pokemonName = pokemon.name;

                starterCard.innerHTML = `
                    <img src="${spriteUrl}" alt="${pokemon.name}" onerror="this.style.opacity='0.5'; this.title='Image failed to load'">
                    <div class="starter-info">
                        <span class="gen-badge">Gen ${pokemon.gen}</span>
                        <p>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
                    </div>
                `;

                starterCard.addEventListener('click', () => selectStarter(type, pokemon.name, pokemon.id, starterCard));

                container.appendChild(starterCard);
            } catch (error) {
                console.error(`Error loading ${pokemon.name}:`, error);
            }
        }
    }
}

// Select starter function
function selectStarter(type, name, id, cardElement) {
    // Remove selection from all cards of this type
    document.querySelectorAll(`.starter-card[data-type="${type}"]`).forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    cardElement.classList.add('selected');

    // Update hidden input
    document.getElementById(`${type}-starter-input`).value = name;
}

// Load Pokemon types buttons
function loadTypeButtons() {
    const container = document.getElementById('type-buttons');

    pokemonTypes.forEach(type => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'type-button';
        button.dataset.type = type;
        button.textContent = type.charAt(0).toUpperCase() + type.slice(1);

        button.addEventListener('click', () => selectType(type, button));

        container.appendChild(button);
    });
}

// Select type function
function selectType(type, buttonElement) {
    const input = document.getElementById('favourite-types-input');
    const selectedButtons = document.querySelectorAll('.type-button.selected');

    // If button is already selected, deselect it
    if (buttonElement.classList.contains('selected')) {
        buttonElement.classList.remove('selected');
    }
    // If fewer than 2 types selected, allow selection
    else if (selectedButtons.length < 2) {
        buttonElement.classList.add('selected');
    }
    // If 2 types are already selected, don't allow more
    else {
        alert('You can only select up to 2 favourite types!');
        return;
    }

    // Get all selected types and update hidden input
    const selectedTypes = Array.from(document.querySelectorAll('.type-button.selected'))
        .map(btn => btn.dataset.type)
        .join(', ');
    
    input.value = selectedTypes;
}

// Form submission
document.getElementById('pokemon-survey').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
        fireStarter: document.getElementById('fire-starter-input').value,
        waterStarter: document.getElementById('water-starter-input').value,
        grassStarter: document.getElementById('grass-starter-input').value,
        favouriteTypes: document.getElementById('favourite-types-input').value,
        favouriteGeneration: document.getElementById('favourite-generation').value,
        country: document.getElementById('country').value,
        ageRange: document.getElementById('age-range').value,
        choiceMethod: document.querySelector('input[name="choice-method"]:checked').value,
        timestamp: new Date().toISOString()
    };

    // Validate all starters are selected
    if (!formData.fireStarter || !formData.waterStarter || !formData.grassStarter) {
        alert('Please select one starter from each type!');
        return;
    }

    // Validate favourite types are selected
    if (!formData.favouriteTypes) {
        alert('Please select your two favourite types!');
        return;
    }

    try {
        // Send to backend API
        const response = await fetch('/api/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to submit response');
        }

        const result = await response.json();

        // Show success message
        alert('Survey submitted successfully! Thank you for your response.');

        // Reset form
        document.getElementById('pokemon-survey').reset();

        // Clear selections
        document.querySelectorAll('.starter-card').forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.type-button').forEach(btn => btn.classList.remove('selected'));

        // Switch to home tab
        document.getElementById('form').classList.remove('active');
        document.getElementById('home').classList.add('active');

        // Reload dashboard to show updated results
        await loadDashboard();
        
        // Refresh map data and top 10 list
        await refreshMapData();
    } catch (error) {
        console.error('Error submitting survey:', error);
        alert('Failed to submit survey. Please try again.');
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    loadStarters();
    loadTypeButtons();
    loadDashboard(); // Load dashboard on initial page load

    // Add back button handler
    const backButton = document.getElementById('back-to-home');
    if (backButton) {
        backButton.addEventListener('click', () => {
            document.getElementById('form').classList.remove('active');
            document.getElementById('home').classList.add('active');
        });
    }
});

// Dashboard functionality

async function loadDashboard() {
    const loadingElement = document.getElementById('dashboard-loading');
    const contentElement = document.getElementById('dashboard-content');

    try {
        loadingElement.style.display = 'block';
        contentElement.style.display = 'none';

        // Fetch survey responses from backend
        const response = await fetch('/api/responses');

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API error: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const data = await response.json();

        // Process and display data
        if (data && data.length > 0) {
            await processAndDisplayData(data);
            loadingElement.style.display = 'none';
            contentElement.style.display = 'block';
        } else {
            loadingElement.textContent = 'No survey responses yet. Submit the survey to see results!';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        loadingElement.textContent = `Error: ${error.message}`;
    }
}

async function processAndDisplayData(responses) {
    // Count votes for each type
    const fireStarters = {};
    const waterStarters = {};
    const grassStarters = {};
    const totalResponses = responses.length;

    responses.forEach(r => {
        fireStarters[r.fireStarter] = (fireStarters[r.fireStarter] || 0) + 1;
        waterStarters[r.waterStarter] = (waterStarters[r.waterStarter] || 0) + 1;
        grassStarters[r.grassStarter] = (grassStarters[r.grassStarter] || 0) + 1;
    });

    // Find most popular for each type
    const mostPopularFire = Object.entries(fireStarters).sort((a, b) => b[1] - a[1])[0];
    const mostPopularWater = Object.entries(waterStarters).sort((a, b) => b[1] - a[1])[0];
    const mostPopularGrass = Object.entries(grassStarters).sort((a, b) => b[1] - a[1])[0];

    // Create array of type winners sorted by vote count
    const typeWinners = [
        { name: mostPopularFire[0], votes: mostPopularFire[1], type: 'fire' },
        { name: mostPopularWater[0], votes: mostPopularWater[1], type: 'water' },
        { name: mostPopularGrass[0], votes: mostPopularGrass[1], type: 'grass' }
    ].sort((a, b) => b.votes - a.votes);

    const [first, second, third] = typeWinners;

    // Display in hero section (first place)
    await displayHeroPokemon(first, totalResponses);

    // Display in side panels (second and third)
    await displaySidePanels(second, third);

    // Display choice method stats
    await displayChoiceMethodStats(responses);

    // Display combined trainer types
    await displayCombinedTrainerTypes(responses);

    // Add click handlers for vote banner
    const voteBanner = document.getElementById('vote-banner');
    const voteBtn = document.getElementById('vote-btn');
    if (voteBanner) {
        voteBanner.addEventListener('click', () => {
            document.getElementById('home').classList.remove('active');
            document.getElementById('form').classList.add('active');
        });
    }
    if (voteBtn) {
        voteBtn.addEventListener('click', () => {
            document.getElementById('home').classList.remove('active');
            document.getElementById('form').classList.add('active');
        });
    }
}

async function displayHeroPokemon(pokemon, totalResponses) {
    try {
        // Fetch Pokemon data
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
        const pokemonData = await response.json();

        // Set sprite - use official artwork
        const spriteUrl = pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default;
        const heroSprite = document.getElementById('hero-sprite');
        heroSprite.src = spriteUrl;
        heroSprite.alt = pokemon.name;
        heroSprite.onerror = function() {
            this.style.opacity = '0.5';
            this.title = 'Image failed to load - trying fallback';
        };

        // Set name
        document.getElementById('hero-name').textContent = capitalize(pokemon.name);

        // Get generation
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        const generationUrl = speciesData.generation.url;
        const generationNumber = generationUrl.split('/').filter(Boolean).pop();

        // Update badges
        document.getElementById('hero-gen').textContent = `Gen ${generationNumber}`;
        document.getElementById('hero-type').textContent = capitalize(pokemon.type);
        document.getElementById('hero-type').className = `badge badge--${pokemon.type}`;

        // Update votes
        document.getElementById('hero-votes').textContent = `with ${pokemon.votes} vote${pokemon.votes !== 1 ? 's' : ''}`;
        document.getElementById('hero-trainers').textContent = `From ${totalResponses} trainer${totalResponses !== 1 ? 's' : ''} worldwide!`;

        // Update hero section background color
        const heroSection = document.getElementById('hero-section');
        heroSection.classList.remove('fire-hero', 'grass-hero');
        if (pokemon.type === 'fire') {
            heroSection.classList.add('fire-hero');
        } else if (pokemon.type === 'grass') {
            heroSection.classList.add('grass-hero');
        }

        // Get evolution chain
        const evolutionHTMLs = await getEvolutionChain(pokemonData.species.url);
        
        // Display starter in evolution line
        const starterImg = document.getElementById('evo-starter');
        const starterLabel = document.getElementById('evo-starter-label');
        if (starterImg) {
            starterImg.innerHTML = `<img src="${spriteUrl}" alt="${pokemon.name}" onerror="this.style.opacity='0.5'; this.title='Image failed to load'">`;
        }
        if (starterLabel) {
            starterLabel.textContent = capitalize(pokemon.name);
        }
        
        // Display evolutions
        if (evolutionHTMLs.length > 0) {
            const evo1Img = document.getElementById('evo-1');
            const evo1Label = document.getElementById('evo-1-label');
            if (evo1Img && evolutionHTMLs[0]) {
                evo1Img.innerHTML = `<img src="${evolutionHTMLs[0].sprite}" alt="${evolutionHTMLs[0].name}" onerror="this.style.opacity='0.5'; this.title='Image failed to load'">`;
            }
            if (evo1Label && evolutionHTMLs[0]) {
                evo1Label.textContent = capitalize(evolutionHTMLs[0].name);
            }
            
            const evo2Img = document.getElementById('evo-2');
            const evo2Label = document.getElementById('evo-2-label');
            if (evo2Img && evolutionHTMLs[1]) {
                evo2Img.innerHTML = `<img src="${evolutionHTMLs[1].sprite}" alt="${evolutionHTMLs[1].name}" onerror="this.style.opacity='0.5'; this.title='Image failed to load'">`;
            }
            if (evo2Label && evolutionHTMLs[1]) {
                evo2Label.textContent = capitalize(evolutionHTMLs[1].name);
            }
        }
    } catch (error) {
        console.error('Error displaying hero pokemon:', error);
    }
}

async function displaySidePanels(second, third) {
    try {
        // Display second place
        await displaySidePanel('type-panel-1', second);

        // Display third place
        await displaySidePanel('type-panel-2', third);
    } catch (error) {
        console.error('Error displaying side panels:', error);
    }
}

async function displaySidePanel(panelId, pokemon) {
    try {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        // Fetch Pokemon data
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
        const pokemonData = await response.json();

        // Set sprite - use official artwork
        const spriteUrl = pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default;
        const spriteImg = panel.querySelector('.type-panel__sprite');
        spriteImg.src = spriteUrl;
        spriteImg.alt = pokemon.name;
        spriteImg.onerror = function() {
            this.style.opacity = '0.5';
            this.title = 'Image failed to load';
        };

        // Set name
        panel.querySelector('.type-panel__name').textContent = capitalize(pokemon.name);

        // Get generation
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        const generationUrl = speciesData.generation.url;
        const generationNumber = generationUrl.split('/').filter(Boolean).pop();

        // Update generation badge
        panel.querySelector('.type-panel__gen-badge').textContent = `Gen ${generationNumber}`;

        // Update votes
        panel.querySelector('.type-panel__votes .vote-count__text').textContent = `with ${pokemon.votes} vote${pokemon.votes !== 1 ? 's' : ''}`;

        // Update panel colors and styling based on type
        panel.classList.remove('type-panel--fire', 'type-panel--grass', 'type-panel--water');
        panel.classList.add(`type-panel--${pokemon.type}`);

        // Update label text and badge styling
        const typeLabel = panel.querySelector('.type-panel__label');
        const badgeSpan = typeLabel.querySelector('span');
        badgeSpan.textContent = capitalize(pokemon.type);
        
        // Remove old badge classes and add new one
        badgeSpan.className = `badge--${pokemon.type}-inline`;

        // Ensure text is correct
        typeLabel.innerHTML = `The top <span class="badge--${pokemon.type}-inline">${capitalize(pokemon.type)}</span> starter is...`;
    } catch (error) {
        console.error(`Error displaying side panel ${panelId}:`, error);
    }
}

async function getEvolutionChain(speciesUrl) {
    try {
        // Fetch species data
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        // Fetch evolution chain
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // Extract evolution chain
        const chain = [];
        let current = evolutionData.chain;

        while (current) {
            chain.push(current.species.name);
            current = current.evolves_to[0];
        }

        // Only show evolutions after the first one
        const evolutions = [];
        for (let i = 1; i < chain.length; i++) {
            const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${chain[i]}`);
            const pokemonData = await pokemonResponse.json();
            const sprite = pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default;

            evolutions.push({
                name: chain[i],
                sprite: sprite
            });
        }

        return evolutions;
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        return [];
    }
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

// ── MAP INITIALIZATION ──────────────────────────────────────────────────────
let countryData = {};
let top10MapData = [];

const typeColor = { grass:'#5aaf5a', fire:'#e05030', water:'#3a8fd4' };

const starterIds = {
  Bulbasaur:1,Charmander:4,Squirtle:7,
  Chikorita:152,Cyndaquil:155,Totodile:158,
  Treecko:252,Torchic:255,Mudkip:258,
  Turtwig:387,Chimchar:390,Piplup:393,
  Snivy:495,Tepig:498,Oshawott:501,
  Chespin:650,Fennekin:653,Froakie:656,
  Rowlet:722,Litten:725,Popplio:728,
  Grookey:810,Scorbunny:813,Sobble:816,
};

// Fetch map data from MongoDB via API
async function fetchMapData() {
    try {
        const response = await fetch('/api/map-data');
        if (!response.ok) throw new Error('Failed to fetch map data');
        const data = await response.json();
        countryData = data.countryData || {};
        top10MapData = data.top10MapData || [];
        console.log('Map data fetched:', { countryData, top10MapData });
        
        // Log type distribution
        const typeCounts = { grass: 0, fire: 0, water: 0 };
        Object.values(countryData).forEach(country => {
            typeCounts[country.type]++;
        });
        console.log('Type distribution by country:', typeCounts);
        return true;
    } catch (error) {
        console.error('Error fetching map data from MongoDB:', error);
        return false;
    }
}

// Refresh top 10 list quickly (called after survey submission)
async function refreshMapData() {
    try {
        // Fetch ONLY the top 10 (much faster than map-data endpoint)
        const response = await fetch(`/api/top10?t=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to refresh top 10 data');
        const top10Data = await response.json();
        top10MapData = top10Data;
        
        // Update the top 10 list on the page immediately
        populateTop10();
        
        console.log('Top 10 refreshed:', top10MapData.map(p => `${p.name}(${p.votes})`).join(', '));
    } catch (error) {
        console.error('Error refreshing top 10:', error);
    }
}

// Populate top 10 list
function populateTop10() {
    const mapList = document.getElementById('top10-list');
    if (mapList && top10MapData.length > 0) {
        mapList.innerHTML = '';
        top10MapData.forEach((p, i) => {
            mapList.innerHTML += `
                <div class="top10-row">
                    <span class="top10-rank">${i+1}.</span>
                    <img class="top10-sprite"
                         src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png"
                         alt="${p.name}"/>
                    <span class="top10-name">${p.name}</span>
                    <span class="top10-votes">${p.votes}</span>
                </div>`;
        });
    }
}

// Initialize map
async function initializeMap() {
    const svg = d3.select('#map-svg');
    const tooltip = document.getElementById('tooltip');
    const mapSide = document.querySelector('.map-side');

    if (!svg.node()) return;

    // Fetch data from MongoDB first
    const dataLoaded = await fetchMapData();
    if (!dataLoaded) {
        svg.append('text')
            .attr('x', 480).attr('y', 250)
            .attr('text-anchor','middle')
            .attr('font-size', 13)
            .attr('fill', '#8899bb')
            .text('Failed to load map data — check MongoDB connection');
        return;
    }

    // Populate top 10 list
    populateTop10();

    // Use fixed dimensions for consistent scaling
    const W = 960, H = 500;

    svg.attr('viewBox', `0 0 ${W} ${H}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    // Load world topojson
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(world => {
            const countries = topojson.feature(world, world.objects.countries);

            // fitSize automatically scales and translates to fit geometry in viewBox
            const projection = d3.geoNaturalEarth1()
                .fitSize([W, H], countries);

            const path = d3.geoPath().projection(projection);

            svg.selectAll('path')
                .data(countries.features)
                .join('path')
                    .attr('d', path)
                    .attr('fill', d => {
                        const info = countryData[+d.id];
                        return info ? typeColor[info.type] : '#c8d8e8';
                    })
                    .attr('stroke', 'rgba(255,255,255,0.55)')
                    .attr('stroke-width', 0.4)
                    .on('mousemove', function(event, d) {
                        const info = countryData[+d.id];
                        if (!info) return;
                        const rect = mapSide.getBoundingClientRect();
                        tooltip.innerHTML = `<strong>${info.name}</strong>: ${info.starter} · ${info.pct}% (${info.votes} votes)`;
                        tooltip.classList.add('visible');
                        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
                        tooltip.style.top  = (event.clientY - rect.top  - 36) + 'px';
                    })
                    .on('mouseleave', () => tooltip.classList.remove('visible'));

            // ── SPRITES ──────────────────────────────────────
            const spriteSize = 18;

            // Group features that have data and a valid centroid
            const spriteData = countries.features
                .map(d => {
                    const info = countryData[+d.id];
                    if (!info) return null;
                    const c = path.centroid(d);
                    if (isNaN(c[0]) || isNaN(c[1])) return null;
                    // Use info.id which is already set by the server
                    if (!info.id) return null;
                    return { d, info, c };
                })
                .filter(Boolean);

            const spriteGroup = svg.append('g').attr('class', 'sprites');

            spriteGroup.selectAll('image')
                .data(spriteData)
                .join('image')
                    .attr('href', s => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.info.id}.png`)
                    .attr('x', s => s.c[0] - spriteSize / 2)
                    .attr('y', s => s.c[1] - spriteSize / 2)
                    .attr('width', spriteSize)
                    .attr('height', spriteSize)
                    .attr('image-rendering', 'pixelated')
                    .style('pointer-events', 'all')
                    .style('cursor', 'pointer')
                    .on('mousemove', function(event, s) {
                        const rect = mapSide.getBoundingClientRect();
                        tooltip.innerHTML = `<strong>${s.info.name}</strong>: ${s.info.starter} · ${s.info.pct}% (${s.info.votes} votes)`;
                        tooltip.classList.add('visible');
                        tooltip.style.left = (event.clientX - rect.left + 12) + 'px';
                        tooltip.style.top  = (event.clientY - rect.top  - 36) + 'px';
                    })
                    .on('mouseleave', () => tooltip.classList.remove('visible'));
        })
        .catch(() => {
            svg.append('text')
                .attr('x', W/2).attr('y', H/2)
                .attr('text-anchor','middle')
                .attr('font-size', 13)
                .attr('fill', '#8899bb')
                .text('Map data unavailable — connect to internet to load');
        });
}

// Display choice method statistics
async function displayChoiceMethodStats(responses) {
    try {
        // Count choice methods
        const choiceMethodCounts = {};
        
        responses.forEach(r => {
            if (r.choiceMethod) {
                choiceMethodCounts[r.choiceMethod] = (choiceMethodCounts[r.choiceMethod] || 0) + 1;
            }
        });

        // Find the most popular choice method
        const [topMethod, topCount] = Object.entries(choiceMethodCounts).sort((a, b) => b[1] - a[1])[0] || ['Experience', 0];
        const topPercent = Math.round((topCount / responses.length) * 100);

        // Update the text
        document.getElementById('choice-method-name').textContent = topMethod;
        document.getElementById('choice-method-percent').textContent = topPercent;

        // Render pie chart for choice methods
        const chartElement = document.getElementById('choiceMethodChart');
        if (!chartElement) return;

        // Prepare data for chart
        const labels = Object.keys(choiceMethodCounts);
        const data = Object.values(choiceMethodCounts);
        const colors = ['#64b5f6', '#81c784', '#ffb74d', '#ef5350', '#ba68c8', '#29b6f6'];

        new Chart(chartElement.getContext('2d'), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: '#2D2D3A',
                    borderWidth: 3,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#fff',
                            font: {
                                family: "'Press Start 2P', monospace",
                                size: 10,
                                weight: '600'
                            },
                            padding: 12,
                            boxWidth: 12,
                            boxHeight: 12
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        titleColor: '#2D2D3A',
                        bodyColor: '#2D2D3A',
                        borderColor: '#2D2D3A',
                        borderWidth: 2,
                        cornerRadius: 4,
                        padding: 10,
                        font: {
                            family: "'Press Start 2P', monospace",
                            size: 9
                        },
                        callbacks: {
                            label: ctx => `${ctx.label}: ${ctx.parsed} response${ctx.parsed !== 1 ? 's' : ''}`
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error displaying choice method stats:', error);
    }
}

// Display combined trainer types
async function displayCombinedTrainerTypes(responses) {
    try {
        // Count favorite types
        const typeCounts = {};
        responses.forEach(r => {
            // Handle new format with multiple types (comma-separated)
            if (r.favouriteTypes) {
                const types = r.favouriteTypes.split(',').map(t => t.trim());
                types.forEach(type => {
                    if (type) {
                        typeCounts[type] = (typeCounts[type] || 0) + 1;
                    }
                });
            }
            // Handle old format with single type
            else if (r.favouriteType) {
                typeCounts[r.favouriteType] = (typeCounts[r.favouriteType] || 0) + 1;
            }
        });

        // Get top 2 types
        const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);

        if (topTypes.length === 0) return;

        // Get the percentage for the top 2 combined
        const totalVotes = responses.length;
        const topTwoVotes = topTypes.reduce((sum, [_, count]) => sum + count, 0);
        const percentage = Math.round((topTwoVotes / totalVotes) * 100);

        // Create type color mapping
        const typeColors = {
            'normal': '#A8A878',
            'fire': '#F08030',
            'water': '#6890F0',
            'electric': '#F8D030',
            'grass': '#78C850',
            'ice': '#98D8D8',
            'fighting': '#C03028',
            'poison': '#A040A0',
            'ground': '#E0C068',
            'flying': '#A890F0',
            'psychic': '#F85888',
            'bug': '#A8B820',
            'rock': '#B8A038',
            'ghost': '#705898',
            'dragon': '#7038F8',
            'dark': '#705848',
            'steel': '#B8B8D0',
            'fairy': '#EE99AC'
        };

        // Populate type buttons
        const typeButtonsContainer = document.getElementById('typeButtons');
        typeButtonsContainer.innerHTML = '';

        topTypes.forEach(([type, count]) => {
            const button = document.createElement('button');
            button.className = 'type-button combined-trainer-type-button';
            const typePercentage = Math.round((count / totalVotes) * 100);
            button.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} (${typePercentage}%)`;
            button.style.backgroundColor = typeColors[type] || '#999';
            button.style.border = 'none';
            typeButtonsContainer.appendChild(button);
        });

        // Update percentage text
        document.getElementById('type-percentage').textContent = `making up ${percentage}% of all votes.`;

    } catch (error) {
        console.error('Error displaying combined trainer types:', error);
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMap);
} else {
    initializeMap();
}
