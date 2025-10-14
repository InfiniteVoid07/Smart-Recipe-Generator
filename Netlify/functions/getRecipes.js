// This function runs on Netlify's servers, not in the browser.
// It can securely access environment variables.

exports.handler = async function(event, context) {
    // Get the data sent from the front-end
    const payload = JSON.parse(event.body);
    
    // Get the secure API key from Netlify's environment variables
    const API_KEY = process.env.API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // If Google's API returns an error, pass it back
            const errorBody = await response.text();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Google API Error: ${errorBody}` })
            };
        }

        const data = await response.json();
        
        // Send the successful response back to the front-end
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        // Handle network errors or other issues
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};