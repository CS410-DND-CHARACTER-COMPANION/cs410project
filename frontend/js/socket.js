// connect to socket.io server
const socket = io();

// Request all characters when the page loads
socket.emit('getAllCharacters');

// Listen for the 'charactersList' event and handle the received data
socket.on('charactersList', (characters) => {
  console.log('All characters:', characters);
  // Update the DOM with the list of characters
  characters.forEach(character => {
    // For example, append each character to a list on the page
    const characterList = document.getElementById('characterList');
    const characterItem = document.createElement('li');
    characterItem.textContent = `${character.name} - ${character.class} - ${character.species}`;
    characterList.appendChild(characterItem);
  });
});

var form = document.getElementById('characterForm');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Character object
  const character = {
    name: document.getElementById('Name').value,
    background:document.getElementById('Background').value,
    species: document.getElementById('Species').value,
    class: document.getElementById('Classes').value
  };

  // emit newCharacter event with character data
  socket.emit('newCharacter', character);

  // Clear form after submission
  document.getElementById('characterForm').reset();
});

// Listen for updates when new character is added
socket.on('characterAdded', function(character) {
  console.log('New character added:', character);
  // Append the new character to the DOM
  const characterList = document.getElementById('characterList');
  const characterItem = document.createElement('li');
  characterItem.textContent = `${character.name} - ${character.class} - ${character.species}`;
  characterList.appendChild(characterItem);
});

// Listen for updates when a character is updated
socket.on('characterUpdated', function(character) {
  console.log('Character updated:', character);
  // TODO: update list of characters/displayed sheet
});