class CharacterState {
  // Constructor initializes state and listeners
  constructor() {
    this.listeners = new Set(); // Set to hold listener functions
    this.state = {
      // Initial character state with default values
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
    };
  }

  // Allows subscribing listeners to state changes
  subscribe(listener) {
    this.listeners.add(listener); // Add listener to the set
    return () => this.listeners.delete(listener); // Return unsubscribe function
  }

  // Updates the state and notifies subscribers
  update(updates) {
    this.state = { ...this.state, ...updates }; // Merge updates into current state
    this.notify(); // Notify all listeners of the state change
  }

  // Notifies all subscribed listeners about state change
  notify() {
    this.listeners.forEach((listener) => listener(this.state)); // Call each listener with the new state
  }

  // Returns the current character state
  getState() {
    return this.state; // Return the current state
  }
}

// Creates a new CharacterState instance
const characterState = new CharacterState(); // Instantiate character state

// Socket connection with error handling and reconnection logic
class SocketManager {
  // Sets up socket connection and event listeners
  constructor() {
    this.socket = io({
      // Initialize socket connection with options
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    this.setupSocketListeners(); // Set up socket event listeners
  }

  setupSocketListeners() {
    this.socket.on("connect", () => {
      // Handle successful connection
      console.log("Connected to server");
      this.socket.emit("joinCharacterSession", { userId: this.getUserId() }); // Join character session
    });

    this.socket.on("connect_error", (error) => {
      // Handle connection errors
      console.error("Connection error:", error);
      showError("Connection failed. Retrying..."); // Show error message
    });

    this.socket.on("reconnect_failed", () => {
      // Handle failed reconnection
      console.error("Failed to reconnect");
      showError("Connection lost. Please refresh the page."); // Show error message
    });

    this.socket.on("characterData", (data) => {
      // Handle incoming character data
      if (data && this.validateData(data)) {
        characterState.update(data); // Update character state
        updateFormFields(data); // Update form fields with new data
      }
    });

    this.socket.on("characterUpdate", (updates) => {
      // Handle character updates
      if (this.validateData(updates)) {
        characterState.update(updates); // Update character state
        updateFormFields(updates); // Update form fields with new updates
      }
    });
  }

  // Validates incoming data based on a schema
  validateData(data) {
    const schema = {
      // Define validation schema
      name: (value) => typeof value === "string",
      level: (value) => Number.isInteger(value) && value > 0 && value <= 20,
      xp: (value) => Number.isInteger(value) && value >= 0,
      equipment: (value) => Array.isArray(value),
      strength: (value) => Number.isInteger(value) && value >= 1 && value <= 30,
      dexterity: (value) =>
        Number.isInteger(value) && value >= 1 && value <= 30,
      constitution: (value) =>
        Number.isInteger(value) && value >= 1 && value <= 30,
      intelligence: (value) =>
        Number.isInteger(value) && value >= 1 && value <= 30,
      wisdom: (value) => Number.isInteger(value) && value >= 1 && value <= 30,
      charisma: (value) => Number.isInteger(value) && value >= 1 && value <= 30,
    };

    return Object.entries(data).every(([key, value]) => {
      return !schema[key] || schema[key](value); // Validate each field against the schema
    });
  }

  // Emits an event to the server if connected
  emit(event, data) {
    if (this.socket.connected) {
      this.socket.emit(event, data); // Emit event with data
    } else {
      showError("Cannot send updates: No connection"); // Show error if not connected
    }
  }

  // Returns the user's socket ID
  getUserId() {
    return this.socket.id; // Return the socket ID of the user
  }
}

// Creates a new SocketManager instance
const socketManager = new SocketManager(); // Instantiate socket manager

// Debounces the character update function
function debounce(func, wait) {
  let timeout; // Variable to hold the timeout ID
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout); // Clear the timeout
      func(...args); // Call the original function
    };
    clearTimeout(timeout); // Clear the previous timeout
    timeout = setTimeout(later, wait); // Set a new timeout
  };
}

// Error handling utility
function showError(message) {
  const errorContainer = document.createElement("div"); // Create error message container
  errorContainer.className = "error-toast"; // Set class for styling
  errorContainer.textContent = message; // Set error message text
  errorContainer.style.backgroundColor = "rgba(231, 76, 60, 0.9)"; // Set background color
  errorContainer.style.color = "white"; // Set text color
  errorContainer.style.padding = "10px 20px"; // Set padding
  errorContainer.style.borderRadius = "4px"; // Set border radius
  errorContainer.style.position = "fixed"; // Position fixed on screen
  errorContainer.style.top = "20px"; // Position from top
  errorContainer.style.right = "20px"; // Position from right
  errorContainer.style.zIndex = "1000"; // Ensure it appears above other elements
  document.body.appendChild(errorContainer); // Append to body
  setTimeout(() => errorContainer.remove(), 5000); // Remove after 5 seconds
}

// Success message utility
function showSuccess(message) {
  const successContainer = document.createElement("div"); // Create success message container
  successContainer.className = "success-toast"; // Set class for styling
  successContainer.textContent = message; // Set success message text
  successContainer.style.backgroundColor = "rgba(46, 204, 113, 0.9)"; // Set background color
  successContainer.style.color = "white"; // Set text color
  successContainer.style.padding = "10px 20px"; // Set padding
  successContainer.style.borderRadius = "4px"; // Set border radius
  successContainer.style.position = "fixed"; // Position fixed on screen
  successContainer.style.top = "20px"; // Position from top
  successContainer.style.right = "20px"; // Position from right
  successContainer.style.zIndex = "1000"; // Ensure it appears above other elements
  document.body.appendChild(successContainer); // Append to body
  setTimeout(() => successContainer.remove(), 3000); // Remove after 3 seconds
}

// Form field update with error boundary
function updateFormFields(data) {
  try {
    Object.entries(data).forEach(([key, value]) => {
      const element = document.getElementById(key); // Get form element by ID
      if (element) {
        if (element.type === "checkbox") {
          element.checked = Boolean(value); // Update checkbox state
        } else {
          element.value = value; // Update input value
        }
      }
    });

    updateProficiencyBonus(); // Update proficiency bonus
    updateAbilityModifiers(); // Update ability modifiers
  } catch (error) {
    console.error("Error updating form fields:", error); // Log error
    showError("Failed to update some fields"); // Show error message
  }
}

// Debounced character update
const debouncedUpdate = debounce((updates) => {
  // Emits an updateCharacter event to the server
  socketManager.emit("updateCharacter", {
    userId: socketManager.getUserId(), // Get user ID
    characterId: characterState.getState().characterId, // Get character ID
    updates, // Send updates
  });
}, 300); // 300ms debounce time

// Handles adding a new equipment item
function addEquipmentItem() {
  try {
    const itemInput = document.getElementById("equipment-item"); // Get input for new item
    const newItem = itemInput.value.trim(); // Trim whitespace

    if (!newItem) {
      showError("Equipment item cannot be empty"); // Show error if empty
      return;
    }

    const currentEquipment = characterState.getState().equipment; // Get current equipment
    const updatedEquipment = [...currentEquipment, newItem]; // Add new item to equipment list

    characterState.update({ equipment: updatedEquipment }); // Update character state
    debouncedUpdate({ equipment: updatedEquipment }); // Emit debounced update for equipment
    updateEquipmentDisplay(); // Update the display of equipment
    itemInput.value = ""; // Clear the input field
  } catch (error) {
    console.error("Error adding equipment:", error); // Log error
    showError("Failed to add equipment item"); // Show error message
  }
}

// Updates the equipment display
function updateEquipmentDisplay() {
  try {
    const equipmentDiv = document.getElementById("equipment"); // Get the equipment display element
    const equipment = characterState.getState().equipment; // Get current equipment

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
      .join(""); // Join items into a single string
  } catch (error) {
    console.error("Error updating equipment display:", error); // Log error
    showError("Failed to update equipment display"); // Show error message
  }
}

// Handles removing an equipment item
function removeEquipmentItem(index) {
  try {
    const currentEquipment = characterState.getState().equipment; // Get current equipment
    const updatedEquipment = currentEquipment.filter((_, i) => i !== index); // Remove item by index

    characterState.update({ equipment: updatedEquipment }); // Update character state
    debouncedUpdate({ equipment: updatedEquipment }); // Emit debounced update for equipment
    updateEquipmentDisplay(); // Update the display of equipment
  } catch (error) {
    console.error("Error removing equipment:", error); // Log error
    showError("Failed to remove equipment item"); // Show error message
  }
}

// Calculates the ability modifier for a given ability
function calculateModifier(abilityType) {
  try {
    const abilityScore =
      parseInt(document.getElementById(abilityType).value) || 10; // Get ability score

    if (abilityScore < 1 || abilityScore > 30) {
      throw new Error("Invalid ability score"); // Validate ability score
    }

    const modifier = Math.floor((abilityScore - 10) / 2); // Calculate modifier
    document.getElementById(`${abilityType}-modifier`).value = modifier; // Update modifier field

    debouncedUpdate({ [`${abilityType}Modifier`]: modifier }); // Emit debounced update for modifier
  } catch (error) {
    console.error(`Error calculating ${abilityType} modifier:`, error); // Log error
    showError(`Failed to calculate ${abilityType} modifier`); // Show error message
  }
}

// Updates the proficiency bonus based on the character's level
function updateProficiencyBonus() {
  try {
    const level = parseInt(document.getElementById("level").value) || 1; // Get character level

    if (level < 1 || level > 20) {
      throw new Error("Invalid level"); // Validate level
    }

    const proficiencyBonus = Math.ceil(level / 4) + 1; // Calculate proficiency bonus
    document.getElementById("proficiency-bonus").value = proficiencyBonus; // Update proficiency bonus field

    debouncedUpdate({ proficiencyBonus }); // Emit debounced update for proficiency bonus
  } catch (error) {
    console.error("Error updating proficiency bonus:", error); // Log error
    showError("Failed to update proficiency bonus"); // Show error message
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
  ].forEach((ability) => calculateModifier(ability)); // Calculate modifier for each ability
}

// Escapes HTML to prevent XSS attacks
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;") // Escape ampersands
    .replace(/</g, "&lt;") // Escape less than
    .replace(/>/g, "&gt;") // Escape greater than
    .replace(/"/g, "&quot;") // Escape double quotes
    .replace(/'/g, "&#039;"); // Escape single quotes
}

// Validates the character form before submission
function validateForm() {
  const requiredFields = ["username", "name", "species", "class", "level"]; // Required fields for validation
  const errors = []; // Array to hold error messages

  requiredFields.forEach((field) => {
    const element = document.getElementById(field); // Get form element by ID
    if (!element.value) {
      errors.push(
        `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
      ); // Add error if field is empty
    }
  });

  // Additional validation for numeric fields
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
        `${
          field.charAt(0).toUpperCase() + field.slice(1).replace("-", " ")
        } must be a valid positive number`
      );
    }
  });

  if (errors.length > 0) {
    showError(errors.join(", ")); // Show all error messages
    return false; // Return false if there are validation errors
  }
  return true; // Return true if validation passes
}

// Handles the character form submission
function handleFormSubmission(event) {
  event.preventDefault(); // Prevent default form submission
  if (!validateForm()) {
    return; // Stop execution if validation fails
  }
  try {
    const form = document.getElementById("character-form");
    const formData = new FormData(form);
    const characterData = {};

    // Convert FormData to a plain object
    for (const [key, value] of formData.entries()) {
      // Convert numeric values
      if (!isNaN(value) && value !== "") {
        characterData[key] = Number(value);
      } else {
        characterData[key] = value;
      }
    }

    // Add equipment array
    characterData.equipment = characterState.getState().equipment || [];

    // Emit the saveCharacter event with properly structured data
    socketManager.emit("saveCharacter", {
      userId: socketManager.getUserId(),
      characterId: characterState.getState().characterId,
      data: characterData,
    });

    // Show success message
    showSuccess("Saving character...");

    // Listen for the characterSaved event to redirect
    socketManager.socket.on("characterSaved", (response) => {
      if (response.success) {
        showSuccess("Character saved successfully!");
        // Redirect to displayCharacter.html with the username
        const username = document.getElementById("username").value;
        window.location.href = `displayCharacter.html?username=${encodeURIComponent(
          username
        )}`;
      } else {
        showError(response.error || "Failed to save character");
        // If username exists, focus the username field for the user to change it
        if (
          response.error &&
          response.error.includes("Username already exists")
        ) {
          const usernameField = document.getElementById("username");
          usernameField.focus();
          usernameField.select();
        }
      }
    });
  } catch (error) {
    console.error("Error saving character:", error);
    showError("Failed to save character");
  }
}

// Set up the socket listener for characterSaved event
socketManager.socket.on("characterSaved", (response) => {
  if (response.success) {
    showSuccess("Character saved successfully!"); // Show success message
    window.location.href = "displayCharacter.html"; // Redirect after successful save
  } else {
    showError("Failed to save character"); // Show error if save failed
  }
});

// Sets up event listeners for the character form
function setupFormListeners() {
  try {
    const formElements = document.querySelectorAll("input, select"); // Get all input and select elements
    formElements.forEach((element) => {
      if (element.id) {
        element.addEventListener("change", (e) => {
          const value =
            element.type === "checkbox" ? element.checked : element.value; // Get value based on type
          const update = { [element.id]: value }; // Create update object

          if (socketManager.validateData(update)) {
            characterState.update(update); // Update character state
            debouncedUpdate(update); // Emit debounced update
          } else {
            showError(`Invalid value for ${element.id}`); // Show error for invalid value
            e.target.value = characterState.getState()[element.id]; // Reset to previous value
          }
        });
      }
    });
  } catch (error) {
    console.error("Error setting up form listeners:", error); // Log error
    showError("Failed to initialize form listeners"); // Show error message
  }
}

// Event listener for the "Save Character" button
function setupSaveButtonListener() {
  try {
    const saveButton = document.getElementById("save-character-btn"); // Get save button
    saveButton.addEventListener("click", handleFormSubmission); // Set click event to handle submission
  } catch (error) {
    console.error("Error setting up save button listener:", error); // Log error
    showError("Failed to initialize save button"); // Show error message
  }
}

// Initializes the character sheet on page load
window.onload = function () {
  try {
    const form = document.getElementById("character-form"); // Get the character form
    form.setAttribute("novalidate", ""); // Disable default HTML validation
    setupFormListeners(); // Set up form listeners
    setupSaveButtonListener(); // Set up save button listener
    console.log("Character sheet initialized"); // Log initialization
  } catch (error) {
    console.error("Error initializing character sheet:", error); // Log error
    showError("Failed to initialize character sheet"); // Show error message
  }
};

// Custom cursor functionality
document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  document.body.appendChild(cursor);

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const speed = 0.1; // Adjust this value to control the smoothness

  // Function to update the cursor position
  const updateCursor = () => {
    targetX = mouseX;
    targetY = mouseY;
    mouseX += (targetX - mouseX) * speed;
    mouseY += (targetY - mouseY) * speed;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
    requestAnimationFrame(updateCursor); // Continue the animation
  };

  // Mouse movement event
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX; // Get mouse X position
    mouseY = e.clientY; // Get mouse Y position
  });

  // Clicking effect with smooth animation
  document.addEventListener("mousedown", () => {
    cursor.classList.add("clicking");
    cursor.style.transition = "transform 0.05s ease"; // Quick transition for effect
  });

  document.addEventListener("mouseup", () => {
    cursor.classList.remove("clicking");
    cursor.style.transition = "transform 0.1s ease"; // Reset transition duration
  });

  // Hide default cursor
  document.body.style.cursor = "none";

  // Start the cursor update loop
  updateCursor();
});

// Final cleanup and initialization
console.log("All components initialized successfully"); // Log successful initialization
