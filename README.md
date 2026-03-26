# Pokemon Dashboard

A Pokemon starter survey application with data visualization. Users can select their favorite starters and answer questions about Pokemon preferences. Survey responses are stored in MongoDB Atlas.

## Features

- Interactive Pokemon starter selection (all 9 generations)
- Survey form with multiple questions
- Data stored in MongoDB Atlas
- Real-time statistics API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Development

Run the server with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `POST /api/responses` - Submit a new survey response
- `GET /api/responses` - Get all survey responses
- `GET /api/stats` - Get aggregated statistics

## MongoDB Configuration

- Database: `responses`
- Collection: `pokeresponses`
- Connection: MongoDB Atlas