from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import sqlite3
from sqlite3 import Error

app = Flask(__name__)
CORS(app)

# Configure the Gemini API
genai.configure(api_key='AIzaSyAIsm5MAy8X9ZCffr652pWn17sjAvma6pE')

def create_connection():
    conn = None
    try:
        conn = sqlite3.connect('learning_paths.db')
        return conn
    except Error as e:
        print(e)
    return conn

def create_tables(conn):
    try:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS learning_paths (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT NOT NULL UNIQUE,
                data JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS node_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                learning_path_id INTEGER NOT NULL,
                node_id TEXT NOT NULL,
                title TEXT NOT NULL,
                generated_content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id),
                UNIQUE (learning_path_id, node_id)
            )
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS node_chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                node_content_id INTEGER NOT NULL,
                message_type TEXT NOT NULL,
                message_content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (node_content_id) REFERENCES node_content(id)
            )
        ''')
        conn.commit()
    except Error as e:
        print(e)

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

    conn = create_connection()
    if conn is None:
        return jsonify({"error": "Cannot connect to database"}), 500

    try:
        c = conn.cursor()
        c.execute("SELECT data FROM learning_paths WHERE topic = ?", (topic,))
        result = c.fetchone()

        if result:
            return jsonify(json.loads(result[0]))

        prompt_template = load_prompt()
        full_prompt = topic + prompt_template
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(full_prompt)
        parsed_response = parse_llm_response(response.text)

        # Ensure the parsed response has the correct structure
        if 'topic' not in parsed_response or 'levels' not in parsed_response:
            return jsonify({"error": "Invalid response structure from LLM"}), 500

        # Store the entire response in the database
        c.execute("INSERT INTO learning_paths (topic, data) VALUES (?, ?)",
                  (topic, json.dumps(parsed_response)))
        conn.commit()

        return jsonify(parsed_response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

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
    print("cake")
    conn = create_connection()
    if conn is None:
        return jsonify({"error": "Cannot connect to database"}), 500
    print("db")

    # return jsonify({"content": "Node expanded!"})
    


    try:
        c = conn.cursor()
        c.execute("SELECT id FROM learning_paths WHERE topic = ?", (topic,))
        learning_path_id = c.fetchone()
        print("heh")
        # if not learning_path_id:
        #     return jsonify({"error": "Learning path not found"}), 404

        # c.execute("SELECT generated_content FROM node_content WHERE learning_path_id = ? AND node_id = ?",
        #           (learning_path_id[0], node_id))
        # existing_content = c.fetchone()

        # if existing_content:
        #     return jsonify({"content": existing_content[0]})
        print("lfg")
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
        # c.execute('''
        #     INSERT INTO node_content (learning_path_id, node_id, title, generated_content)
        #     VALUES (?, ?, ?, ?)
        # ''', (learning_path_id[0], node_id, title, generated_content))
        # conn.commit()

        return jsonify({"content": generated_content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/node_question', methods=['POST'])
def node_question():
    data = request.json
    topic = data.get('topic')
    node_id = data.get('node_id')
    question = data.get('question')

    if not all([topic, node_id, question]):
        return jsonify({"error": "Missing required parameters"}), 400

    conn = create_connection()
    if conn is None:
        return jsonify({"error": "Cannot connect to database"}), 500

    try:
        c = conn.cursor()
        c.execute('''
            SELECT nc.id, nc.generated_content, 
                   json_group_array(json_object('type', nch.message_type, 'content', nch.message_content)) as chat_history
            FROM node_content nc
            LEFT JOIN node_chat_history nch ON nc.id = nch.node_content_id
            WHERE nc.learning_path_id = (SELECT id FROM learning_paths WHERE topic = ?)
            AND nc.node_id = ?
            GROUP BY nc.id
        ''', (topic, node_id))
        result = c.fetchone()

        if not result:
            return jsonify({"error": "Node content not found"}), 404

        node_content_id, generated_content, chat_history = result
        chat_history = json.loads(chat_history)

        context = f"Topic: {topic}\nNode Content: {generated_content}\n\nChat History:\n"
        for message in chat_history:
            if message['type'] != 'null':
                context += f"{message['type'].capitalize()}: {message['content']}\n"
        context += f"\nUser: {question}\nAssistant:"

        # Generate response
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(context)
        answer = response.text

        # Save question and answer to chat history
        c.execute('''
            INSERT INTO node_chat_history (node_content_id, message_type, message_content)
            VALUES (?, ?, ?), (?, ?, ?)
        ''', (node_content_id, 'user', question, node_content_id, 'assistant', answer))
        conn.commit()

        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    conn = create_connection()
    if conn is not None:
        create_tables(conn)
        conn.close()
    app.run(debug=True)