from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import google.generativeai as genai
import json
import sqlite3
from sqlite3 import Error
import os
from groq import Groq

app = Flask(__name__)
CORS(app)
load_dotenv() 

# Configure the Gemini API
genai.configure(api_key=os.getenv('key'))
   
client = Groq(
        api_key=os.getenv('groq') 
)

def load_prompt():
    with open('prompt.txt', 'r') as file:
        return file.read()

def parse_llm_response(response):
    try:
        cleaned_response = response.strip("```json").strip("```").strip()
        print(f"Cleaned response: {cleaned_response}")  # Added for debugging
        
        return json.loads(cleaned_response)
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e}")  # Log the error message
        return {"error": "Failed to parse LLM response as JSON"}


#@app.route('/api/learn', methods=['GET'])
# def learn_topic():
#     topic = request.args.get('topic', '')
#     if not topic:
#         return jsonify({"error": "No topic provided"}), 400


#     try:

#         prompt_template = load_prompt()
#         full_prompt = topic + prompt_template + "give only the json with no new lines or whitespaces in between just pure compact json amd dont forget edges pls pls pls edges must be there"
#         # model = genai.GenerativeModel('gemini-pro')
#         # response = model.generate_content(full_prompt)
#         #parsed_response = parse_llm_response(response.text)

#         attempt = 0 
#         maxx = 4
#         while attempt < maxx:
#             print(attempt)
#             response = client.chat.completions.create(
#             messages=[
#                 {
#                     "role": "user",
#                     "content": full_prompt
#                 },
#                 {
#                     "role": "assistant",
#                     "content": "```json"
#                 }
#             ],
#                 model="llama-3.1-8b-instant",
#                 temperature=0.7

            
#             )

#             parsed_response = parse_llm_response(str(response.choices[0].message.content))

#             if isinstance(parsed_response, dict): 
#                   response_data = parsed_response
#             else:
#                   print("not a real json")
#                   continue  # Optionally continue to the next attempt






#             print( parsed_response, type(parsed_response))
       

#         # print(parsed_response)
#         # Ensure the parsed response has the correct structure
#         if attempt == maxx:
#             return jsonify({"error": "json not proper"}),500
#         if 'topic' not in parsed_response or 'levels' not in parsed_response:
#             return jsonify({"error": "Invalid response structure from LLM"}), 500

#         # Store the entire response in the database
#         print(parsed_response)
#         return jsonify(parsed_response)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


@app.route('/api/learn', methods=['GET'])
def learn_topic():
    topic = request.args.get('topic', '')
    if not topic:
        return jsonify({"error": "No topic provided"}), 400

    try:
        prompt_template = load_prompt()
        full_prompt = (
            topic + prompt_template + 
            "Remember do add edges to the generated json structure"
        )

        attempt = 0 
        max_attempts = 4
        while attempt < max_attempts:
            print(f"Attempt {attempt}")
            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": full_prompt
                    },
                    {
                        "role": "assistant",
                        "content": "```json"
                    }
                ],
                model="mixtral-8x7b-32768",
                temperature=0.7
            )

            parsed_response = parse_llm_response(str(response.choices[0].message.content))

            # Debugging output
            print(f"Parsed response: {parsed_response}, Type: {type(parsed_response)}")

            # Check if it's a dictionary with errors or valid response
            if isinstance(parsed_response, dict) and 'error' not in parsed_response:
                break  # Exit the loop if it's a valid dictionary

            attempt += 1  # Increment the attempt counter

        # Ensure the parsed response has the correct structure
        if attempt == max_attempts:
            return jsonify({"error": "json not proper"}), 500
        if 'topic' not in parsed_response or 'levels' not in parsed_response:
            return jsonify({"error": "Invalid response structure from LLM"}), 500

        # Return the valid response
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
        
    def get_node_context():
        pass
    

    def generate():
        try:
            # Generate content for the node
            
            model = genai.GenerativeModel('gemini-pro')
            client2 = Groq(api_key=os.getenv('groq'))
            graph_context = "empty"

           # add: in prompt below line after impl graph (adjacent nodes info) context
           # Heres Some context for the node within the graph {graph_context}

            prompt = f"""
            Efficiently explain the following topic in the context of {topic} in markdown:

            Title: {title}
            Brief description: {content}
            markdown format
            Provide a clear and concise explanation that anyone can understand and implement (if relevant). 
            Include key concepts, practical applications, and any important considerations.
            If applicable, provide a simple example or implementation steps.
            leave proper spaces too between paras so its readable
            critical: respond solely in markdown format not anything else
            markdown format
            """
            response = model.generate_content(prompt, stream=True)
            yield json.dumps({"content": content + "\n"}) + "\n" 

            for chunk in response:
                if chunk.text:
                    yield json.dumps({"content": chunk.text}) + "\n"    
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    return Response(stream_with_context(generate()), content_type='application/json')

@app.route('/api/node_question', methods=['POST'])
def node_question():
    data = request.json
    topic = data.get('topic')
    node_id = data.get('node_id')
    question = data.get('question')
    context = data.get('context')

    if not all([topic, node_id, question, context]):
        return jsonify({"error": "Missing required parameters"}), 400


    try:
        
        
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
