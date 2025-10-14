// --- DOM Element References ---
const dietaryOptionsContainer = document.getElementById('dietary-options'), generateBtn = document.getElementById('generate-btn'), recipesGrid = document.getElementById('recipes-grid'), uploadTab = document.getElementById('upload-tab'), manualTab = document.getElementById('manual-tab'), imageUploadSection = document.getElementById('image-upload-section'), manualInputSection = document.getElementById('manual-input-section'), imageUploadInput = document.getElementById('image-upload'), imageDropZone = document.getElementById('image-drop-zone'), imagePreviewContainer = document.getElementById('image-preview-container'), imagePreview = document.getElementById('image-preview'), removeImageBtn = document.getElementById('remove-image'), manualIngredientsInput = document.getElementById('ingredients-manual'), emptyState = document.getElementById('empty-state'), errorState = document.getElementById('error-state'), loaderContainer = document.getElementById('loader-container'), loadingMessage = document.getElementById('loading-message'), errorMessage = document.getElementById('error-message'), recipeModal = document.getElementById('recipe-modal'), modalCloseBtn = document.getElementById('modal-close-btn'), difficultyFilter = document.getElementById('difficulty-filter'), timeFilter = document.getElementById('time-filter');

// --- State and Config ---
let uploadedImageBase64 = null;
let currentRecipes = [];
let originalRecipeInModal = null;
let currentServings = 1;

// --- API Key is REMOVED from the front-end for security ---
// The new makeApiCall function will use a serverless function proxy.

const DIETARY_PREFERENCES = ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Diabetic-friendly', 'High-protein', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Jain Diet'];
const recipeSchema = {type:"ARRAY",items:{type:"OBJECT",properties:{name:{type:"STRING"},description:{type:"STRING"},cookingTime:{type:"STRING"},difficulty:{type:"STRING"},servings:{type:"STRING"},ingredients:{type:"ARRAY",items:{type:"STRING"}},instructions:{type:"ARRAY",items:{type:"STRING"}},nutrition:{type:"OBJECT",properties:{calories:{type:"STRING"},protein:{type:"STRING"},carbs:{type:"STRING"},fat:{type:"STRING"}}}, youtubeVideoId:{type:"STRING"}}}};

// --- Initialization ---
function initialize() { 
    populateDietaryOptions(); 
    setupEventListeners();
}

function populateDietaryOptions() {
    DIETARY_PREFERENCES.forEach(pref => {
        const id = pref.toLowerCase().replace(/ /g, '-');
        const optionDiv = document.createElement('div');
        optionDiv.className = 'flex items-start';
        optionDiv.innerHTML = `<div class="flex h-5 items-center"><input id="${id}" name="diet" type="checkbox" class="h-4 w-4 rounded border-gray-500 bg-gray-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"></div><div class="ml-2 text-sm"><label for="${id}" class="font-medium text-gray-300">${pref}</label></div>`;
        dietaryOptionsContainer.appendChild(optionDiv);
    });
}

function setupEventListeners() {
    uploadTab.addEventListener('click', () => switchTab('upload'));
    manualTab.addEventListener('click', () => switchTab('manual'));
    imageDropZone.addEventListener('click', () => imageUploadInput.click());
    imageDropZone.addEventListener('dragover', e => { e.preventDefault(); imageDropZone.classList.add('border-orange-400'); });
    imageDropZone.addEventListener('dragleave', e => { e.preventDefault(); imageDropZone.classList.remove('border-orange-400'); });
    imageDropZone.addEventListener('drop', e => { e.preventDefault(); imageDropZone.classList.remove('border-orange-400'); if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]); });
    imageUploadInput.addEventListener('change', e => { if (e.target.files.length) handleImageFile(e.target.files[0]); });
    removeImageBtn.addEventListener('click', () => { imageUploadInput.value = ''; imagePreview.src = '#'; imagePreviewContainer.classList.add('hidden'); imageDropZone.classList.remove('hidden'); uploadedImageBase64 = null; });
    generateBtn.addEventListener('click', handleGenerateClick);
    modalCloseBtn.addEventListener('click', () => recipeModal.classList.add('hidden'));
    difficultyFilter.addEventListener('change', applyFiltersAndRender);
    timeFilter.addEventListener('change', applyFiltersAndRender);
}

// --- UI Logic (No changes in this section) ---
function switchTab(tab) {
    const activeClasses = ['text-orange-400', 'border-orange-400'];
    const inactiveClasses = ['text-gray-400'];
    const activeBorder = 'border-b-2';
    
    if (tab === 'upload') {
        uploadTab.classList.add(...activeClasses, activeBorder);
        uploadTab.classList.remove(...inactiveClasses);
        manualTab.classList.add(...inactiveClasses);
        manualTab.classList.remove(...activeClasses, activeBorder);
        imageUploadSection.classList.remove('hidden');
        manualInputSection.classList.add('hidden');
    } else {
        manualTab.classList.add(...activeClasses, activeBorder);
        manualTab.classList.remove(...inactiveClasses);
        uploadTab.classList.add(...inactiveClasses);
        uploadTab.classList.remove(...activeClasses, activeBorder);
        manualInputSection.classList.remove('hidden');
        imageUploadSection.classList.add('hidden');
    }
}

function showState(state, message = '') {
    emptyState.classList.add('hidden');
    errorState.classList.add('hidden');
    loaderContainer.classList.add('hidden');
    recipesGrid.classList.add('hidden');

    switch (state) {
        case 'error': 
            errorMessage.textContent = message || "An unknown error occurred.";
            errorState.classList.remove('hidden'); 
            break;
        case 'empty': 
            emptyState.classList.remove('hidden'); 
            break;
        case 'loading': 
            loadingMessage.textContent = message;
            loaderContainer.classList.remove('hidden'); 
            recipesGrid.innerHTML = '';
            break;
        case 'results': 
            recipesGrid.classList.remove('hidden');
            break;
        default: 
            emptyState.classList.remove('hidden'); 
            break;
    }
}

function handleImageFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('hidden');
            imageDropZone.classList.add('hidden');
            uploadedImageBase64 = e.target.result.split(',')[1];
        };
        reader.readAsDataURL(file);
    }
}

// --- Core Application Logic (No changes in this section except makeApiCall) ---
async function handleGenerateClick() {
    let ingredientsList = '';
    const isImageMode = !imageUploadSection.classList.contains('hidden');
    try {
        if (isImageMode && uploadedImageBase64) {
            showState('loading', 'Detecting ingredients...');
            ingredientsList = await getIngredientsFromImage(uploadedImageBase64);
        } else if (!isImageMode && manualIngredientsInput.value.trim()) {
            ingredientsList = manualIngredientsInput.value.trim();
        } else { 
            throw new Error('Please provide ingredients by uploading an image or entering them manually.'); 
        }
        
        showState('loading', `Found: ${ingredientsList}. Finding 5 relevant recipes...`);
        const recipes = await getRecipes(ingredientsList);
        currentRecipes = recipes;
        applyFiltersAndRender();
        showState('results');
    } catch (err) {
        console.error("Error generating recipes:", err);
        showState('error', err.message);
    }
}

function parseCookingTime(timeStr) {
    if (!timeStr) return 999;
    const minutes = timeStr.match(/\d+/);
    return minutes ? parseInt(minutes[0], 10) : 999;
}

function applyFiltersAndRender() {
    const difficulty = difficultyFilter.value;
    const timeValue = timeFilter.value;

    const filteredRecipes = currentRecipes.filter(recipe => {
        const difficultyMatch = difficulty === 'All' || recipe.difficulty === difficulty;
        
        const recipeTime = parseCookingTime(recipe.cookingTime);
        let timeMatch = false;
        if (timeValue === '999') {
            timeMatch = true;
        } else if (timeValue === '61') {
            timeMatch = recipeTime > 60;
        } else {
            timeMatch = recipeTime <= parseInt(timeValue, 10);
        }
        
        return difficultyMatch && timeMatch;
    });
    renderRecipes(filteredRecipes);
}

async function getIngredientsFromImage(base64) {
    const payload = { contents: [{ parts: [{ text: "Identify the food ingredients in this image. Respond with ONLY a comma-separated string. Example: tomatoes, onions, garlic." }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }] };
    const response = await makeApiCall(payload);
    return response.candidates[0].content.parts[0].text.trim().replace(/^ingredients:\s*/i, '');
}

async function getRecipes(ingredients) {
    const dietaryPreferences = Array.from(document.querySelectorAll('#dietary-options input:checked')).map(input => DIETARY_PREFERENCES.find(p => p.toLowerCase().replace(/ /g, '-') === input.id)).join(', ');
    let prompt = `You are a creative chef. Generate 5 diverse recipes based on these ingredients: ${ingredients}. `;
    if (dietaryPreferences) { prompt += `The recipes MUST adhere to these dietary restrictions: ${dietaryPreferences}. `; }
    prompt += `For each recipe, include a name, short description, cooking time, difficulty (Easy, Medium, Hard), servings, ingredients (including additions), step-by-step instructions, and estimated nutritional info (calories, protein, carbs, fat) per serving. Finally, for each recipe, you MUST find the most relevant YouTube video ID for a cooking tutorial based on the recipe name. Include this ID as the 'youtubeVideoId' key in the JSON object. For example, if the video URL is 'https://www.youtube.com/watch?v=AbCDeFgHiJk', the value for 'youtubeVideoId' should be 'AbCDeFgHiJk'. If no relevant video is found, this value should be an empty string "".`;
    const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", responseSchema: recipeSchema } };
    const response = await makeApiCall(payload);
    let jsonText = response.candidates[0].content.parts[0].text;
    
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    try { return JSON.parse(jsonText); } 
    catch (e) { console.error("Failed to parse JSON:", jsonText); throw new Error("The AI returned an invalid recipe format. Please try again."); }
}

/**
 * --- MODIFIED FOR SECURITY ---
 * This function no longer calls the Google AI API directly.
 * Instead, it calls a serverless function that acts as a secure proxy.
 * This prevents the API key from being exposed in the front-end code.
 */
async function makeApiCall(payload) {
    const response = await fetch('/api/getRecipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Proxy request failed: ${errorBody}`);
    }
    
    const data = await response.json();
    
    // Check if the proxied response itself contains an error from the Google API
    if (data.error) {
        throw new Error(data.error);
    }

    return data;
}

// --- Rendering Logic (No changes in this section) ---
function renderRecipes(recipes) {
    recipesGrid.innerHTML = '';
    if (!recipes || recipes.length === 0) {
        const difficulty = difficultyFilter.value;
        const timeText = timeFilter.options[timeFilter.selectedIndex].text.toLowerCase();

        let message = 'No recipes found matching your criteria.';
        if (difficulty !== 'All' && timeFilter.value !== '999') {
            message = `No '${difficulty}' recipes found with cooking time '${timeText}'.`;
        } else if (difficulty !== 'All') {
            message = `No '${difficulty}' recipes found.`;
        } else if (timeFilter.value !== '999') {
             message = `No recipes found with cooking time '${timeText}'.`;
        } else if (currentRecipes.length > 0) {
            message = 'No recipes match the selected filters.';
        } else {
            message = 'The AI could not generate recipes from the ingredients.'
        }

        recipesGrid.innerHTML = `<div class="lg:col-span-3 text-center py-10"><h3 class="text-xl font-semibold text-gray-300">${message}</h3><p class="text-gray-400">Try adjusting your filters or generating a new list.</p></div>`;
        return;
    }
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card bg-transparent rounded-xl overflow-hidden cursor-pointer h-56';
        card.style.perspective = '1000px';
        
        const nutrition = recipe.nutrition || {};
        const { calories = 'N/A', protein = 'N/A', carbs = 'N/A', fat = 'N/A' } = nutrition;

        card.innerHTML = `
            <div class="recipe-card-inner relative w-full h-full">
                <div class="recipe-card-front absolute w-full h-full p-6 rounded-xl shadow-lg glassmorphism flex flex-col justify-between">
                    <div class="flex-grow">
                        <div class="flex justify-between items-start">
                            <p class="uppercase tracking-wide text-sm text-orange-400 font-bold">${recipe.name}</p>
                            <div class="heart-icon text-2xl text-gray-500 hover:text-red-500 transition-colors cursor-pointer">♡</div>
                        </div>
                        <p class="mt-2 text-gray-300 text-sm h-20 overflow-hidden">${recipe.description}</p>
                    </div>
                    <div class="mt-4 flex justify-between items-center text-sm text-gray-300 font-medium">
                        <span class="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>${recipe.cookingTime}</span>
                        <span class="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>${recipe.difficulty}</span>
                    </div>
                </div>
                <div class="recipe-card-back absolute w-full h-full p-6 rounded-xl shadow-lg glassmorphism flex flex-col justify-center items-center text-center">
                    <h4 class="font-bold text-gray-200">Nutritional Info</h4>
                    <p class="text-sm text-gray-400">(per serving)</p>
                    <ul class="mt-3 text-sm text-gray-300 space-y-1">
                        <li><strong>Calories:</strong> ${calories}</li><li><strong>Protein:</strong> ${protein}</li>
                        <li><strong>Carbs:</strong> ${carbs}</li><li><strong>Fat:</strong> ${fat}</li>
                    </ul>
                </div>
            </div>`;
        card.querySelector('.heart-icon').addEventListener('click', e => { e.stopPropagation(); const heart = e.currentTarget; heart.classList.toggle('liked'); heart.textContent = heart.classList.contains('liked') ? '♥' : '♡'; });
        card.addEventListener('click', () => showRecipeModal(recipe));
        recipesGrid.appendChild(card);
    });
}

function showRecipeModal(recipe) {
    originalRecipeInModal = recipe;
    currentServings = parseInt(recipe.servings.match(/\d+/)[0] || 1);

    document.getElementById('modal-title').textContent = recipe.name;
    document.getElementById('modal-description').textContent = recipe.description;
    document.getElementById('modal-time').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> ${recipe.cookingTime}`;
    document.getElementById('modal-difficulty').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> ${recipe.difficulty}`;
    
    const nutrition = recipe.nutrition || {};
    const { calories = 'N/A', protein = 'N/A', carbs = 'N/A', fat = 'N/A' } = nutrition;

    document.getElementById('modal-nutrition').innerHTML = `<li><strong>Calories:</strong> <span class="font-normal">${calories}</span></li><li><strong>Protein:</strong> <span class="font-normal">${protein}</span></li><li><strong>Carbs:</strong> <span class="font-normal">${carbs}</span></li><li><strong>Fat:</strong> <span class="font-normal">${fat}</span></li>`;
    
    const instructionsList = document.getElementById('modal-instructions');
    instructionsList.innerHTML = recipe.instructions.map((step, index) => `<li class="flex items-start"><input type="checkbox" id="step-${index}" class="instruction-checkbox hidden"><label for="step-${index}" class="flex items-start cursor-pointer"><span class="checkbox-bounce w-5 h-5 mr-4 mt-1 border-2 border-gray-500 rounded-full flex-shrink-0 flex items-center justify-center transition-all"><svg class="w-3 h-3 text-white fill-current opacity-0 transition-opacity" viewBox="0 0 16 16"><path d="M13.414 4.586a2 2 0 00-2.828 0L6 9.172 4.414 7.586a2 2 0 10-2.828 2.828l3 3a2 2 0 002.828 0l6-6a2 2 0 000-2.828z"/></svg></span><span>${step}</span></label><style>#step-${index}:checked+label .checkbox-bounce{background-color:#34D399;border-color:#34D399}#step-${index}:checked+label .checkbox-bounce svg{opacity:1}</style></li>`).join('');
    
    const videoContainer = document.getElementById('modal-video-container');
    videoContainer.innerHTML = '';
    if (recipe.youtubeVideoId) {
        videoContainer.innerHTML = `
            <h4 class="font-bold text-xl mt-6 mb-2 text-gray-200">Video Tutorial</h4>
            <a href="https://www.youtube.com/watch?v=${recipe.youtubeVideoId}" target="_blank" rel="noopener noreferrer" class="block relative group">
                <img src="https://img.youtube.com/vi/${recipe.youtubeVideoId}/mqdefault.jpg" alt="Video thumbnail for ${recipe.name}" class="rounded-lg w-full transition-opacity group-hover:opacity-80">
                <div class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <svg class="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                </div>
            </a>
        `;
    }

    document.getElementById('servings-increase').onclick = () => adjustServings(1);
    document.getElementById('servings-decrease').onclick = () => adjustServings(-1);
    
    updateServingsDisplay();
    recipeModal.classList.remove('hidden');
}

function adjustServings(change) {
    const newServings = currentServings + change;
    if (newServings > 0) {
        currentServings = newServings;
        updateServingsDisplay();
    }
}

function updateServingsDisplay() {
    document.getElementById('servings-display').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a3.001 3.001 0 015.644 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Serves ${currentServings}`;
    updateIngredientsForServings();
}

function updateIngredientsForServings() {
    const originalServings = parseInt(originalRecipeInModal.servings.match(/\d+/)[0] || 1);
    const ratio = currentServings / originalServings;
    const ingredientsList = document.getElementById('modal-ingredients');

    ingredientsList.innerHTML = originalRecipeInModal.ingredients.map(ingredient => {
        return `<li>${ingredient.replace(/[\d\.]+/g, (match) => {
            return (parseFloat(match) * ratio).toFixed(2).replace(/\.00$/, '');
        })}</li>`;
    }).join('');
}

// --- Start the application ---
initialize();

