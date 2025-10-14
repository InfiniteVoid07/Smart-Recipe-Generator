# From Fridge to Feast: A Smart Recipe Generator

"From Fridge to Feast" is an intelligent recipe generator designed to create meal ideas from a given list of ingredients. This application utilizes an AI model to streamline the cooking process, making it simpler and more creative.

**View the Live Application:** [https://your-vercel-deployment-url.vercel.app/](https://smart-recipe-generator-l86jodgwb-infinitevoids-projects.vercel.app)

---

## Core Features

* **AI-Powered Recipe Generation**: Employs the Google Gemini API to generate diverse and creative recipes, complete with detailed instructions, nutritional information, and serving sizes.
* **Image-Based Ingredient Recognition**: Allows users to upload a photograph of their ingredients for automatic identification by the AI.
* **Manual Ingredient Entry**: Provides a traditional text-based input field for users to type their ingredients manually.
* **Dietary Customization**: Includes a wide range of dietary options (e.g., Vegan, Keto, Gluten-Free) to tailor recipe suggestions to specific needs.
* **Advanced Recipe Filtering**: Enables users to filter generated recipes by difficulty level (Easy, Medium, Hard) and cooking time.
* **Adjustable Serving Sizes**: In the recipe detail view, users can modify the serving size, and ingredient quantities will update dynamically.
* **Integrated Video Tutorials**: Each recipe includes a link to a relevant YouTube cooking tutorial to enhance the user's cooking experience.
* **Interactive User Interface**: A polished and engaging dark-mode interface featuring a "cooking pot" loading animation and flipping recipe cards for nutritional information.
* **Secure API Key Handling**: The Google Gemini API key is secured and not exposed on the client-side by using a Vercel Serverless Function as a secure proxy.
* **Responsive Design**: The application is fully responsive, providing a seamless experience across all devices, from mobile phones to desktops.

---

## Technical Stack

* **Frontend**: HTML5, CSS3, JavaScript (ESM)
* **Styling**: Tailwind CSS
* **Animations**: GSAP (GreenSock Animation Platform)
* **AI Model**: Google Gemini API
* **Deployment**: Vercel (Static Hosting and Serverless Functions)

---

## Setup and Deployment

To deploy your own instance of this project, please follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/InfiniteVoid07/Smart-Recipe-Generator
    cd Smart-Recipe-Generator
    ```

2.  **Obtain a Google Gemini API Key:**
    * Navigate to the [Google AI Studio](https://aistudio.google.com/).
    * Create a new project and generate an API key.

3.  **Deploy to Vercel:**
    * Register for a free account at [Vercel.com](https://vercel.com), preferably using your GitHub account.
    * Select **"Add New..."** -> **"Project"** and import your cloned GitHub repository.
    * In the project settings, expand the **Environment Variables** section.
    * Add a new variable with the following configuration:
        * **Name**: `API_KEY`
        * **Value**: Paste your Google Gemini API key.
    * Click **"Deploy"**. Vercel will build the site and deploy the serverless function located in the `/api` directory.

---

## Project Structure

The project is organized into distinct files for improved readability and maintainability:

* `index.html`: The main HTML file containing the application's structure.
* `style.css`: Contains all custom CSS rules and animations.
* `script.js`: Manages all front-end logic, UI interactions, and API calls to the serverless function.
* `/api/getRecipes.js`: A Node.js serverless function that runs on Vercel. It receives requests from the front-end, securely appends the API key, calls the Google Gemini API, and returns the response.
