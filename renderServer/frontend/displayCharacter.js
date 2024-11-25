const socket = io();

window.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    if (username) {
        // Request character data from server using username
        socket.emit('getCharacter', username);
    } else {
        console.error('No username provided');
    }

    // Listen for character data from server
    socket.on('characterData', (character) => {
        // Populate form fields with character data
        document.getElementById('charName').value = character.name || '';
        document.getElementById('background').value = character.background || '';
        document.getElementById('charClass').value = character.class || '';
        document.getElementById('species').value = character.species || '';
        document.getElementById('subclass').value = character.subclass || '';
        document.getElementById('level').value = character.level || '';
        document.getElementById('xp').value = character.xp || '';
        document.getElementById('armorClass').value = character.ac || '';
        document.getElementById('shield').checked = character.hasShield || false;
        document.getElementById('currhp').value = character.currentHp || '';
        document.getElementById('maxhp').value = character.maxHp || '';
        
        // Stats
        document.getElementById('strength').value = character.strength || '';
        document.getElementById('dexterity').value = character.dexterity || '';
        document.getElementById('constitution').value = character.constitution || '';
        document.getElementById('intelligence').value = character.intelligence || '';
        document.getElementById('wisdom').value = character.wisdom || '';
        document.getElementById('charisma').value = character.charisma || '';

        // Make all form fields readonly since this is display mode
        const formElements = document.querySelectorAll('input, select');
        formElements.forEach(element => {
            element.readOnly = true;
            if (element.tagName === 'SELECT') {
                element.disabled = true;
            }
        });

        // Hide the submit button since we're in display mode
        const submitButton = document.getElementById('char-submit');
        if (submitButton) {
            submitButton.style.display = 'none';
        }
    });

    // Handle errors
    socket.on('error', (errorMessage) => {
        console.error('Error:', errorMessage);
        alert('Error loading character: ' + errorMessage);
    });
});

// Add a home button to the page
const homeButton = document.createElement('a');
homeButton.href = 'index.html';
homeButton.className = 'home-button';
homeButton.textContent = 'Back to Home';
document.querySelector('.container').appendChild(homeButton);
