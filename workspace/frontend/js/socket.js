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

// socket.on('ReturnCharByID', () => {
//   console.log("Returned");
//   //console.log(charData);
// });

async function EditAttributeMenu(CharID) // Once clicked:
{
  // alert(typeof(CharID)); // String
  // Get Data
  socket.emit('getCharacterByID', CharID, (ReturnData) => {
    //console.log(ReturnData); // Got the data now
    
    const ExistingForm = document.getElementById("FormToChangeAtt")
    if (ExistingForm)
    {
      ExistingForm.remove()
    }
    //changed testing
    const FormToChangeAtt = document.createElement("table")
    
    FormToChangeAtt.innerHTML =
     `
      <tr>
        <th style="border: solid">${ReturnData[name]}
        <input id="${ReturnData[name]}" placeholder="${ReturnData[name]}"/></th>
      </tr>
      <tr>
        <th>${ReturnData[species]}:
        <input id="${ReturnData[species]}" placeholder="${ReturnData[species]}"/></th>
      </tr>
      `
      ;

    const ApplyChangeButton = document.createElement('button');
    ApplyChangeButton.innerHTML = "Apply Changes";
    ApplyChangeButton.setAttribute("id", CharID);
    ApplyChangeButton.onclick = 
    function()
    {
      const ExistingFormChildren = document.getElementById("FormToChangeAtt").children
      //console.log(ExistingFormChildren)
      //console.log(ExistingFormChildren.length)
      const newCharData = {_id: ApplyChangeButton.id}
      for (var i = 0; i < ExistingFormChildren.length; i++)
      {
        if (ExistingFormChildren[i].tagName == "INPUT")
        {
          var InputValue
          if (ExistingFormChildren[i].value == "")
          {
            // console.log(isNaN(ReturnData[Attribute])) // False means its an int

            if (isNaN(ExistingFormChildren[i].placeholder) == false)
            {
              InputValue = Number(ExistingFormChildren[i].placeholder)
            } else {InputValue = ExistingFormChildren[i].placeholder}
          }
          else
          { 
            if (isNaN(ExistingFormChildren[i].value) == false)
            {
              InputValue = Number(ExistingFormChildren[i].value)
            } else (InputValue = ExistingFormChildren[i].value )
          }
          newCharData[ExistingFormChildren[i].id] = InputValue
        }
      }
      
      // Update
      socket.emit('updateCharacter', newCharData)
      alert("Attributes Changed!");
      location.reload();
    };
    FormToChangeAtt.appendChild(ApplyChangeButton)
    document.body.appendChild(FormToChangeAtt)
  });

}

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
      characterItem.innerHTML = //character hp gradient failed after someone changed it
      `
      <tr>
        <th style="border: solid">${character.name}</th>
      </tr>
      
      <tr>
        <th>${character.species}</th>
        <th>${character.class}</th>
        <td
          onclick="addEquipmentItem()"
          style="background: linear-gradient(to right, rgba(0, 255, 0, 0.5) ${character.currentHP / character.maxHP * 100}%, rgba(255, 0, 0, 0.5) ${character.currentHP / character.maxHP * 100}%);">
          [${character.currentHP} / ${character.maxHP}]
        </td>
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
        <td onclick=>${character.strength}</td>
        <td>${character.dexterity}</td>
        <td>${character.constitution}</td>
        <td>${character.intelligence}</td>
        <td>${character.wisdom}</td>
        <td>${character.charisma}</td>
      </tr>
      `;
      const EditButton = document.createElement('button');
      EditButton.innerHTML = "Edit";
      EditButton.setAttribute("id", character._id);
      EditButton.onclick = 
      function()
      {
        EditAttributeMenu(EditButton.id);
      };
      // EditButton.setAttribute("onclick", "EditAttributeMenu(hey)")
      characterItem.appendChild(EditButton)

      characterList.appendChild(characterItem);
      // <button id=character._id onclick="EditAttributeMenu()">Edit</button>
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