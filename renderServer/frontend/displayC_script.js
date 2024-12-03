const socket = io();

window.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (username) {
        console.log("Requesting character for username:", username);
        socket.emit("getCharacter", username);
    } else {
        console.error("No username provided");
    }

    // Listen for character data from server
    socket.on("characterData", (character) => {
        // Populate all form fields with character data
        const formFields = [
            "charName",
            "background",
            "charClass",
            "species",
            "subclass",
            "level",
            "xp",
            "armorClass",
            "currhp",
            "maxhp",
            "strength",
            "dexterity",
            "constitution",
            "intelligence",
            "wisdom",
            "charisma",
            "initiative",
            "speed",
        ];

        formFields.forEach((field) => {
            const element = document.getElementById(field);
            if (element) {
                element.value = character[field] || "";
            }
        });

        // Handle shield checkbox
        const shieldCheckbox = document.getElementById("shield");
        if (shieldCheckbox) {
            shieldCheckbox.checked = character.hasShield || false;
        }

        // Calculate and set ability modifiers
        const abilities = [
            "strength",
            "dexterity",
            "constitution",
            "intelligence",
            "wisdom",
            "charisma",
        ];
        abilities.forEach((ability) => {
            const modifierElement = document.getElementById(`${ability}-modifier`);
            if (modifierElement) {
                const score = character[ability] || 10;
                const modifier = Math.floor((score - 10) / 2);
                modifierElement.value = modifier;
            }
        });

        // Enable editing
        const formElements = document.querySelectorAll("input, select");
        formElements.forEach((element) => {
            element.readOnly = false;
            if (element.tagName === "SELECT") {
                element.disabled = false;
            }
        });
    });

    // Handle form submission to update character
    const form = document.getElementById("characterForm");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Collect form data
        const formData = new FormData(form);
        const characterData = {};

        for (const [key, value] of formData.entries()) {
            // Convert numeric values
            characterData[key] =
                !isNaN(value) && value !== "" ? Number(value) : value;
        }

        // Special handling for checkbox
        characterData.hasShield = document.getElementById("shield").checked;

        // Emit update event
        socket.emit("updateCharacter", {
            username: username,
            updates: characterData,
        });

        // Show success message
        alert("Character updated successfully!");
    });

    // Handle update confirmation
    socket.on("characterUpdated", (updatedCharacter) => {
        console.log("Character updated:", updatedCharacter);
    });
});

// Add a home button to the page
const homeButton = document.createElement("a");
homeButton.href = "index.html";
homeButton.className = "home-button";
homeButton.textContent = "Back to Home";
document.querySelector(".container").appendChild(homeButton);
