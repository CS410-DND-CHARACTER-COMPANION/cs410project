// Version 6.1.0
class CharacterState {
  // Manages character state with a pub/sub pattern for real-time updates
  constructor() {
    this.listeners = new Set();
    this.state = {
      // Initial state for a D&D character with default values
      name: "",
      background: "",
      species: "",
      class: "",
      subclass: "",
      level: 1,
      xp: 0,
      userId: null,
      characterId: null,
      equipment: [],
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      ac: 10,
      currentHp: 0,
      maxHp: 0,
      initiative: 0,
      speed: 30,
      hasShield: false,
      size: "",
      passivePerception: 10,
    };
  }

  // Allows components to listen for state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Updates state and notifies all subscribers
  update(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  // Broadcasts state changes to all registered listeners
  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Retrieves the current character state snapshot
  getState() {
    return this.state;
  }
}

// Creates a new CharacterState instance
const characterState = new CharacterState();

// Socket connection with error handling and reconnection logic
class SocketManager {
  constructor() {
    this.socket = io({
      // Configures socket to automatically attempt reconnection
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    this.setupSocketListeners();
  }

  // Sets up socket listeners for connection events and incoming data
  setupSocketListeners() {
    // Handles various socket connection events
    this.socket.on("connect", () => {
      // Establishes user session on successful connection
      console.log("Connected to server");
      this.socket.emit("joinCharacterSession", { userId: this.getUserId() });
    });

    // Handles connection errors
    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      showError("Connection failed. Retrying...");
    });

    // Handles reconnection failure
    this.socket.on("reconnect_failed", () => {
      console.error("Failed to reconnect");
      showError("Connection lost. Please refresh the page.");
    });

    // Handles incoming character data updates
    this.socket.on("characterData", (data) => {
      // If data is valid, updates the character state and form fields
      if (data && this.validateData(data)) {
        characterState.update(data);
        updateFormFields(data);
      }
    });

    // Processes partial character updates
    this.socket.on("characterUpdate", (updates) => {
      if (this.validateData(updates)) {
        characterState.update(updates);
        updateFormFields(updates);
      }
    });
  }

  // Validate incoming data against schema
  validateData(data) {
    const schema = {
      // Defines validation rules for character attributes
      name: (value) => typeof value === "string",
      level: (value) => {
        // Convert string value to number if needed
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        return !isNaN(numValue) && numValue >= 1 && numValue <= 20;
      },
      xp: (value) => Number.isInteger(value) && value >= 0,
      equipment: (value) => Array.isArray(value),
      strength: (value) => {
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        return !isNaN(numValue) && numValue >= 1 && numValue <= 30;
      },
      dexterity: (value) => {
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        return !isNaN(numValue) && numValue >= 1 && numValue <= 30;
      },
      constitution: (value) =>
        Number.isInteger(value) && value >= 1 && value <= 30,
      intelligence: (value) =>
        Number.isInteger(value) && value >= 1 && value <= 30,
      wisdom: (value) => Number.isInteger(value) && value >= 1 && value <= 30,
      charisma: (value) => Number.isInteger(value) && value >= 1 && value <= 30,
      size: (value) => ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"].includes(value),
      passivePerception: (value) => Number.isInteger(value) && value >= 0,
    };

    // Checks each incoming data point against its respective validation rule
    return Object.entries(data).every(([key, value]) => {
      return !schema[key] || schema[key](value);
    });
  }

  // Emits events only when socket is connected
  emit(event, data) {
    if (this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      showError("Cannot send updates: No connection");
    }
  }

  // Retrieves the current socket's unique user identifier
  getUserId() {
    return this.socket.id;
  }
}

// Creates a new SocketManager instance
const socketManager = new SocketManager();

// Utility function to prevent rapid successive function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Displays error messages with a temporary toast notification
function showError(message) {
  // Creates a dismissable error toast with consistent styling
  const errorContainer = document.createElement("div");
  errorContainer.className = "error-toast";
  errorContainer.textContent = message;
  errorContainer.style.backgroundColor = "rgba(231, 76, 60, 0.9)";
  errorContainer.style.color = "white";
  errorContainer.style.padding = "10px 20px";
  errorContainer.style.borderRadius = "4px";
  errorContainer.style.position = "fixed";
  errorContainer.style.top = "20px";
  errorContainer.style.right = "20px";
  errorContainer.style.zIndex = "1000";
  document.body.appendChild(errorContainer);
  setTimeout(() => errorContainer.remove(), 5000);
}

// Success message utility
function showSuccess(message) {
  const successContainer = document.createElement("div");
  successContainer.className = "success-toast";
  successContainer.textContent = message;
  successContainer.style.backgroundColor = "rgba(46, 204, 113, 0.9)";
  successContainer.style.color = "white";
  successContainer.style.padding = "10px 20px";
  successContainer.style.borderRadius = "4px";
  successContainer.style.position = "fixed";
  successContainer.style.top = "20px";
  successContainer.style.right = "20px";
  successContainer.style.zIndex = "1000";
  document.body.appendChild(successContainer);
  setTimeout(() => successContainer.remove(), 3000);
}

// Form field update with error boundary
function updateFormFields(data) {
  try {
    Object.entries(data).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = Boolean(value);
        } else {
          element.value = value;
        }
      }
    });

    updateProficiencyBonus();
    updateAbilityModifiers();
  } catch (error) {
    console.error("Error updating form fields:", error);
    showError("Failed to update some fields");
  }
}

// Debounced character update
const debouncedUpdate = debounce((updates) => {
  // Emits an updateCharacter event to the server
  socketManager.emit("updateCharacter", {
    userId: socketManager.getUserId(),
    characterId: characterState.getState().characterId,
    updates,
  });
}, 300);

// Handles adding a new equipment item
function addEquipmentItem() {
  try {
    const itemInput = document.getElementById("equipment-item");
    const newItem = itemInput.value.trim();

    if (!newItem) {
      showError("Equipment item cannot be empty");
      return;
    }

    const currentEquipment = characterState.getState().equipment;
    const updatedEquipment = [...currentEquipment, newItem];
    characterState.update({ equipment: updatedEquipment });
    debouncedUpdate({ equipment: updatedEquipment });
    updateEquipmentDisplay();
    itemInput.value = "";
  } catch (error) {
    console.error("Error adding equipment:", error);
    showError("Failed to add equipment item");
  }
}

// Updates the equipment display
function updateEquipmentDisplay() {
  try {
    const equipmentDiv = document.getElementById("equipment");
    const equipment = characterState.getState().equipment;
    // Generate HTML for each equipment item
    equipmentDiv.innerHTML = equipment
      .map(
        (item, index) => `
            <div class="equipment-item">
                ${escapeHtml(item)} <!-- Escape HTML to prevent XSS -->
                <button class="delete-item-btn" onclick="removeEquipmentItem(${index})">Remove</button>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error updating equipment display:", error);
    showError("Failed to update equipment display");
  }
}

// Handles removing an equipment item
function removeEquipmentItem(index) {
  try {
    const currentEquipment = characterState.getState().equipment;
    const updatedEquipment = currentEquipment.filter((_, i) => i !== index);
    characterState.update({ equipment: updatedEquipment });
    debouncedUpdate({ equipment: updatedEquipment });
    updateEquipmentDisplay();
  } catch (error) {
    console.error("Error removing equipment:", error);
    showError("Failed to remove equipment item");
  }
}

// Calculates the ability modifier for a given ability
function calculateModifier(abilityType) {
  try {
    const abilityScore =
      parseInt(document.getElementById(abilityType).value) || 10;

    if (abilityScore < 1 || abilityScore > 30) {
      throw new Error("Invalid ability score");
    }

    const modifier = Math.floor((abilityScore - 10) / 2);
    document.getElementById(`${abilityType}-modifier`).value = modifier;
    debouncedUpdate({ [`${abilityType}Modifier`]: modifier });
  } catch (error) {
    console.error(`Error calculating ${abilityType} modifier:`, error);
    showError(`Failed to calculate ${abilityType} modifier`);
  }
}

// Updates the proficiency bonus based on the character's level
function updateProficiencyBonus() {
  try {
    const level = parseInt(document.getElementById("level").value) || 1;

    if (level < 1 || level > 20) {
      throw new Error("Invalid level");
    }

    const proficiencyBonus = Math.ceil(level / 4) + 1;
    document.getElementById("proficiency-bonus").value = proficiencyBonus;
    debouncedUpdate({ proficiencyBonus });
  } catch (error) {
    console.error("Error updating proficiency bonus:", error);
    showError("Failed to update proficiency bonus");
  }
}

// Updates all ability modifiers
function updateAbilityModifiers() {
  [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ].forEach((ability) => calculateModifier(ability));
}

// Escapes HTML to prevent XSS attacks
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Performs character form validation before submission
function validateForm() {
  // Checks required fields and ensures numeric fields are valid
  const requiredFields = ["username", "name", "species", "class", "level"];
  const errors = [];
  requiredFields.forEach((field) => {
    const element = document.getElementById(field);
    if (!element.value) {
      errors.push(
        `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      );
    }
  });

  // Additional validation for numeric fields to ensure positive values
  const numericFields = [
    "level",
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
    "current-hp",
    "max-hp",
    "ac",
    "initiative",
    "speed",
  ];
  numericFields.forEach((field) => {
    const element = document.getElementById(field);
    const value = parseInt(element.value);
    if (isNaN(value) || value < 1) {
      errors.push(
        `${field.charAt(0).toUpperCase() + field.slice(1).replace("-", " ")
        } must be a valid positive number`
      );
    }
  });

  // Displays consolidated error messages or allows form submission
  if (errors.length > 0) {
    showError(errors.join(", "));
    return false;
  }
  return true;
}

// Handles the character form submission
function handleFormSubmission(event) {
  event.preventDefault();
  if (!validateForm()) {
    return;
  }
  try {
    const form = document.getElementById("character-form");
    const formData = new FormData(form);
    const characterData = {};
    
    // Convert FormData to a plain object
    for (const [key, value] of formData.entries()) {
      // Special handling for HP fields
      if (key === 'current-hp') {
        const currentHp = parseInt(value);
        if (isNaN(currentHp)) {
          throw new Error('Current HP must be a valid number');
        }
        characterData.currentHp = currentHp;
      }
      else if (key === 'max-hp') {
        const maxHp = parseInt(value);
        if (isNaN(maxHp)) {
          throw new Error('Maximum HP must be a valid number');
        }
        characterData.maxHp = maxHp;
      }
      // Handle all other fields normally
      else {
        characterData[key] = value;
      }
    }

    // Add equipment array and other required fields
    characterData.equipment = characterState.getState().equipment || [];
    characterData.userId = socketManager.getUserId();
    characterData.characterId = characterState.getState().characterId;

    // Debug log
    console.log('Character data to be saved:', characterData);

    // Set up the characterSaved listener
    socketManager.socket.on('characterSaved', (response) => {
      if (response.success) {
        showSuccess('Character saved successfully!');
        const username = document.getElementById('username').value;
        window.location.href = `displayCharacter.html?username=${encodeURIComponent(username)}`;
      } else {
        showError(response.error || 'Failed to save character');
        if (response.error && response.error.includes('Username already exists')) {
          const usernameField = document.getElementById('username');
          usernameField.focus();
          usernameField.select();
        }
      }
    });

    // Emit the saveCharacter event with properly structured data
    socketManager.emit("saveCharacter", {
      userId: socketManager.getUserId(),
      characterId: characterState.getState().characterId,
      data: characterData,
    });
  } catch (error) {
    console.error("Error saving character:", error);
    showError("Failed to save character");
  }
}

// Sets up event listeners for all form inputs to enable real-time updates
function setupFormListeners() {
  try {
    const formElements = document.querySelectorAll("input, select");
    formElements.forEach((element) => {
      if (element.id) {
        element.addEventListener("change", (e) => {
          let value = element.type === "checkbox" ? element.checked : element.value;
          
          // Convert numeric inputs to numbers before validation
          if (element.type === "number") {
            value = value === "" ? "" : parseInt(value);
          }
          
          const update = { [element.id]: value };
          
          if (socketManager.validateData(update)) {
            characterState.update(update);
            debouncedUpdate(update);
          }
        });
      }
    });

    // Listener for wisdom score changes
    const wisdomInput = document.getElementById('wisdom');
    if (wisdomInput) {
      wisdomInput.addEventListener('change', () => {
        calculateModifier('wisdom');
        updatePassivePerception();
      });
    }
  } catch (error) {
    console.error('Error setting up form listeners:', error);
    showError('Failed to initialize form listeners');
  }
}

// Event listener for the "Save Character" button
function setupSaveButtonListener() {
  try {
    const saveButton = document.getElementById("save-character-btn");
    saveButton.addEventListener("click", handleFormSubmission);
  } catch (error) {
    console.error("Error setting up save button listener:", error);
    showError("Failed to initialize save button");
  }
}

// Initializes the character sheet on page load
window.onload = function () {
  try {
    const form = document.getElementById("character-form");
    form.setAttribute("novalidate", "");
    setupFormListeners();
    setupSaveButtonListener();
    console.log("Character sheet initialized");
  } catch (error) {
    console.error("Error initializing character sheet:", error);
    showError("Failed to initialize character sheet");
  }
};

// Initializes custom cursor with smooth tracking and interaction effects
document.addEventListener("DOMContentLoaded", () => {
  // Creates a custom cursor element with smooth movement and click animations
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  document.body.appendChild(cursor);
  // Variables for interpolated cursor movement
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const speed = 0.15;
  // Animates cursor with interpolated movement
  const updateCursor = () => {
    targetX = mouseX;
    targetY = mouseY;
    mouseX += (targetX - mouseX) * speed;
    mouseY += (targetY - mouseY) * speed;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
    requestAnimationFrame(updateCursor);
  };

  // Event listeners for cursor interaction
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Adds visual feedback for mouse clicks
  document.addEventListener("mousedown", () => {
    cursor.classList.add("clicking");
    cursor.style.transition = "transform 0.05s ease";
  });

  document.addEventListener("mouseup", () => {
    cursor.classList.remove("clicking");
    cursor.style.transition = "transform 0.1s ease";
  });

  // Hides default cursor
  document.body.style.cursor = "none";

  // Starts cursor animation loop
  updateCursor();
});

// Final cleanup and initialization
console.log("All components initialized successfully");

// Function to calculate passive perception
function updatePassivePerception() {
  try {
    const wisdomModifier = parseInt(document.getElementById('wisdom-modifier').value) || 0;
    const proficiencyBonus = parseInt(document.getElementById('proficiency-bonus').value) || 0;
    
    // Base passive perception is 10 + wisdom modifier
    let passivePerception = 10 + wisdomModifier;
    
    // Add proficiency bonus if the character is proficient in Perception
    passivePerception += proficiencyBonus;
    
    document.getElementById('passive-perception').value = passivePerception;
    characterState.update({ passivePerception });
    debouncedUpdate({ passivePerception });
  } catch (error) {
    console.error('Error updating passive perception:', error);
    showError('Failed to update passive perception');
  }
}
