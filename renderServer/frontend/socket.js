/*
Connects to the socket.io server and handles the events for the character sheet.
*/

// Initialize socket connection
const socket = io();

// Global array for inventory (if needed later)
let inventory = [];

// Request all characters when the page loads
socket.emit("getAllCharacters");

async function EditAttributeMenu(CharID) // Once clicked:
{
  // alert(typeof(CharID)); // String
  // Get Data
  socket.emit('getCharacterByID', CharID, (ReturnData) => {
    if (!ReturnData || ReturnData.error) {
      console.error("Error getting character data:", ReturnData?.error);
      return;
    }

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
    //     if (Attribute != "_id" && Attribute != "__v" && Attribute != "strengthModifier"
    //       && Attribute != "dexterityModifier" && Attribute != "constitutionModifier" 
    //       && Attribute != "intelligenceModifier" && Attribute != "wisdomModifier"
    //       && Attribute != "charismaModifier" && Attribute != "username"){
    //       FormToChangeAtt.innerHTML = FormToChangeAtt.innerHTML +
    //       `
    //       <tr>
    //       <th>${Attribute}:
    //       <input id=${Attribute} placeholder="${ReturnData[Attribute]}"/></th>
    //       </tr>
    //       `;
    //     }
    //   }
    
    FormToChangeAtt.innerHTML =
     `
      <tr>
        <th>${"name"}:
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
      socket.emit('updateCharacterDMOverview', newCharData)
      alert("Attributes Changed!");
      location.reload();
    };
    FormToChangeAtt.appendChild(ApplyChangeButton)
    document.body.appendChild(FormToChangeAtt)
  });

}

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
          <th style="border: solid">${character.name}</th>
        </tr>
        
        <tr>
          <th>${character.species}</th>
          <th>${character.class}</th>
          <th> ${character.currentHp}</th>
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
        <th rowspan="3" style="width:10%" style="height:10%">Other Stats</th>
        </tr>
        <tr>
          <th>Init</th>
          <th>Speed</th>
          <th>Size</th>
          <th>PP</th>
        </tr>
        <tr>
          <th>${character.initiative}</th>
          <th>${character.speed}</th>
          <th>Size</th>
          <th>PP</th>
        </tr>
      `
      ;
  
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

// Function to update the character list in the DOM
function updateCharacterList(characters) {
    const characterList = document.getElementById("characterList");
    if (!characterList) return; // Exit if element not found

    characterList.innerHTML = ""; // Clear existing list

    characters.forEach((character) => {
        const characterItem = document.createElement("li");
        characterItem.innerHTML = `
            <strong>${character.name}</strong> - Level ${character.level} ${character.species} ${character.class}
            <div>HP: ${character.currentHp}/${character.maxHp} | AC: ${character.ac} | 
            ${character.hasShield ? "🛡️ Shield" : ""}</div>
        `;
        characterList.appendChild(characterItem);
    });
}

// Listen for updates when new character is added
socket.on("characterAdded", function (character) {
    console.log("New character added:", character);
    // Refresh the character list
    socket.emit("getAllCharacters");
});

// Listen for updates when a character is updated
socket.on("characterUpdated", function (character) {
    console.log("Character updated:", character);
    // Refresh the character list
    socket.emit("getAllCharacters");
});

// Listen for character update responses
socket.on("characterUpdateResponse", function(response) {
    if (response.success) {
        console.log("Character updated successfully:", response.character);
        // Refresh the character list
        socket.emit("getAllCharacters");
    } else {
        console.error("Failed to update character:", response.message);
    }
});

// Handle any errors
socket.on("error", (error) => {
    console.error("Socket error:", error);
});

// Export functions if needed in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCharacterList,
        // Add other functions as needed
    };
}
