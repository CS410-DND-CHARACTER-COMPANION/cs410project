// V3.9.1

class CharacterState {

    // Constructor initializes state and listeners
    constructor() {
        this.listeners = new Set();
        this.state = {
            name: '',
            background: '',
            species: '',
            class: '',
            subclass: '',
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
            hasShield: false
        };
    }

    // Allows subscribing listeners to state changes
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // Updates the state and notifies subscribers
    update(updates) {
        this.state = { ...this.state, ...updates };
        this.notify();
    }

    // Notifies all subscribed listeners about state change
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Returns the current character state
    getState() {
        return this.state;
    }
}

// Creates a new CharacterState instance
const characterState = new CharacterState();

// Socket connection with error handling and reconnection logic
class SocketManager {

    // Sets up socket connection and event listeners
    constructor() {
        this.socket = io({
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.socket.emit('joinCharacterSession', { userId: this.getUserId() });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            showError('Connection failed. Retrying...');
        });

        this.socket.on('reconnect_failed', () => {
            console.error('Failed to reconnect');
            showError('Connection lost. Please refresh the page.');
        });

        this.socket.on('characterData', (data) => {
            if (data && this.validateData(data)) {
                characterState.update(data);
                updateFormFields(data);
            }
        });

        this.socket.on('characterUpdate', (updates) => {
            if (this.validateData(updates)) {
                characterState.update(updates);
                updateFormFields(updates);
            }
        });
    }

    // Validates incoming data based on a schema
    validateData(data) {
        const schema = {
            name: value => typeof value === 'string',
            level: value => Number.isInteger(value) && value > 0 && value <= 20,
            xp: value => Number.isInteger(value) && value >= 0,
            equipment: value => Array.isArray(value),
            strength: value => Number.isInteger(value) && value >= 1 && value <= 30,
            dexterity: value => Number.isInteger(value) && value >= 1 && value <= 30,
            constitution: value => Number.isInteger(value) && value >= 1 && value <= 30,
            intelligence: value => Number.isInteger(value) && value >= 1 && value <= 30,
            wisdom: value => Number.isInteger(value) && value >= 1 && value <= 30,
            charisma: value => Number.isInteger(value) && value >= 1 && value <= 30
        };

        return Object.entries(data).every(([key, value]) => {
            return !schema[key] || schema[key](value);
        });
    }

    // Emits an event to the server if connected
    emit(event, data) {
        if (this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            showError('Cannot send updates: No connection');
        }
    }

    // Returns the user's socket ID
    getUserId() {
        return this.socket.id;
    }
}

// Creates a new SocketManager instance
const socketManager = new SocketManager();

// Debounces the character update function
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

// Error handling utility
function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-toast';
    errorContainer.textContent = message;
    errorContainer.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
    errorContainer.style.color = 'white';
    errorContainer.style.padding = '10px 20px';
    errorContainer.style.borderRadius = '4px';
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '20px';
    errorContainer.style.right = '20px';
    errorContainer.style.zIndex = '1000';
    document.body.appendChild(errorContainer);
    setTimeout(() => errorContainer.remove(), 5000);
}

// Success message utility
function showSuccess(message) {
    const successContainer = document.createElement('div');
    successContainer.className = 'success-toast';
    successContainer.textContent = message;
    successContainer.style.backgroundColor = 'rgba(46, 204, 113, 0.9)';
    successContainer.style.color = 'white';
    successContainer.style.padding = '10px 20px';
    successContainer.style.borderRadius = '4px';
    successContainer.style.position = 'fixed';
    successContainer.style.top = '20px';
    successContainer.style.right = '20px';
    successContainer.style.zIndex = '1000';
    document.body.appendChild(successContainer);
    setTimeout(() => successContainer.remove(), 3000);
}

// Form field update with error boundary
function updateFormFields(data) {
    try {
        Object.entries(data).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = Boolean(value);
                } else {
                    element.value = value;
                }
            }
        });

        updateProficiencyBonus();
        updateAbilityModifiers();
    } catch (error) {
        console.error('Error updating form fields:', error);
        showError('Failed to update some fields');
    }
}

// Debounced character update
const debouncedUpdate = debounce((updates) => {

    // Emits an updateCharacter event to the server
    socketManager.emit('updateCharacter', {
        userId: socketManager.getUserId(),
        characterId: characterState.getState().characterId,
        updates
    });
}, 300);

// Handles adding a new equipment item
function addEquipmentItem() {
    try {
        const itemInput = document.getElementById('equipment-item');
        const newItem = itemInput.value.trim();

        if (!newItem) {
            showError('Equipment item cannot be empty');
            return;
        }

        const currentEquipment = characterState.getState().equipment;
        const updatedEquipment = [...currentEquipment, newItem];

        characterState.update({ equipment: updatedEquipment });
        debouncedUpdate({ equipment: updatedEquipment });
        updateEquipmentDisplay();
        itemInput.value = '';
    } catch (error) {
        console.error('Error adding equipment:', error);
        showError('Failed to add equipment item');
    }
}

// Updates the equipment display
function updateEquipmentDisplay() {
    try {
        const equipmentDiv = document.getElementById('equipment');
        const equipment = characterState.getState().equipment;

        equipmentDiv.innerHTML = equipment.map((item, index) => `
            <div class="equipment-item">
                ${escapeHtml(item)}
                <button class="delete-item-btn" onclick="removeEquipmentItem(${index})">Remove</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error updating equipment display:', error);
        showError('Failed to update equipment display');
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
        console.error('Error removing equipment:', error);
        showError('Failed to remove equipment item');
    }
}

// Calculates the ability modifier for a given ability
function calculateModifier(abilityType) {
    try {
        const abilityScore = parseInt(document.getElementById(abilityType).value) || 10;

        if (abilityScore < 1 || abilityScore > 30) {
            throw new Error('Invalid ability score');
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
        const level = parseInt(document.getElementById('level').value) || 1;

        if (level < 1 || level > 20) {
            throw new Error('Invalid level');
        }

        const proficiencyBonus = Math.ceil(level / 4) + 1;
        document.getElementById('proficiency-bonus').value = proficiencyBonus;

        debouncedUpdate({ proficiencyBonus });
    } catch (error) {
        console.error('Error updating proficiency bonus:', error);
        showError('Failed to update proficiency bonus');
    }
}

// Updates all ability modifiers
function updateAbilityModifiers() {
    ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
        .forEach(ability => calculateModifier(ability));
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

// Validates the character form before submission
function validateForm() {
    const requiredFields = ['name', 'species', 'class', 'level'];
    const errors = [];

    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value) {
            errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
    });

    if (errors.length > 0) {
        showError(errors.join(', '));
        return false;
    }
    return true;
}

// Handles the character form submission
function handleFormSubmission(event) {
    // Prevent the form from submitting normally and changing the URL
    event.preventDefault();
    if (!validateForm()) {
        return;
    }
    try {
        const form = document.getElementById('character-form');
        const formData = new FormData(form);
        const characterData = {};
        for (const [key, value] of formData.entries()) {
            characterData[key] = value;
        }
        characterState.update(characterData);
        characterState.saveToLocalStorage();

        // Save character data to local storage
        localStorage.setItem('characterData', JSON.stringify(characterData));

        // Show a success message immediately after saving
        showSuccess('Character saved to local storage!');

        // Redirect to displayCharacter.html
        window.location.href = 'displayCharacter.html';

    } catch (error) {
        console.error('Error saving character:', error);
        showError('Failed to save character');
    }
}

// Set up the socket listener for characterSaved event
socketManager.socket.on('characterSaved', (response) => {
    if (response.success) {
        showSuccess('Character saved successfully!');
        window.location.href = 'displayCharacter.html'; // Redirect after successful save
    } else {
        showError('Failed to save character');
    }
});

// Sets up event listeners for the character form
function setupFormListeners() {
    try {
        const formElements = document.querySelectorAll('input, select');
        formElements.forEach(element => {
            if (element.id) {
                element.addEventListener('change', (e) => {
                    const value = element.type === 'checkbox' ? element.checked : element.value;
                    const update = { [element.id]: value };

                    if (socketManager.validateData(update)) {
                        characterState.update(update);
                        debouncedUpdate(update);
                    } else {
                        showError(`Invalid value for ${element.id}`);
                        e.target.value = characterState.getState()[element.id];
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error setting up form listeners:', error);
        showError('Failed to initialize form listeners');
    }
}

// Event listener for the "Save Character" button
function setupSaveButtonListener() {
    try {
        const saveButton = document.getElementById('save-character-btn');
        saveButton.addEventListener('click', handleFormSubmission);
    } catch (error) {
        console.error('Error setting up save button listener:', error);
        showError('Failed to initialize save button');
    }
}

// Initializes the character sheet on page load
window.onload = function () {
    try {
        const form = document.getElementById('character-form');
        form.setAttribute('novalidate', '');
        setupFormListeners();
        setupSaveButtonListener();
        console.log('Character sheet initialized');
    } catch (error) {
        console.error('Error initializing character sheet:', error);
        showError('Failed to initialize character sheet');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const moveCursor = (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    };

    document.addEventListener('mousemove', moveCursor);

    // Clicking effect with smooth animation
    document.addEventListener('mousedown', () => {
        cursor.classList.add('clicking');
        cursor.style.transition = 'transform 0.05s ease';
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('clicking');
        cursor.style.transition = 'transform 0.1s ease';
    });

    // Hide default cursor
    document.body.style.cursor = 'none';
});
