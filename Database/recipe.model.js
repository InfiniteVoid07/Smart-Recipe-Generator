// models/recipe.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the structure of a recipe document
const recipeSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  cooking_time_minutes: { 
    type: Number 
  },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'] // Ensures the value is one of these options
  },
  instructions: { 
    type: String, 
    required: true 
  },
  nutritional_info: {
    calories: { type: Number },
    protein_grams: { type: Number }
  },
  ingredients: [
    {
      name: { type: String, required: true },
      quantity: { type: String, required: true }
    }
  ],
  dietary_restrictions: [String] // Defines an array of strings
});

// Create a "model" from the schema. This is the object we use to interact with the 'recipes' collection.
const Recipe = mongoose.model('Recipe', recipeSchema);

// Export the model so other files (like seed.js) can use it
module.exports = Recipe;