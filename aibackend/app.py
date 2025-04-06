import logging
import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

# Gemini API Configuration
GOOGLE_API_KEY = ""  # Replace with your actual API key
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")  # More descriptive error

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Read documentation from docs.txt
DOCS_PATH = "docs.txt"
if os.path.exists(DOCS_PATH):
    with open(DOCS_PATH, "r", encoding="utf-8") as file:
        DOCUMENTATION = file.read()
else:
    DOCUMENTATION = "Documentation file not found."  # Handle missing file gracefully
    logging.error("Documentation file (docs.txt) not found.") # Log if docs are missing

def ask_ai(query):
    """Constructs the prompt, sends it to Gemini, and returns the AI's response."""
    prompt = f"""You are an AI assistant for a 3D editor application called ArtX3D.  
    Use the following documentation to answer user questions.  If the user
    asks a question that is not covered by the documentation, *politely* state that you cannot
    answer it.  

    If someone greets you ("Hi," "Hello," or any type of greeting), greet them back.

    If someone asks to give the full/whole document, *do not* give it.  Instead, ask the user
    which specific part they have questions about, and answer those queries.

    If the user asks if there are other apps or web apps related to 3D editing,
    respond that while there are many other options available, such as Blender,
    Spline, and others, ArtX3D is specifically designed to be user-friendly and
    accessible for non-professionals and beginners who are passionate about 3D
    design. ArtX3D stands out with its intuitive features and integrated AI
    assistant, which are not commonly found in other 3D applications, making it an
    excellent choice for those just starting their 3D journey.

    The creators of ArtX3D are Pranav Patil (21101B0051), Aniket Mahajan (21101B0059), and
    Nirmiti Rane (21101B0073).
    Do not start with "The documentation says...","ArtX3D documentation says...","To do this/that in ArtX3D" etc.
    Answer as if you're in a conversation. Do *not* include/use special characters or formatting
    that makes the response look like anything other than a normal chat.  Do not provide
    the entire documentation unprompted. 

    [Documentation BEGIN]
    {DOCUMENTATION}
    [Documentation END]

    User Query: {query}
    """

    logging.debug(f"Prompt being sent to Gemini:\n{prompt}")  # Log the prompt

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logging.exception(f"Error during Gemini API call: {e}")  # Log the exception
        return "An error occurred while processing your request.  Please try again later."  # More user-friendly error


@app.route('/api/ask', methods=['POST'])
def api_ask():
    """API endpoint to receive user queries and return AI responses."""
    try:
        data = request.get_json()
        # More robust error handling for request data
        if not data:
            logging.error("No data received in request.  Check Content-Type header.")
            return jsonify({"error": "No data received.  Please send a JSON payload with a 'query' field."}), 400
        if not isinstance(data, dict):
            logging.error(f"Invalid data type received: {type(data)}. Expected a dictionary.")
            return jsonify({"error": "Invalid data format.  Please send a JSON object."}), 400
        user_query = data.get('query')

        if not user_query:
            return jsonify({"error": "Query is required"}), 400
        if not isinstance(user_query, str):
            return jsonify({"error": "Query must be a string"}), 400

        ai_response = ask_ai(user_query)
        return jsonify({"response": ai_response})

    except Exception as e:
        logging.exception(f"Error processing request: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True)  # Use debug=True during development