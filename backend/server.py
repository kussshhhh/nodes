from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json

app = Flask(__name__)
CORS(app)

# Configure the Gemini API (you'll need to set up your API key)
genai.configure(api_key='put your api key here')

def load_prompt():
    with open('prompt.txt', 'r') as file:
        return file.read()

def parse_llm_response(response):
    try:
        # Remove code block markers if present
        cleaned_response = response.strip("```json").strip("```").strip()
        # Parse the cleaned response
        return json.loads(cleaned_response)
    except json.JSONDecodeError:
        return {"error": "Failed to parse LLM response as JSON"}

@app.route('/api/learn', methods=['GET'])
def learn_topic():
    topic = request.args.get('topic', '')
    if not topic:
        return jsonify({"error": "No topic provided"}), 400

    prompt_template = load_prompt()
    full_prompt = topic + prompt_template

    # Initialize the Gemini model
    model = genai.GenerativeModel('gemini-pro')

    try:
        # Generate content
        response = model.generate_content(full_prompt)
        
        # Parse the LLM response
        parsed_response = parse_llm_response(response.text)
        
        # Return the full parsed JSON without modification
        return jsonify(parsed_response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)