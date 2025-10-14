const mongoose = require('mongoose');
const Recipe = require('./models/recipe.model');
require('dotenv').config();

// New list of recipes using common, overlapping ingredients
const sampleRecipes = [
  // --- Chicken Based ---
  {
    name: "Simple Baked Chicken Breast",
    description: "A basic, healthy baked chicken breast.",
    cooking_time_minutes: 25,
    difficulty: "Easy",
    servings: 2,
    instructions: "1. Preheat oven to 400°F (200°C). 2. Season chicken with salt, pepper, and olive oil. 3. Bake for 20-25 minutes until cooked through.",
    nutritional_info: { calories: 280, protein_grams: 50 },
    ingredients: [
      { name: "Chicken Breast", quantity: "2" },
      { name: "Olive Oil", quantity: "1 tbsp" },
      { name: "Salt", quantity: "1 tsp" },
      { name: "Pepper", quantity: "1/2 tsp" }
    ],
    dietary_restrictions: ["Gluten-Free"]
  },
  {
    name: "Garlic Herb Chicken",
    description: "Baked chicken breast with added garlic and herbs.",
    cooking_time_minutes: 25,
    difficulty: "Easy",
    servings: 2,
    instructions: "1. Preheat oven to 400°F (200°C). 2. Mix olive oil, minced garlic, and oregano. 3. Coat chicken with mixture, salt, and pepper. 4. Bake for 20-25 minutes.",
    nutritional_info: { calories: 310, protein_grams: 50 },
    ingredients: [
      { name: "Chicken Breast", quantity: "2" },
      { name: "Olive Oil", quantity: "1 tbsp" },
      { name: "Garlic", quantity: "2 cloves" },
      { name: "Oregano", quantity: "1 tsp" },
      { name: "Salt", quantity: "1 tsp" },
      { name: "Pepper", quantity: "1/2 tsp" }
    ],
    dietary_restrictions: ["Gluten-Free"]
  },
  {
    name: "Chicken and Broccoli Stir-fry Base",
    description: "A simple chicken and broccoli stir-fry.",
    cooking_time_minutes: 15,
    difficulty: "Easy",
    servings: 2,
    instructions: "1. Slice chicken and chop broccoli. 2. Heat oil in a pan, stir-fry chicken until cooked. 3. Add broccoli and a splash of water, cover and steam for 3-4 minutes. 4. Season with salt and pepper.",
    nutritional_info: { calories: 350, protein_grams: 55 },
    ingredients: [
      { name: "Chicken Breast", quantity: "2" },
      { name: "Broccoli", quantity: "1 head" },
      { name: "Olive Oil", quantity: "1 tbsp" },
      { name: "Salt", quantity: "1/2 tsp" },
      { name: "Pepper", quantity: "1/4 tsp" }
    ],
    dietary_restrictions: ["Gluten-Free"]
  },
  {
    name: "Chicken and Veggie Stir-fry",
    description: "A colorful stir-fry with chicken and mixed vegetables.",
    cooking_time_minutes: 20,
    difficulty: "Easy",
    servings: 3,
    instructions: "1. Stir-fry chicken until cooked. 2. Add sliced carrots and bell peppers, cook for 5 minutes. 3. Add broccoli, cook for another 4 minutes. 4. Stir in soy sauce.",
    nutritional_info: { calories: 400, protein_grams: 55 },
    ingredients: [
      { name: "Chicken Breast", quantity: "2" },
      { name: "Broccoli", quantity: "1 head" },
      { name: "Carrots", quantity: "2" },
      { name: "Bell Pepper", quantity: "1" },
      { name: "Olive Oil", quantity: "2 tbsp" },
      { name: "Soy Sauce", quantity: "3 tbsp" }
    ],
    dietary_restrictions: []
  },
  // --- Beef Based ---
  {
    name: "Simple Pan-Seared Ground Beef",
    description: "Basic browned ground beef, a starter for many meals.",
    cooking_time_minutes: 10,
    difficulty: "Easy",
    servings: 4,
    instructions: "1. Heat a pan over medium-high heat. 2. Add ground beef and break it apart. 3. Cook until browned, stirring occasionally. 4. Drain excess fat. Season with salt and pepper.",
    nutritional_info: { calories: 300, protein_grams: 25 },
    ingredients: [
      { name: "Ground Beef", quantity: "1 lb" },
      { name: "Salt", quantity: "1 tsp" },
      { name: "Pepper", quantity: "1/2 tsp" }
    ],
    dietary_restrictions: ["Gluten-Free"]
  },
  {
    name: "Ground Beef with Onions",
    description: "Browned ground beef sautéed with onions.",
    cooking_time_minutes: 15,
    difficulty: "Easy",
    servings: 4,
    instructions: "1. Sauté chopped onion in a pan until soft. 2. Add ground beef and cook until browned. 3. Drain fat and season.",
    nutritional_info: { calories: 340, protein_grams: 26 },
    ingredients: [
      { name: "Ground Beef", quantity: "1 lb" },
      { name: "Onion", quantity: "1" },
      { name: "Olive Oil", quantity: "1 tbsp" },
      { name: "Salt", quantity: "1 tsp" },
      { name: "Pepper", quantity: "1/2 tsp" }
    ],
    dietary_restrictions: ["Gluten-Free"]
  },
  {
    name: "Simple Beef and Rice Skillet",
    description: "A one-pan meal with beef and rice.",
    cooking_time_minutes: 25,
    difficulty: "Easy",
    servings: 4,
    instructions: "1. Brown ground beef with onion. 2. Add rice, beef broth, and tomato sauce. 3. Bring to a simmer, cover, and cook for 15-20 minutes until rice is tender.",
    nutritional_info: { calories: 450, protein_grams: 30 },
    ingredients: [
      { name: "Ground Beef", quantity: "1 lb" },
      { name: "Onion", quantity: "1" },
      { name: "Rice", quantity: "1 cup" },
      { name: "Beef Broth", quantity: "2 cups" },
      { name: "Tomato Sauce", quantity: "1 cup" }
    ],
    dietary_restrictions: ["Gluten-Free"]
  },
  // --- Egg Based ---
  {
    name: "Scrambled Eggs",
    description: "Classic and simple scrambled eggs.",
    cooking_time_minutes: 5,
    difficulty: "Easy",
    servings: 2,
    instructions: "1. Whisk eggs with milk, salt, and pepper. 2. Melt butter in a non-stick skillet. 3. Pour in egg mixture and cook, stirring gently, until cooked to your liking.",
    nutritional_info: { calories: 250, protein_grams: 15 },
    ingredients: [
      { name: "Eggs", quantity: "4" },
      { name: "Milk", quantity: "2 tbsp" },
      { name: "Butter", quantity: "1 tbsp" },
      { name: "Salt", quantity: "1/4 tsp" },
      { name: "Pepper", quantity: "a pinch" }
    ],
    dietary_restrictions: ["Vegetarian", "Gluten-Free"]
  },
  {
    name: "Cheesy Scrambled Eggs",
    description: "Scrambled eggs with melted cheddar cheese.",
    cooking_time_minutes: 6,
    difficulty: "Easy",
    servings: 2,
    instructions: "1. Whisk eggs with milk, salt, and pepper. 2. Cook in a buttered skillet. 3. Just before they are set, stir in shredded cheese.",
    nutritional_info: { calories: 350, protein_grams: 20 },
    ingredients: [
      { name: "Eggs", quantity: "4" },
      { name: "Milk", quantity: "2 tbsp" },
      { name: "Butter", quantity: "1 tbsp" },
      { name: "Cheddar Cheese", quantity: "1/2 cup" },
      { name: "Salt", quantity: "1/4 tsp" }
    ],
    dietary_restrictions: ["Vegetarian", "Gluten-Free"]
  },
  {
    name: "Veggie Omelette",
    description: "A simple omelette with onions and bell peppers.",
    cooking_time_minutes: 10,
    difficulty: "Easy",
    servings: 1,
    instructions: "1. Whisk eggs with a splash of milk. 2. Sauté chopped onion and bell pepper in butter until soft. 3. Pour eggs over vegetables and cook until set. 4. Add cheese, fold, and serve.",
    nutritional_info: { calories: 380, protein_grams: 22 },
    ingredients: [
      { name: "Eggs", quantity: "3" },
      { name: "Onion", quantity: "1/4" },
      { name: "Bell Pepper", quantity: "1/4" },
      { name: "Cheddar Cheese", quantity: "1/4 cup" },
      { name: "Butter", quantity: "1 tbsp" },
      { name: "Milk", quantity: "1 tbsp" }
    ],
    dietary_restrictions: ["Vegetarian", "Gluten-Free"]
  },
  // --- Pasta & Rice Based ---
  {
    name: "Plain Cooked Pasta",
    description: "Perfectly cooked plain pasta.",
    cooking_time_minutes: 12,
    difficulty: "Easy",
    servings: 4,
    instructions: "1. Bring a large pot of salted water to a boil. 2. Add pasta and cook according to package directions. 3. Drain.",
    nutritional_info: { calories: 220, protein_grams: 8 },
    ingredients: [
      { name: "Pasta", quantity: "1 lb" },
      { name: "Salt", quantity: "1 tbsp" }
    ],
    dietary_restrictions: ["Vegetarian", "Vegan"]
  },
  {
    name: "Pasta with Butter and Garlic",
    description: "A simple and delicious pasta dish.",
    cooking_time_minutes: 15,
    difficulty: "Easy",
    servings: 4,
    instructions: "1. Cook pasta. 2. While pasta cooks, melt butter in a pan and sauté minced garlic until fragrant. 3. Toss drained pasta with garlic butter.",
    nutritional_info: { calories: 350, protein_grams: 9 },
    ingredients: [
      { name: "Pasta", quantity: "1 lb" },
      { name: "Butter", quantity: "1/2 cup" },
      { name: "Garlic", quantity: "3 cloves" },
      { name: "Salt", quantity: "1 tsp" }
    ],
    dietary_restrictions: ["Vegetarian"]
  },
  {
    name: "Simple Tomato Pasta",
    description: "Pasta coated in a basic tomato sauce.",
    cooking_time_minutes: 20,
    difficulty: "Easy",
    servings: 4,
    instructions: "1. Cook pasta. 2. Heat tomato sauce in a saucepan. 3. Combine pasta and sauce.",
    nutritional_info: { calories: 380, protein_grams: 10 },
    ingredients: [
      { name: "Pasta", quantity: "1 lb" },
      { name: "Tomato Sauce", quantity: "2 cups" },
      { name: "Olive Oil", quantity: "1 tbsp" }
    ],
    dietary_restrictions: ["Vegetarian", "Vegan"]
  },
    {
    name: "Steamed White Rice",
    description: "Perfectly steamed white rice.",
    cooking_time_minutes: 20,
    difficulty: "Easy",
    servings: 3,
    instructions: "1. Rinse rice. 2. Add rice and water (usually a 1:2 ratio) to a pot. 3. Bring to a boil, then reduce heat to low, cover, and simmer for 15-18 minutes.",
    nutritional_info: { calories: 205, protein_grams: 4 },
    ingredients: [
      { name: "Rice", quantity: "1 cup" },
      { name: "Water", quantity: "2 cups" }
    ],
    dietary_restrictions: ["Vegetarian", "Vegan", "Gluten-Free"]
  },
  // --- Vegetable Sides ---
  {
    name: "Steamed Carrots",
    description: "Simple steamed carrots.",
    cooking_time_minutes: 10,
    difficulty: "Easy",
    servings: 2,
    instructions: "1. Slice carrots. 2. Place in a pot with an inch of water. 3. Bring to a boil, cover, and steam for 5-7 minutes until tender.",
    nutritional_info: { calories: 50, protein_grams: 1 },
    ingredients: [
      { name: "Carrots", quantity: "3" },
      { name: "Water", quantity: "1 cup" }
    ],
    dietary_restrictions: ["Vegetarian", "Vegan", "Gluten-Free"]
  },
  {
    name: "Roasted Broccoli",
    description: "Crispy and flavorful roasted broccoli.",
    cooking_time_minutes: 20,
    difficulty: "Easy",
    servings: 2,
    instructions: "1. Preheat oven to 425°F (220°C). 2. Toss broccoli florets with olive oil, salt, and pepper. 3. Roast for 15-20 minutes until tender and slightly browned.",
    nutritional_info: { calories: 120, protein_grams: 4 },
    ingredients: [
      { name: "Broccoli", quantity: "1 head" },
      { name: "Olive Oil", quantity: "2 tbsp" },
      { name: "Salt", quantity: "1/2 tsp" },
      { name: "Pepper", quantity: "1/4 tsp" }
    ],
    dietary_restrictions: ["Vegetarian", "Vegan", "Gluten-Free"]
  },
  {
    name: "Sautéed Onions and Peppers",
    description: "A versatile base of sautéed onions and bell peppers.",
    cooking_time_minutes: 10,
    difficulty: "Easy",
    servings: 3,
    instructions: "1. Slice onion and bell pepper. 2. Heat olive oil in a skillet over medium heat. 3. Add vegetables and cook, stirring occasionally, for 8-10 minutes until soft.",
    nutritional_info: { calories: 80, protein_grams: 1 },
    ingredients: [
      { name: "Onion", quantity: "1" },
      { name: "Bell Pepper", quantity: "1" },
      { name: "Olive Oil", quantity: "1 tbsp" }
    ],
    dietary_restrictions: ["Vegetarian", "Vegan", "Gluten-Free"]
  },
  {
    name: "Simple Garden Salad",
    description: "A basic salad with lettuce and tomato.",
    cooking_time_minutes: 5,
    difficulty: "Easy",
    servings: 2,
    instructions: "1. Chop lettuce and slice tomato. 2. Combine in a bowl. 3. Drizzle with olive oil and a pinch of salt.",
    nutritional_info: { calories: 100, protein_grams: 1 },
    ingredients: [
      { name: "Lettuce", quantity: "1/2 head" },
      { name: "Tomatoes", quantity: "1" },
      { name: "Olive Oil", quantity: "1 tbsp" },
      { name: "Salt", quantity: "a pinch" }
    ],
    dietary_restrictions: ["Vegetarian", "Vegan", "Gluten-Free"]
  },
  {
    name: "Boiled Potatoes",
    description: "Simple boiled potatoes, ready for mashing or roasting.",
    cooking_time_minutes: 20,
    difficulty: "Easy",
    servings: 3,
    instructions: "1. Peel and chop potatoes. 2. Place in a pot and cover with cold, salted water. 3. Bring to a boil and cook for 15-20 minutes until fork-tender.",
    nutritional_info: { calories: 130, protein_grams: 3 },
    ingredients: [
      { name: "Potatoes", quantity: "3" },
      { name: "Water", quantity: "enough to cover" },
      { name: "Salt", quantity: "1 tsp" }
    ],
    dietary_restrictions: ["Vegetarian", "Vegan", "Gluten-Free"]
  },
  {
    name: "Garlic Mashed Potatoes",
    description: "Creamy mashed potatoes with a hint of garlic.",
    cooking_time_minutes: 25,
    difficulty: "Easy",
    servings: 4,
    instructions: "1. Boil potatoes until tender. 2. Drain and return to pot. 3. Mash with butter, milk, garlic powder, salt, and pepper until smooth.",
    nutritional_info: { calories: 250, protein_grams: 4 },
    ingredients: [
      { name: "Potatoes", quantity: "4" },
      { name: "Butter", quantity: "4 tbsp" },
      { name: "Milk", quantity: "1/2 cup" },
      { name: "Garlic", quantity: "1 clove, minced" },
      { name: "Salt", quantity: "1/2 tsp" }
    ],
    dietary_restrictions: ["Vegetarian", "Gluten-Free"]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas for seeding...');

    await Recipe.deleteMany({});
    console.log('🧹 Cleared existing recipes.');

    await Recipe.insertMany(sampleRecipes);
    console.log('🌱 Database has been seeded with new universal recipes!');
  } catch (err) {
    console.error('❌ Failed to seed database:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

seedDB();