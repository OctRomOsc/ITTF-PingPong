# ITTF API

Unofficial API written in TypeScript to retrieve player rankings and statistics from ITTF (International Table Tennis Federation) affiliated members and events. Provides methods to fetch player rankings with input validation and error handling.

---

## Features

- Fetch current rankings broken down by gender (Man, Woman, Mixed for doubles), by type (Youth, aggregate of U15, U18, and U21 & Senior), and by category (Singles, Doubles Pair rankings, Doubles Individual rankings)
- View all ITTF ranked players broken down by country (in progress)    
- Throw descriptive errors for invalid inputs  
- Facilitates the ingestion of ITTF data, making it easy to download full datasets to .csv files  

---

## Installation

```bash
npm install ittf-ping-pong
# or using yarn
yarn add ittf-ping-pong
```
---

## Usage
- TypeScript:
```typescript
import { ittfPingPong } from 'ittf-ping-pong';

const client = new ittfPingPong();

async function fetchRankings() {
  try {
    const rankings : Rankings = await client.currentRankings('SEN', 'M', 'S', 10);
    console.log(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error.message);
  }
}

fetchRankings();
```
- EcmaScript :
```js
import { ittfPingPong } from 'ittf-ping-pong';

const client = new ittfPingPong();

async function fetchRankings() {
  try {
    const rankings = await client.currentRankings('SEN', 'M', 'S', 10);
    console.log(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error.message);
  }
}

fetchRankings();
```
- CommonJS :

```js
async function fetchRankings() {
  try {
    const {ittfPingPong} = require("ittf-pingpong")
    const client = new ittfPingPong();
    const rankings = await client.currentRankings('SEN', 'M', 'S', 10);
    console.log(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error.message);
  }
}

fetchRankings();
```  
---

## API Methods

### currentRankings

Fetches current player rankings based on specified filters.

- Parameters:
```typescript
async currentRankings(
  type: 'YOU' | 'SEN',             // Competition type: Youth ('YOU') or Senior ('SEN')
  gender: 'M' | 'W' | 'X',         // Gender: Male ('M'), Female ('W'), Mixed ('X')
  category: 'S' | 'D' | 'DI',      // Category: Singles ('S'), Doubles ('D'), Doubles Individual ('DI')
  topN: number | 'all'            // Number of top players to fetch, or 'all'
): Promise<Rankings>
```

- Returns:
    * Promise resolving to an array of rankings data.

- Errors:
    * Throws an error if inputs are invalid, e.g., 'Invalid gender: V. Valid options are: M, W, X'
    * Throws an error if X gender is used with invalid category (e.g., 'S')