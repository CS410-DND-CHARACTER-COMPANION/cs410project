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
    FormToChangeAtt.setAttribute("id", "FormToChangeAtt")
    //width and margin is not setting it to be centered. 
    // for (Attribute in ReturnData){
    //   if (Attribute != "_id" && Attribute != "__v"){
    //     FormToChangeAtt.innerHTML = FormToChangeAtt.innerHTML +
    //     <tr>
    //     <th>${Attribute}:
    //     <input id="${Attribute}" placeholder="${ReturnData[Attribute]}"/></th>
    //     </tr>
    //       ;
    //     }
    //   }
    
    FormToChangeAtt.innerHTML =
     `
      <tr>
        <th style="width: 10px;">${"name:"}
        <input id="name" placeholder="${ReturnData["name"]}"/></th>
        
      </tr>
      <tr>
        <th>${"species"}:
        <input id="species" placeholder="${ReturnData["species"]}"/></th>
      </tr>
      <tr>
        <th>${"class"}:
        <input id="class" placeholder="${ReturnData["class"]}"/></th>
      </tr>
      <tr>
        <th>${"level"}:
        <input id="level" placeholder="${ReturnData["level"]}"/></th>
      </tr>
      <tr>
        <th>${"background"}:
        <input id="background" placeholder="${ReturnData["background"]}"/></th>
      </tr>
      <tr>
        <th>${"subclass"}:
        <input id="subclass" placeholder="${ReturnData["subclass"]}"/></th>
      </tr>
      <tr>
        <th>${"xp"}:
        <input id="xp" placeholder="${ReturnData["xp"]}"/></th>
      </tr>
      <tr>
        <th>${"strength"}:
        <input id="strength" placeholder="${ReturnData["strength"]}"/></th>
      </tr>
      <tr>
        <th>${"dexterity"}:
        <input id="dexterity" placeholder="${ReturnData["dexterity"]}"/></th>
      </tr>
      <tr>
        <th>${"constitution"}:
        <input id="constitution" placeholder="${ReturnData["constitution"]}"/></th>
      </tr>
      <tr>
        <th>${"intelligence"}:
        <input id="intelligence" placeholder="${ReturnData["intelligence"]}"/></th>
      </tr>
      <tr>
        <th>${"wisdom"}:
        <input id="wisdom" placeholder="${ReturnData["wisdom"]}"/></th>
      </tr>
      <tr>
        <th>${"charisma"}:
        <input id="charisma" placeholder="${ReturnData["charisma"]}"/></th>
      </tr>
      <tr>
        <th>${"armor class"}:
        <input id="ac" placeholder="${ReturnData["ac"]}"/></th>
      </tr>
      <tr>
        <th>${"current health"}:
        <input id="currentHp" placeholder="${ReturnData["currentHp"]}"/></th>
      </tr>
      <tr>
        <th>${"initiative"}:
        <input id="initiative" placeholder="${ReturnData["initiative"]}"/></th>
      </tr>
      <tr>
        <th>${"has shield"}:
        <input id="hasShield" placeholder="${ReturnData["hasShield"]}"/></th>
      </tr>
      <tr>
        <th>${"inventory"}:
        <input id="inventory" placeholder="${ReturnData["inventory"]}"/></th>
      </tr>
      `;
      
      // ReturnData["strengthModifier"] = Math.floor((ReturnData["strength"]-10)/2);
      // ReturnData["dexterityModifier"] = Math.floor((ReturnData["dexterity"]-10)/2);
      // ReturnData["constitutionModifier"] = Math.floor((ReturnData["constitution"]-10)/2);
      // ReturnData["intelligenceModifier"] = Math.floor((ReturnData["intelligence"]-10)/2);
      // ReturnData["wisdomModifier"] = Math.floor((ReturnData["wisdom"]-10)/2);
      // ReturnData["charismaModifier"] = Math.floor((ReturnData["charisma"]-10)/2);
    
    //setting the edit form to center? not working
    
    const ApplyChangeButton = document.createElement('button');
    ApplyChangeButton.innerHTML = "Apply Changes";
    ApplyChangeButton.setAttribute("id", CharID);
    ApplyChangeButton.onclick = 
    function()
    {
      const ExistingFormChildren = document.getElementById("FormToChangeAtt").children
      // console.log(ExistingFormChildren)
      // console.log(ExistingFormChildren.length)
      // console.log(ExistingFormChildren.item(0))
      // console.log(ExistingFormChildren.item(1))
      const newCharData = {_id: ApplyChangeButton.id}
      const InputElements = ExistingFormChildren.item(0).querySelectorAll("input")
      //console.log(InputElements)
      InputElements.forEach(
        function(Node, Index) {
          var InputValue
          if (Node.value == "")
          {
            InputValue = Node.placeholder
          }
          else
          {
            if (isNaN(Node.value) == false)
            {
              InputValue = Number(Node.value)
            } else (InputValue = Node.value )
          }
          newCharData[Node.id] = InputValue
        }
      );

      newCharData["strengthModifier"] = Math.floor((newCharData["strength"]-10)/2);
      newCharData["dexterityModifier"] = Math.floor((newCharData["dexterity"]-10)/2);
      newCharData["constitutionModifier"] = Math.floor((newCharData["constitution"]-10)/2);
      newCharData["intelligenceModifier"] = Math.floor((newCharData["intelligence"]-10)/2);
      newCharData["wisdomModifier"] = Math.floor((newCharData["wisdom"]-10)/2);
      newCharData["charismaModifier"] = Math.floor((newCharData["charisma"]-10)/2);
      //console.log(ExistingFormChildren.getElementById("FormToChangeAtt"))
      //const newCharData = {_id: ApplyChangeButton.id}
      // for (var i = 0; i < ExistingFormChildren.length; i++)
      // {
      //   if (ExistingFormChildren[i].tagName == "INPUT")
      //   {
      //     var InputValue
      //     if (ExistingFormChildren[i].value == "")
      //     {
      //       // console.log(isNaN(ReturnData[Attribute])) // False means its an int

      //       if (isNaN(ExistingFormChildren[i].placeholder) == false)
      //       {
      //         InputValue = Number(ExistingFormChildren[i].placeholder)
      //       } else {InputValue = ExistingFormChildren[i].placeholder}
      //     }
      //     else
      //     { 
      //       if (isNaN(ExistingFormChildren[i].value) == false)
      //       {
      //         InputValue = Number(ExistingFormChildren[i].value)
      //       } else (InputValue = ExistingFormChildren[i].value )
      //     }
      //     newCharData[ExistingFormChildren[i].id] = InputValue
      //   }
      // }
        
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
        <th> ${character.currentHp} / ${character.maxHP} </th>
      </tr>
      <tr class="blank_column" style="width:10%" style="height:10%">
          <th rowspan="3" style="width:10%" style="height:10%">Attributes</th>
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
        <td onclick=>${character.strength} (${character.strengthModifier})</td>
        <td>${character.dexterity} (${character.dexterityModifier})</td>
        <td>${character.constitution} (${character.constitutionModifier})</td>
        <td>${character.intelligence} (${character.intelligenceModifier})</td>
        <td>${character.wisdom} (${character.wisdomModifier})</td>
        <td>${character.charisma} (${character.charismaModifier})</td>
      </tr>
      <tr class="blank_column" style="width:10%" style="height:10%">
        <th rowspan="3" style="width:10%" style="height:10%"></th>
      </tr>
      <tr>
        <th>Init</th>
        <th>Speed</th>
        <th>Size</th>
        <th>PP</th>
      </tr>
      <tr>
        <td onclick=>${character.initiative}</td>
        <td>${character.speed}</td>
        <td> [Size] </td>
        <td> [PP] </td>
      </tr>
      `;
      // <tr class="blank_column" style="width:10%" style="height:10%">
      //     <th rowspan="2" style="width:10%" style="height:10%">Attributes Modifier</th>
      // </tr>
      // <tr>
      //   <td onclick=>${character.strengthModifier}</td>
      //   <td>${character.dexterityModifier}</td>
      //   <td>${character.constitutionModifier}</td>
      //   <td>${character.intelligenceModifier}</td>
      //   <td>${character.wisdomModifier}</td>
      //   <td>${character.charismaModifier}</td>
      // </tr>
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