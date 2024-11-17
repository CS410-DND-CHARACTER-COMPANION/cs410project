const socket = io();
const characterId = new URLSearchParams(window.location.search).get('characterId');

if (characterId) {
    fetch(`/api/character/${characterId}`)
        .then((response) => response.json())
        .then((character) => {
            document.getElementById('character-display').innerHTML = `
                <h1>${character.name}</h1>
                <p>Background: ${character.background}</p>
                <p>Species: ${character.species}</p>
                <p>Class: ${character.class}</p>
                <p>Level: ${character.level}</p>
                <p>HP: ${character.combatDetails.currentHp}/${character.combatDetails.maxHp}</p>
                <!-- Add more fields as necessary -->
            `;
        })
        .catch((error) => console.error('Error fetching character:', error));
}

// Listen for updates
socket.on('characterUpdated', (updatedCharacter) => {
    if (updatedCharacter._id === characterId) {
        alert('Character updated in real-time!');
        location.reload(); // Reload page to reflect changes
    }
});
