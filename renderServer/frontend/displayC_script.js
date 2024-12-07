const socket = io();

// Function to calculate ability modifier
function calculateModifier(score) {
    return Math.floor((score - 10) / 2);
}

window.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");
    const editModeToggle = document.getElementById("edit-mode-toggle");
    const saveCharacterButton = document.getElementById("save-character");
    let currentCharacter = null;

    // Ability score elements for modifier calculation
    const abilityScores = [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
    ];

    // Function to update modifiers
    function updateModifiers() {
        abilityScores.forEach((ability) => {
            const scoreInput = document.getElementById(ability);
            const modifierInput = document.getElementById(`${ability}-modifier`);

            const score = parseInt(scoreInput.value) || 10;
            const modifier = calculateModifier(score);

            modifierInput.value = modifier;

            // Update passive perception when wisdom changes
            if (ability === 'wisdom') {
                updatePassivePerception();
            }
        });
    }

    // Toggle edit mode
    editModeToggle.addEventListener("click", function () {
        const inputs = document.querySelectorAll(
            "#characterForm input:not([type='checkbox']):not([type='button'])"
        );
        const isReadOnly = inputs[0].readOnly;

        inputs.forEach((input) => {
            input.readOnly = !isReadOnly;
        });

        document.body.classList.toggle("edit-mode");

        if (isReadOnly) {
            editModeToggle.textContent = "Disable Edit Mode";
            saveCharacterButton.style.display = "inline-block";
            updateModifiers(); // Update modifiers when entering edit mode
        } else {
            editModeToggle.textContent = "Enable Edit Mode";
            saveCharacterButton.style.display = "none";
        }
    });

    // Save character functionality
    saveCharacterButton.addEventListener("click", function () {
        // Collect all form data
        const formData = {
            name: document.getElementById("charName").value,
            background: document.getElementById("background").value,
            class: document.getElementById("charClass").value,
            species: document.getElementById("species").value,
            subclass: document.getElementById("subclass").value,
            level: document.getElementById("level").value,
            xp: document.getElementById("xp").value,
            ac: document.getElementById("armorClass").value,
            hasShield: document.getElementById("shield").checked,
            currentHp: document.getElementById("currhp").value,
            maxHp: document.getElementById("maxhp").value,
            strength: document.getElementById("strength").value,
            dexterity: document.getElementById("dexterity").value,
            constitution: document.getElementById("constitution").value,
            intelligence: document.getElementById("intelligence").value,
            wisdom: document.getElementById("wisdom").value,
            charisma: document.getElementById("charisma").value,
            size: document.getElementById("size").value,
            passivePerception: document.getElementById("passive-perception").value,
        };

        // Emit save event to server
        socket.emit("updateCharacter", { username, characterData: formData });
    });

    if (username) {
        // Log the username being requested
        console.log("Requesting character for username:", username);
        // Request character data from server using username
        socket.emit("getCharacter", username);
    } else {
        console.error("No username provided");
    }

    // Listen for character data from server
    socket.on("characterData", (character) => {
        currentCharacter = character;

        // Populate form fields with character data
        document.getElementById("charName").value = character.name || "";
        document.getElementById("background").value = character.background || "";
        document.getElementById("charClass").value = character.class || "";
        document.getElementById("species").value = character.species || "";
        document.getElementById("subclass").value = character.subclass || "";
        document.getElementById("level").value = character.level || "";
        document.getElementById("xp").value = character.xp || "";
        document.getElementById("armorClass").value = character.ac || "";
        document.getElementById("shield").checked = character.hasShield || false;
        document.getElementById("currhp").value = character.currentHp || "";
        document.getElementById("maxhp").value = character.maxHp || "";
        document.getElementById("size").value = character.size || "";
        document.getElementById("passive-perception").value = character.passivePerception || 10;

        // Ability Scores
        abilityScores.forEach((ability) => {
            const scoreInput = document.getElementById(ability);
            const modifierInput = document.getElementById(`${ability}-modifier`);

            const score = character[ability] || 10;
            scoreInput.value = score;
            modifierInput.value = calculateModifier(score);
        });

        // Update passive perception when wisdom changes
        const wisdomScore = parseInt(document.getElementById("wisdom").value) || 10;
        const wisdomMod = calculateModifier(wisdomScore);
        document.getElementById("passive-perception").value = 10 + wisdomMod;
    });

    // Handle character update response
    socket.on("characterUpdateResponse", (response) => {
        if (response.success) {
            alert("Character updated successfully!");
            // Optionally disable edit mode
            editModeToggle.click();
        } else {
            alert("Failed to update character: " + response.message);
        }
    });

    // Handle errors
    socket.on("error", (errorMessage) => {
        console.error("Error:", errorMessage);
        alert("Error loading character: " + errorMessage);
    });

    // Add a function to update passive perception when wisdom changes
    function updatePassivePerception() {
        const wisdomScore = parseInt(document.getElementById("wisdom").value) || 10;
        const wisdomMod = calculateModifier(wisdomScore);
        document.getElementById("passive-perception").value = 10 + wisdomMod;
    }
});

// Add a home button to the page
const homeButton = document.createElement("a");
homeButton.href = "index.html";
homeButton.className = "home-button";
homeButton.textContent = "Back to Home";
document.querySelector(".container").appendChild(homeButton);
