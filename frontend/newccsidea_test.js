window.addEventListener('DOMContentLoaded', function() {
    const subclasses = {
        Barbarian: ["Ancestral Guardian", "Battle Rager"],
        Bard: ["Creation", "Eloquence"],
        Cleric: ["Arcana", "Death"],
        Druid: ["Dreams", "Land"],
        Fighter: ["Arcane Archer", "Battle Master"],
        Monk: ["Ascendent Dragon", "Astral Self"], 
        Paladin: ["Conquest", "Devotion"], 
        Ranger: ["Beast Master", "Drakewarden"], 
        Rogue: ["Arcane Trickster", "Assassin"], 
        Sorcerer: ["Aberrant Mind", "Clockwork Soul"], 
        Warlock: ["Archfey Patron", "Celestial"], 
        Wizard: ["Bladesinging", "Chronurgy"]
    };
    
    function populate() {
        const charClass = this.value;
        const subclassSelect = document.getElementById('subclass');
        subclassSelect.innerHTML = '';

        if (subclasses[charClass]) {
            subclasses[charClass].forEach(subclass => {
                const option = document.createElement('option');
                option.value = subclass;
                option.textContent = subclass;
                subclassSelect.appendChild(option);
            });
        };
    };
    document.getElementById('charClass').addEventListener('change', populate);
});

function saveChar() {
    const characterData = {
        charName: document.getElementById('charName').value,
        background: document.getElementById('background').value,
        charClass: document.getElementById('charClass').value,
        species: document.getElementById('species').value,
        subclass: document.getElementById('subclass').value,
        level: document.getElementById('level').value,
        armorClass: document.getElementById('armorClass').value,
        shield: document.getElementById('shield').value,
        temphp: document.getElementById('temphp').value,
        maxhp: document.getElementById('maxhp').value,
        currhp: document.getElementById('currhp').value,
        
    }
}