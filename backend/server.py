from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import sqlite3
from sqlite3 import Error
import os
app = Flask(__name__)
CORS(app)
load_dotenv() 

# Configure the Gemini API
genai.configure(api_key=os.getenv('key'))
   


def load_prompt():
    with open('prompt.txt', 'r') as file:
        return file.read()

def parse_llm_response(response):
    try:
        cleaned_response = response.strip("```json").strip("```").strip()
        return json.loads(cleaned_response)
    except json.JSONDecodeError:
        return {"error": "Failed to parse LLM response as JSON"}

@app.route('/api/learn', methods=['GET'])
def learn_topic():
    topic = request.args.get('topic', '')
    if not topic:
        return jsonify({"error": "No topic provided"}), 400


    try:

        prompt_template = load_prompt()
        full_prompt = topic + prompt_template
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(full_prompt)
        parsed_response = parse_llm_response(response.text)

        # Ensure the parsed response has the correct structure
        if 'topic' not in parsed_response or 'levels' not in parsed_response:
            return jsonify({"error": "Invalid response structure from LLM"}), 500

        # Store the entire response in the database
        print(parsed_response)
        return jsonify(parsed_response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/expand_node', methods=['POST'])
def expand_node():
    print(request.json)
    data = request.json
    topic = data.get('topic')
    node_id = data.get('node_id')
    title = data.get('title')
    content = data.get('content') 
    text  = topic + " " + node_id + " " + " " + content
    print(title) 
    print(text) 



    if not all([topic, node_id, title, content]):
        return jsonify({"error": "Missing required parameters"}), 400
    


    try:
        # Generate content for the node
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Efficiently explain the following topic in the context of {topic} in markdown:
    
        Title: {title}
        Brief description: {content}
        markdown format
        Provide a clear and concise explanation that anyone can understand and implement (if relevant). 
        Include key concepts, practical applications, and any important considerations.
        If applicable, provide a simple example or implementation steps.

        critical: respond solely in markdown format not anything else
        markdown format
        """
        response = model.generate_content(prompt)
        generated_content = response.text
        generated_content = content + "\n" + generated_content
        print(generated_content)

        return jsonify({"content": generated_content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/node_question', methods=['POST'])
def node_question():
    data = request.json
    topic = data.get('topic')
    node_id = data.get('node_id')
    question = data.get('question')

    if not all([topic, node_id, question]):
        return jsonify({"error": "Missing required parameters"}), 400


    try:
        
        chat_history = json.loads(chat_history)

        for message in chat_history:
            if message['type'] != 'null':
                context += f"{message['type'].capitalize()}: {message['content']}\n"
        context += f"\nUser: {question}\nAssistant:"

        # Generate response
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(context)
        answer = response.text

        # Save question and answer to chat history
      

        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)