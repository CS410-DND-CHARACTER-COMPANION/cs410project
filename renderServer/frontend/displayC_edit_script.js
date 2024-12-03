const socket = io();
let currentCharacter = null;
let isEditMode = false;

window.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    const toggleEditBtn = document.getElementById("toggleEditMode");
    const saveChangesBtn = document.getElementById("saveChanges");

    if (username) {
        console.log("Requesting character for username:", username);
        socket.emit("getCharacter", username);
    } else {
        console.error("No username provided");
    }

    // Listen for character data from server
    socket.on("characterData", (character) => {
        currentCharacter = character;
        populateCharacterFields(character);
    });

    // Toggle Edit Mode
    toggleEditBtn.addEventListener("click", () => {
        isEditMode = !isEditMode;
        toggleEditModeUI();
    });

    // Save Changes
    saveChangesBtn.addEventListener("click", saveCharacterChanges);

    // Function to populate character fields
    function populateCharacterFields(character) {
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

        // Stats
        document.getElementById("strength").value = character.strength || "";
        document.getElementById("dexterity").value = character.dexterity || "";
        document.getElementById("constitution").value =
            character.constitution || "";
        document.getElementById("intelligence").value =
            character.intelligence || "";
        document.getElementById("wisdom").value = character.wisdom || "";
        document.getElementById("charisma").value = character.charisma || "";
    }

    // Toggle UI for edit mode
    function toggleEditModeUI() {
        const formElements = document.querySelectorAll("input");
        formElements.forEach((element) => {
            element.readOnly = !isEditMode;
            if (isEditMode) {
                element.classList.add("editable-input");
            } else {
                element.classList.remove("editable-input");
            }
        });

        const saveChangesBtn = document.getElementById("saveChanges");
        saveChangesBtn.style.display = isEditMode ? "block" : "none";
        document.getElementById("toggleEditMode").textContent = isEditMode
            ? "Cancel Edit"
            : "Edit Character";
    }

    // Save character changes
    function saveCharacterChanges() {
        const updatedCharacter = {
            name: document.getElementById("charName").value,
            background: document.getElementById("background").value,
            class: document.getElementById("charClass").value,
            species: document.getElementById("species").value,
            subclass: document.getElementById("subclass").value,
            level: parseInt(document.getElementById("level").value),
            xp: parseInt(document.getElementById("xp").value),
            ac: parseInt(document.getElementById("armorClass").value),
            hasShield: document.getElementById("shield").checked,
            currentHp: parseInt(document.getElementById("currhp").value),
            maxHp: parseInt(document.getElementById("maxhp").value),
            strength: parseInt(document.getElementById("strength").value),
            dexterity: parseInt(document.getElementById("dexterity").value),
            constitution: parseInt(document.getElementById("constitution").value),
            intelligence: parseInt(document.getElementById("intelligence").value),
            wisdom: parseInt(document.getElementById("wisdom").value),
            charisma: parseInt(document.getElementById("charisma").value),
        };

        socket.emit("updateCharacter", {
            characterId: currentCharacter._id,
            ...updatedCharacter,
        });
        alert("Character updated successfully!");
        toggleEditModeUI(); // Exit edit mode after saving
    }

    // Handle errors
    socket.on("error", (errorMessage) => {
        console.error("Error:", errorMessage);
        alert("Error loading character: " + errorMessage);
    });
});
