// This is the Vercel-compatible serverless function format.

export default async function handler(request, response) {
    // Get the data sent from the front-end
    const payload = request.body;
    
    // Get the secure API key from Vercel's environment variables
    const API_KEY = process.env.API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    try {
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            // Send an error response back to the front-end
            return response.status(apiResponse.status).json({ error: `Google API Error: ${errorBody}` });
        }

        const data = await apiResponse.json();
        
        // Send the successful response back to the front-end
        return response.status(200).json(data);

    } catch (error) {
        // Handle network errors
        return response.status(500).json({ error: error.message });
    }
}