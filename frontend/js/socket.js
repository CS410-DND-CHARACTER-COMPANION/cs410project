/*
Connects to the socket.io server and handles the events for the character sheet.
*/

// connect to socket.io server
const socket = io();

// Global array for inventory (if needed later)
let inventory = [];

// Request all characters when the page loads
socket.emit('getAllCharacters');

// Listen for the 'charactersList' event and handle the received data
socket.on('charactersList', (characters) => {
  console.log('All characters:', characters);
  
  // Clear and update the DOM with the list of characters
  const characterList = document.getElementById('characterList');
  characterList.innerHTML = ''; // Clear existing list
  
  characters.forEach(character => {
      // Create list item for each character
      const characterItem = document.createElement('li');
      // Display character information
      characterItem.innerHTML = `
        <strong>${character.name}</strong> - Level ${character.level} ${character.species} ${character.class}
        <div>HP: ${character.currentHP}/${character.maxHP} | AC: ${character.ac + character.shield} (${character.ac} + ${character.shield}) | 
        ${character.inspiration ? '⭐ Inspired' : ''}</div>
      `;
      characterList.appendChild(characterItem);
  });
});

// For DM Overview
socket.on('DMOverviewcharactersList', (characters) => {
  console.log('All characters:', characters);
  
  // Clear and update the DOM with the list of characters
  const characterList = document.getElementById('characterList');
  characterList.innerHTML = ''; // Clear existing list
  
  characters.forEach(character => {
      // Create list item for each character
      const characterItem = document.createElement('table');
      // Display character information
      characterItem.innerHTML =
      `
      <tr>
        <th>${character.name}</th>
      </tr>
      
      <tr>
        <th>${character.species}</th>
        <th>${character.class}</th>
        <td onclick="addEquipmentItem()">[${character.currentHP} / ${character.maxHP}]</td>
      </tr>
      <tr class="blank_column" style="width:10%" style="height:10%">
          <th rowspan="4" style="width:10%" style="height:10%">Attributes</th>
      </tr>
      <tr>
        <th>STR</th>
        <th>DEX</th>
        <th>CON</th>
        <th>INT</th>
        <th>WIS</th>
        <th>CHA</th>
      </tr>
      <tr>
        <td>${character.strength}</td>
        <td>${character.dexterity}</td>
        <td>${character.constitution}</td>
        <td>${character.intelligence}</td>
        <td>${character.wisdom}</td>
        <td>${character.charisma}</td>
      </tr>
      `;
      characterList.appendChild(characterItem);
  });
});

socket.on('DMUpdateCharacterData', async (chraracterId) =>
{
  const client = new MongoClient("mongodb+srv://GroupUser:cs410project@cluster0.gjnf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  try {
    await client.connect();

    // Attempts to find the one edited character with IDs
    const characters = await client.db("dnd_screen").collection("character_sheets").findOne({_id: chraracterId});
    
    // Update the selected character into the database
    const result = await client.db("dnd_screen").collection("character_sheets").insertOne(character);
    console.log(`New character created with the following id: ${result.insertedId}`);
    character._id = result.insertedId;

    // emit "charactersList" event(optional)
    
  } catch (e) {
    console.error("Error updating characters:", e);
    socket.emit('error', 'Failed to update characters');
  } finally {
    await client.close();
  }
});

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
  const characterForm = document.getElementById('characterForm');
  
  if (characterForm) {
      characterForm.addEventListener('submit', function(event) {
          event.preventDefault();
          
          // Collect form data
          const characterData = {
              name: document.getElementById('name').value,
              background: document.getElementById('background').value,
              species: document.getElementById('species').value,
              class: document.getElementById('class').value,
              subclass: document.getElementById('subclass').value,
              level: parseInt(document.getElementById('level').value) || 1,
              xp: parseInt(document.getElementById('xp').value) || 0,
              ac: parseInt(document.getElementById('ac').value) || 10,
              shield: parseInt(document.getElementById('shield').value) || 0,
              currentHP: parseInt(document.getElementById('currentHP').value),
              maxHP: parseInt(document.getElementById('maxHP').value),
              tempHP: parseInt(document.getElementById('tempHP').value) || 0,
              deathSaves: parseInt(document.getElementById('deathSaves').value) || 0,
              proficiencyBonus: parseInt(document.getElementById('proficiencyBonus').value) || 2,
              passivePerception: parseInt(document.getElementById('passivePerception').value) || 10,
              inspiration: document.getElementById('inspiration').checked,
              initiative: parseInt(document.getElementById('initiative').value) || 0,
              speed: parseInt(document.getElementById('speed').value) || 30,
              strength: parseInt(document.getElementById('strength').value) || 10,
              strengthModifier: parseInt(document.getElementById('strenghtModifier').value) || 0,
              dexterity: parseInt(document.getElementById('dexterity').value) || 10,
              dexterityModifier: parseInt(document.getElementById('dexterityModifier').value) || 0,
              constitution: parseInt(document.getElementById('constitution').value) || 10,
              constitutionModifier: parseInt(document.getElementById('constitutionModifier').value) || 0,
              intelligence: parseInt(document.getElementById('intelligence').value) || 10,
              intelligenceModifier: parseInt(document.getElementById('intelligenceModifier').value) || 0,
              wisdom: parseInt(document.getElementById('wisdom').value) || 10,
              wisdomModifier: parseInt(document.getElementById('wisdomModifier').value) || 0,
              charisma: parseInt(document.getElementById('charisma').value) || 10,
              charismaModifier: parseInt(document.getElementById('charismaModifier').value) || 0,
              inventory: inventory // Using global inventory array
          };

          // Store the character data in local storage for the display page
          localStorage.setItem('currentCharacter', JSON.stringify(characterData));

          // Emit the new character data to the server
          socket.emit('newCharacter', characterData);
          
          // Reset form
          characterForm.reset();
          
          // Show success message
          alert('Character created successfully!');

          // Redirect to the display page
          window.location.href = 'displayCharacter.html';
      });
  }
});

/* Old Version
var form = document.getElementById('characterForm');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Character object
  const characterData = {
    name: document.getElementById('name').value,
    background: document.getElementById('background').value,
    species: document.getElementById('species').value,
    class: document.getElementById('class').value,
    subclass: document.getElementById('subclass').value,
    level: document.getElementById('level').value,
    xp: document.getElementById('xp').value,
    ac: document.getElementById('ac').value,
    shield: document.getElementById('shield').value,
    currentHP: document.getElementById('currentHP').value,
    maxHP: document.getElementById('maxHP').value,
    inspiration: document.getElementById('inspiration').checked,
    speed: document.getElementById('speed').value,
    inventory: inventory
};

  // emit newCharacter event with character data
  socket.emit('newCharacter', character);

  // Clear form after submission
  document.getElementById('characterForm').reset();
});
*/

// Listen for updates when new character is added
socket.on('characterAdded', function(character) {
  console.log('New character added:', character);

  // Refresh the character list
  socket.emit('getAllCharacters');
});

// Listen for updates when a character is updated
socket.on('characterUpdated', function(character) {
  console.log('Character updated:', character);
  // TODO: update list of characters/displayed sheet
  // Refresh the character list
  socket.emit('getAllCharacters');
});