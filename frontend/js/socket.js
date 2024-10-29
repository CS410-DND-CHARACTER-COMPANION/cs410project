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

    // Templates for Stats/Attributes
    const HitPoint = document.createElement("div");
      const HitPointText = document.createElement("label");
      HitPointText.textContent = "HitPoint: "
      HitPoint.appendChild(HitPointText);
      const HitPointInput = document.createElement("input");
      // Going to loop this or something
      HitPoint.setAttribute('type', 'text');
      HitPoint.setAttribute('maxlength', '4');
      HitPoint.setAttribute('size', '4');
      HitPoint.setAttribute('id', 'HPInput');
      HitPoint.appendChild(HitPointInput);

    characterList.appendChild(HitPoint);
    //characterItem.appendChild(document.getElementById('HitPoint'));
  });
});

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