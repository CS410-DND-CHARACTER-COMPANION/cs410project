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
      characterItem.innerHTML = `
          <strong>${character.name}</strong> - Level ${character.level} ${character.species} ${character.class}
          <div>HP: ${character.currentHP}/${character.maxHP}</div>
      `;
      characterList.appendChild(characterItem);
  });
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
              inspiration: document.getElementById('inspiration').checked,
              initiative: parseInt(document.getElementById('initiative').value) || 0,
              speed: parseInt(document.getElementById('speed').value) || 30,
              inventory: inventory // Using global inventory array
          };

          // Emit the new character data to the server
          socket.emit('newCharacter', characterData);
          
          // Reset form
          characterForm.reset();
          
          // Show success message
          alert('Character created successfully!');
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