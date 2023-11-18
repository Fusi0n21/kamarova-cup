



function renderTable(){
  // Assuming you're working in a browser environment
  fetch('http://51.20.130.207:3000/data.json')
    .then(response => response.json())
    .then(data => {
      // Access the 'people' array in the JSON
      const people = data.people;

      // Sort the array by Elo ratings in ascending order
      people.sort((a, b) => b.elo - a.elo);

      const selectedCountElement = document.querySelector('#selectedCount');

      const tableBody = document.querySelector('#peopleTable tbody');
      let rank = 0
      // Populate the table with data

      tableBody.innerHTML = '';
      people.forEach(person => {
        rank = rank + 1
        const row = tableBody.insertRow();
        const rankCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        const eloCell = row.insertCell(2);

        // Set the cell values
        nameCell.textContent = person.name;
        eloCell.textContent = person.elo;
        rankCell.textContent = rank

        nameCell.addEventListener('click', () => {
          // Toggle the 'selected' class on the clicked row
          row.classList.toggle('selected');
  
          // Add or remove the person object from the selectedPlayers array
          if (row.classList.contains('selected')) {
            selectedPlayers.push(person);
          } else {
            selectedPlayers = selectedPlayers.filter(selectedPerson => selectedPerson.name !== person.name);
          }
  
          // Update the selected count
          selectedCountElement.textContent = selectedPlayers.length;
        })

        
      });
    })
    .catch(error => console.error('Error fetching JSON:', error));
}
let selectedPlayers = [];
let team1
let team2
let eloChageIfFirstTeamWon
let eloChageIfSecondTeamWon
const kFactor = 40;


renderTable()


const startGameButton = document.getElementById('startGameButton')
startGameButton.addEventListener('click', checkForTenPlayers)

function checkForTenPlayers(){
  if(selectedPlayers.length == 10){
    startGame()
  }
}


function startGame(){

  const tableBody = document.querySelector('#gameTable tbody');
  tableBody.innerHTML = ''
  let team1Total = 0
  let team2Total = 0

  shufflePlayers()
  splitToTeams()
  let index = 0
  team1.forEach(person => {
    const row = tableBody.insertRow();
    const roleCell = row.insertCell(0);
    const nameCell = row.insertCell(1);
    const eloCell = row.insertCell(2)
    const difCell = row.insertCell(3)
    const eloOponentCell = row.insertCell(4);
    const nameOponentCell = row.insertCell(5);
    nameCell.textContent = person.name;
    eloCell.textContent = person.elo
    

    eloOponentCell.textContent = team2[index].elo
    nameOponentCell.textContent = team2[index].name

    difCell.textContent = Math.round((eloCell.textContent - eloOponentCell.textContent)  * 10) / 10

    team1Total = team1Total + person.elo
    team2Total = team2Total + team2[index].elo

    index = index + 1
  });

  const row = tableBody.insertRow();
  const totalRow = row.insertCell(0)
  const team1WonButtonCell = row.insertCell(1)
  const team1TotalEloCell = row.insertCell(2);
  const difTotalRow = row.insertCell(3);
  const team2TotalEloCell = row.insertCell(4);
  const team2WonButtonCell = row.insertCell(5);
  //team1WonButtonCell.textContent = calculateEloRatingChangeIfAWon(team1Total, team2Total)
  team1WonButton = document.createElement('button')
  team1WonButton.textContent = 'Team 1 WON'
  team1WonButton.addEventListener('click', firstTeamWon)
  team1WonButtonCell.append(team1WonButton)

  team2WonButton = document.createElement('button')
  team2WonButton.textContent = 'Team 2 WON'
  team2WonButton.addEventListener('click', secondTeamWon)
  team2WonButtonCell.append(team2WonButton)


  team1TotalEloCell.textContent = Math.round(team1Total * 10) / 10
  team2TotalEloCell.textContent = Math.round(team2Total * 10) / 10
  difTotalRow.textContent = Math.round((team1Total - team2Total)  * 10) / 10


  tableBody.rows[0].cells[0].textContent = 'TOP'
  tableBody.rows[1].cells[0].textContent = 'JUNGLE'
  tableBody.rows[2].cells[0].textContent = 'MID'
  tableBody.rows[3].cells[0].textContent = 'ADC'
  tableBody.rows[4].cells[0].textContent = 'SUPPORT'


  const newRow = tableBody.insertRow(); 
for(let a = 0; a<6; a++){
  newRow.insertCell(a)
}

eloChageIfFirstTeamWon = calculateEloRatingChangeIfAWon(team1Total, team2Total)
eloChageIfSecondTeamWon = calculateEloRatingChangeIfAWon(team2Total, team1Total)

tableBody.rows[6].cells[1].textContent = '+' + eloChageIfFirstTeamWon
tableBody.rows[6].cells[5].textContent = '+' + eloChageIfSecondTeamWon




}

function shufflePlayers(){
  for (let i = selectedPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedPlayers[i], selectedPlayers[j]] = [selectedPlayers[j], selectedPlayers[i]];
  }
}

function splitToTeams(){
  team1 = null
  team2 = null
  const numPlayersPerTeam = Math.ceil(selectedPlayers.length / 2);
  team1 = selectedPlayers.slice(0, numPlayersPerTeam);
  team2 = selectedPlayers.slice(numPlayersPerTeam);

}

function calculateEloRatingChangeIfAWon(a, b) {
  // Calculate expected scores
  const expectedWinnerScore = 1 / (1 + Math.pow(10, (b - a) / 400));

  // Calculate Elo rating change
  const ratingChangeWinner = Math.round((kFactor * (1 - expectedWinnerScore)) * 10) / 10;
  return ratingChangeWinner
}

function firstTeamWon() {
  const updateEloPromises = [];
  team1.forEach((player) => {
    console.log(player.name)
    console.log(player.elo)
    let newElo = player.elo + eloChageIfFirstTeamWon
    newElo = Math.round(newElo * 10) / 10
    updateEloPromises.push(updateElo(player.name, newElo));
  })

  team2.forEach((player) => {
    console.log(player.name)
    console.log(player.elo)
    let newElo = player.elo - eloChageIfFirstTeamWon
    newElo = Math.round(newElo * 10) / 10
    updateEloPromises.push(updateElo(player.name, newElo));
  })
  Promise.all(updateEloPromises)
    .then(() => {
      // All updates are complete
      resetPage()
    })
    .catch((error) => {
      console.error('Error updating ELO:', error);
      // Handle error as needed
    });
}


function secondTeamWon(){
  const updateEloPromises = [];



  team1.forEach((player) => {
    console.log(player.name)
    console.log(player.elo)
    let newElo = player.elo - eloChageIfSecondTeamWon
    newElo = Math.round(newElo * 10) / 10
    updateEloPromises.push(updateElo(player.name, newElo));
  })

  team2.forEach((player) => {
    console.log(player.name)
    console.log(player.elo)
    let newElo = player.elo + eloChageIfSecondTeamWon
    newElo = Math.round(newElo * 10) / 10
    updateEloPromises.push(updateElo(player.name, newElo));
  })
  Promise.all(updateEloPromises)
    .then(() => {
      // All updates are complete
      resetPage()
    })
    .catch((error) => {
      console.error('Error updating ELO:', error);
      // Handle error as needed
    });


}


function resetPage(){
  location.reload()
}

const updateElo = async (playerName, newElo) => {
  try {
    const response = await fetch('http://51.20.130.207:3000/update-elo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName, newElo }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
    } else {
      console.error('Failed to update ELO:', response.statusText);
    }
  } catch (error) {
    console.error('Error during fetch:', error.message);
  }
};





