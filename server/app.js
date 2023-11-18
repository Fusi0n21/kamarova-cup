const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path'); // Add this line

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Use path.join to create an absolute path to the 'public' directory
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Load the players from the JSON file
let players = require('./public/data.json');


app.post('/update-elo', (req, res) => {
  const { playerName, newElo } = req.body;

  const playerIndex = players.people.findIndex(p => p.name === playerName);

  if (playerIndex !== -1) {
    // Update the player's ELO
    players.people[playerIndex].elo = newElo;

    // Save the updated players back to the JSON file
    fs.writeFileSync('./public/data.json', JSON.stringify(players, null, 2));

    res.status(200).json({ success: true, message: 'ELO updated successfully' });
  } else {
    res.status(404).json({ success: false, message: 'Player not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
