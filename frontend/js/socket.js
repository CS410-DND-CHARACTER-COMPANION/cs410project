// connect to socket.io server
const socket = io();

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
  // TODO: append character to DM's list of characters
});

// Listen for updates when a character is updated
socket.on('characterUpdated', function(character) {
  console.log('Character updated:', character);
  // TODO: update list of characters/displayed sheet
});