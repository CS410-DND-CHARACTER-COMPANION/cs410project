window.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const characterId = params.get('id');

    // Check local storage first
    const localCharacterData = localStorage.getItem('characterData');
    if (localCharacterData) {
        const character = JSON.parse(localCharacterData);
        displayCharacter(character);
    } else if (characterId) {
        // If no local data, fetch from the server
        fetch(`/api/characters/${characterId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Character not found');
                }
                return response.json();
            })
            .then(character => {
                displayCharacter(character);
            })
            .catch(error => {
                console.error('Error fetching character:', error);
                document.getElementById('character-details').innerText = 'Error loading character details.';
            });
    } else {
        document.getElementById('character-details').innerText = 'No character ID provided.';
    }
});

function displayCharacter(character) {
    const detailsDiv = document.getElementById('character-details');
    detailsDiv.innerHTML = `
        <h2>${character.charName}</h2>
        <p>Species: ${character.species}</p>
        <p>Class: ${character.charClass}</p>
        <p>Subclass: ${character.subclass}</p>
        <p>Level: ${character.level}</p>
        <p>Armor Class: ${character.armorClass}</p>
        <p>Current HP: ${character.currhp} / Max HP: ${character.maxhp}</p>
        <p>Background: ${character.background}</p>
        <p>Shield: ${character.shield ? 'Yes' : 'No'}</p>
        <!-- Add other fields as needed -->
    `;
}

function saveChar(event) {
    event.preventDefault(); // Prevent the default form submission

    const characterData = {
        charName: document.getElementById('charName').value,
        background: document.getElementById('background').value,
        charClass: document.getElementById('charClass').value,
        species: document.getElementById('species').value,
        subclass: document.getElementById('subclass').value,
        level: document.getElementById('level').value,
        armorClass: document.getElementById('armorClass').value,
        shield: document.getElementById('shield').checked, // Use checked for boolean
        temphp: document.getElementById('temphp').value,
        maxhp: document.getElementById('maxhp').value,
        currhp: document.getElementById('currhp').value,
        // Add other fields as needed
    };

    // Save character data to local storage
    localStorage.setItem('characterData', JSON.stringify(characterData));

    // Send character data to the server
    fetch('/api/characters/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Redirect to displayCharacter.html with the character ID
        window.location.href = `displayCharacter.html?id=${data._id}`;
    })
    .catch(error => {
        console.error('Error saving character:', error);
        alert('Failed to save character. Please try again.');
    });
}
