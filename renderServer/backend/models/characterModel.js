// Import the mongoose library for MongoDB object modeling
const mongoose = require("mongoose");

// Define the character schema with comprehensive fields
const characterSchema = new mongoose.Schema(
    {
        // User Identification
        username: {
            type: String,
            required: true,
            unique: true,
        },

        // Basic Character Information
        name: {
            type: String,
            required: true,
        },
        background: {
            type: String,
            default: "",
        },
        species: {
            type: String,
            required: true,
        },
        class: {
            type: String,
            required: true,
        },
        subclass: {
            type: String,
            default: "",
        },

        // Level and Experience
        level: {
            type: Number,
            required: true,
            min: 1,
            max: 20,
        },
        xp: {
            type: Number,
            default: 0,
        },

        // Ability Scores
        strength: {
            type: Number,
            required: true,
            min: 1,
            max: 30,
        },
        strengthModifier: {
            type: Number,
            default: 0,
        },
        dexterity: {
            type: Number,
            required: true,
            min: 1,
            max: 30,
        },
        dexterityModifier: {
            type: Number,
            default: 0,
        },
        constitution: {
            type: Number,
            required: true,
            min: 1,
            max: 30,
        },
        constitutionModifier: {
            type: Number,
            default: 0,
        },
        intelligence: {
            type: Number,
            required: true,
            min: 1,
            max: 30,
        },
        intelligenceModifier: {
            type: Number,
            default: 0,
        },
        wisdom: {
            type: Number,
            required: true,
            min: 1,
            max: 30,
        },
        wisdomModifier: {
            type: Number,
            default: 0,
        },
        charisma: {
            type: Number,
            required: true,
            min: 1,
            max: 30,
        },
        charismaModifier: {
            type: Number,
            default: 0,
        },

        // Combat Details
        ac: {
            type: Number,
            required: true,
            min: 1,
        },
        currentHp: {
            type: Number,
            required: true,
            min: 0,
        },
        maxHp: {
            type: Number,
            required: true,
            min: 1,
        },
        tempHp: {
            type: Number,
            default: 0,
        },
        hasShield: {
            type: Boolean,
            default: false,
        },
        initiative: {
            type: Number,
            default: 0,
        },
        speed: {
            type: Number,
            default: 30,
        },

        // Hit Dice
        hitDice: {
            total: {
                type: Number,
                default: 0,
            },
            spent: {
                type: Number,
                default: 0,
            },
        },

        // Death Saves
        deathSaves: {
            successes: {
                type: Number,
                default: 0,
                max: 3,
            },
            failures: {
                type: Number,
                default: 0,
                max: 3,
            },
        },

        // Skills
        skills: {
            acrobatics: {
                type: Number,
                default: 0,
            },
            animalHandling: {
                type: Number,
                default: 0,
            },
            arcana: {
                type: Number,
                default: 0,
            },
            athletics: {
                type: Number,
                default: 0,
            },
            // Add more skills as needed
            deception: {
                type: Number,
                default: 0,
            },
            history: {
                type: Number,
                default: 0,
            },
            insight: {
                type: Number,
                default: 0,
            },
            intimidation: {
                type: Number,
                default: 0,
            },
            investigation: {
                type: Number,
                default: 0,
            },
            medicine: {
                type: Number,
                default: 0,
            },
            nature: {
                type: Number,
                default: 0,
            },
            perception: {
                type: Number,
                default: 0,
            },
            performance: {
                type: Number,
                default: 0,
            },
            persuasion: {
                type: Number,
                default: 0,
            },
            religion: {
                type: Number,
                default: 0,
            },
            sleightOfHand: {
                type: Number,
                default: 0,
            },
            stealth: {
                type: Number,
                default: 0,
            },
            survival: {
                type: Number,
                default: 0,
            },
        },

        // Equipment and Inventory
        inventory: [
            {
                type: String,
            },
        ],
        equipment: [
            {
                name: String,
                quantity: {
                    type: Number,
                    default: 1,
                },
                description: String,
            },
        ],

        // Timestamps for tracking creation and updates
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        // Enable timestamps for createdAt and updatedAt
        timestamps: true,

        // Ensure virtuals are included when converting to JSON
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Optional: Add a virtual for calculating proficiency bonus
characterSchema.virtual("proficiencyBonus").get(function () {
    return Math.floor((this.level - 1) / 4) + 2;
});

// Optional: Pre-save middleware to calculate ability modifiers
characterSchema.pre("save", function (next) {
    // Calculate ability modifiers
    const abilities = [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
    ];

    abilities.forEach((ability) => {
        const score = this[ability] || 10;
        this[`${ability}Modifier`] = Math.floor((score - 10) / 2);
    });

    next();
});

// Create a model for the Character using the defined schema
const Character = mongoose.model(
    "Character", // Model name
    characterSchema, // Schema definition
    "character_sheets" // Collection name
);

// Export the Character model for use in other parts of the application
module.exports = Character;
