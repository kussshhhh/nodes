import google.generativeai as genai
import json
import os
from typing import Dict, Any

class RoadmapGenerator:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        
        # Loading our carefully crafted prompt
        self.base_prompt = '''You are an expert educator and technical architect. Generate a structured, efficient learning roadmap for the topic I provide. Return ONLY valid JSON without any surrounding text or explanation. The JSON must follow this exact structure and guidelines:

1. The roadmap should have a linear progression: each level should only connect to the next level (e.g., level 1 to 2, 2 to 3, etc.). Do not create connections between non-adjacent levels.

2. Include 8-10 main levels (excluding level 0).

3. Each level should have 1-2 compulsory nodes and 0-2 non-compulsory nodes (alternatives or assignments).

4. Focus on practical, industry-standard approaches.

5. Ensure fundamentals are thoroughly covered before advancing.

6. Make the path efficient - include only what's necessary for a solid understanding and practical implementation.

7. Consider dependencies between concepts, common pitfalls, industry best practices, and balance between theory and application.

The JSON structure must be:

{
  "graph": {
    "levels": [
      {
        "level": 0,
        "nodes": [
          {
            "id": "root",
            "type": "compulsory",
            "content": "Topic Name",
            "longDescription": {
              "description": "Overview of what this topic encompasses",
              "importance": "Why this topic is important to learn"
            }
          }
        ]
      },
      {
        "level": 1-N,
        "nodes": [
          {
            "id": "unique-identifier",
            "type": "compulsory",
            "content": "Main concept to learn",
            "longDescription": {
              "details": "What this concept covers",
              "prerequisites": ["List", "of", "prerequisites"],
              "timeEstimate": "X hours",
              "learningOutcome": "What you'll be able to do after this",
              "resources": ["Recommended", "learning", "resources"]
            }
          },
          {
            "id": "alt-unique-identifier",
            "type": "alternative/assignment",
            "content": "Alternative approach or assignment",
            "longDescription": {
              "details": "What this covers",
              "whenToUse": "When to explore this alternative or do this assignment",
              "expectedOutcome": "What you'll learn or demonstrate"
            }
          }
        ]
      }
    ]
  }
}

DO NOT include any explanatory text outside the JSON structure. The output must be valid JSON that can be parsed programmatically.

Example of a valid output (for authentication):

{
  "graph": {
    "levels": [
      {
        "level": 0,
        "nodes": [
          {
            "id": "root",
            "type": "compulsory",
            "content": "Authentication Overview",
            "longDescription": {
              "description": "A high-level overview of what authentication is and why it's essential.",
              "importance": "Authentication is critical to secure applications by ensuring that users are who they claim to be."
            }
          }
        ]
      },
      {
        "level": 1,
        "nodes": [
          {
            "id": "A",
            "type": "compulsory",
            "content": "Authentication Basics",
            "longDescription": {
              "details": "Learn the fundamental concepts of authentication.",
              "prerequisites": [],
              "timeEstimate": "2 hours",
              "learningOutcome": "Understand the basic principles of authentication.",
              "resources": ["https://auth0.com/docs/authentication"]
            }
          }
        ]
      },
      {
        "level": 2,
        "nodes": [
          {
            "id": "B",
            "type": "compulsory",
            "content": "HTTP Authentication",
            "longDescription": {
              "details": "Understand HTTP authentication mechanisms like Basic and Digest auth.",
              "prerequisites": ["A"],
              "timeEstimate": "2 hours",
              "learningOutcome": "Know how to implement HTTP authentication.",
              "resources": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication"]
            }
          },
          {
            "id": "BA",
            "type": "assignment",
            "content": "Implement Basic Auth",
            "longDescription": {
              "details": "Set up and test Basic Authentication on an HTTP server.",
              "whenToUse": "When practicing authentication mechanisms.",
              "expectedOutcome": "You will have implemented a working Basic Auth flow."
            }
          }
        ]
      },
      {
        "level": 3,
        "nodes": [
          {
            "id": "C",
            "type": "compulsory",
            "content": "Token-based Authentication",
            "longDescription": {
              "details": "Understand the concept of token-based authentication.",
              "prerequisites": ["B"],
              "timeEstimate": "3 hours",
              "learningOutcome": "Learn how token-based authentication differs from session-based.",
              "resources": ["https://auth0.com/docs/tokens"]
            }
          },
          {
            "id": "C1",
            "type": "alternative",
            "content": "Session-based Authentication",
            "longDescription": {
              "details": "Learn about session-based authentication.",
              "whenToUse": "When comparing token and session-based authentication.",
              "expectedOutcome": "Understand how sessions are used to maintain state."
            }
          }
        ]
      },
      {
        "level": 4,
        "nodes": [
          {
            "id": "D",
            "type": "compulsory",
            "content": "JSON Web Tokens (JWT)",
            "longDescription": {
              "details": "Learn about JWTs, a popular token format for authentication.",
              "prerequisites": ["C"],
              "timeEstimate": "4 hours",
              "learningOutcome": "Learn how to create and verify JWTs.",
              "resources": ["https://jwt.io/introduction/"]
            }
          },
          {
            "id": "DA",
            "type": "assignment",
            "content": "Create and Verify JWTs",
            "longDescription": {
              "details": "Practice creating and verifying JWTs in your application.",
              "whenToUse": "After learning about JWTs.",
              "expectedOutcome": "You will have a hands-on experience with JWTs."
            }
          }
        ]
      },
      {
        "level": 5,
        "nodes": [
          {
            "id": "E",
            "type": "compulsory",
            "content": "OAuth 2.0 Concepts",
            "longDescription": {
              "details": "Learn the basics of OAuth 2.0, a widely used authorization framework.",
              "prerequisites": ["D"],
              "timeEstimate": "5 hours",
              "learningOutcome": "Understand how OAuth 2.0 is used for delegated access.",
              "resources": ["https://oauth.net/2/"]
            }
          },
          {
            "id": "E1",
            "type": "alternative",
            "content": "Basic Authentication",
            "longDescription": {
              "details": "Review the Basic Authentication mechanism as a simpler alternative.",
              "whenToUse": "When a more straightforward mechanism is sufficient.",
              "expectedOutcome": "Understand when Basic Auth can be a suitable option."
            }
          }
        ]
      },
      {
        "level": 6,
        "nodes": [
          {
            "id": "F",
            "type": "compulsory",
            "content": "Implementing OAuth with Google",
            "longDescription": {
              "details": "Learn how to implement OAuth 2.0 with Google as the identity provider.",
              "prerequisites": ["E"],
              "timeEstimate": "4 hours",
              "learningOutcome": "Successfully integrate OAuth 2.0 with Google into your app.",
              "resources": ["https://developers.google.com/identity/protocols/oauth2"]
            }
          },
          {
            "id": "F1",
            "type": "alternative",
            "content": "Custom JWT Implementation",
            "longDescription": {
              "details": "Learn how to implement custom JWT handling in your system.",
              "whenToUse": "When OAuth isn't required but you need custom JWT handling.",
              "expectedOutcome": "You will have a working custom JWT implementation."
            }
          },
          {
            "id": "FA",
            "type": "assignment",
            "content": "Set up Google OAuth",
            "longDescription": {
              "details": "Set up OAuth using Google as the identity provider.",
              "whenToUse": "When practicing OAuth 2.0 implementations.",
              "expectedOutcome": "You will have a working OAuth flow."
            }
          }
        ]
      },
      {
        "level": 7,
        "nodes": [
          {
            "id": "G",
            "type": "compulsory",
            "content": "Secure Storage and Transmission",
            "longDescription": {
              "details": "Learn how to securely store and transmit tokens.",
              "prerequisites": ["F"],
              "timeEstimate": "3 hours",
              "learningOutcome": "Understand best practices for securing tokens.",
              "resources": ["https://auth0.com/docs/best-practices/security-best-practices"]
            }
          }
        ]
      },
      {
        "level": 8,
        "nodes": [
          {
            "id": "H",
            "type": "compulsory",
            "content": "Refresh Tokens",
            "longDescription": {
              "details": "Learn how refresh tokens work and how to implement them.",
              "prerequisites": ["G"],
              "timeEstimate": "2 hours",
              "learningOutcome": "Understand how to implement refresh tokens for long-lived sessions.",
              "resources": ["https://auth0.com/docs/tokens/refresh-tokens"]
            }
          },
          {
            "id": "HA",
            "type": "assignment",
            "content": "Implement Refresh Token Flow",
            "longDescription": {
              "details": "Practice implementing the refresh token flow in your application.",
              "whenToUse": "When managing long-lived authentication sessions.",
              "expectedOutcome": "You will have a fully implemented refresh token flow."
            }
          }
        ]
      },
      {
        "level": 9,
        "nodes": [
          {
            "id": "I",
            "type": "compulsory",
            "content": "Two-Factor Authentication",
            "longDescription": {
              "details": "Learn how to implement two-factor authentication (2FA) in your application.",
              "prerequisites": ["H"],
              "timeEstimate": "3 hours",
              "learningOutcome": "Understand how to add an extra layer of security to your application.",
              "resources": ["https://authy.com/guides/two-factor-authentication/"]
            }
          },
          {
            "id": "IA",
            "type": "assignment",
            "content": "Add 2FA to Your Auth System",
            "longDescription": {
              "details": "Practice adding 2FA to an authentication system.",
              "whenToUse": "When enhancing the security of your application.",
              "expectedOutcome": "You will have a 2FA system integrated into your application."
            }
          }
        ]
      },
      {
        "level": 10,
        "nodes": [
          {
            "id": "J",
            "type": "compulsory",
            "content": "Security Best Practices",
            "longDescription": {
              "details": "Learn about the best practices to secure your authentication system.",
              "prerequisites": ["I"],
              "timeEstimate": "4 hours",
              "learningOutcome": "Understand key security practices to protect authentication flows.",
              "resources": ["https://owasp.org/www-project-top-ten/"]
            }
          },
          {
            "id": "JA",
            "type": "assignment",
            "content": "Final Project: Full Secure Auth System",
            "longDescription": {
              "details": "Build a complete, secure authentication system with all the features learned.",
              "whenToUse": "At the end of your learning journey.",
              "expectedOutcome": "You will have a fully functional and secure authentication system."
            }
          }
        ]
      }
    ]
  }
}

CRITICAL: Return ONLY the JSON. Do not include any other text, explanations, or formatting.'''

    def generate_roadmap(self, topic: str) -> Dict[str, Any]:
        """Generate a learning roadmap for the given topic."""
        try:
            prompt = f"{self.base_prompt}\n\nGenerate a learning roadmap for: {topic}"
            response = self.model.generate_content(prompt)
            
            # Extract and parse JSON from response
            try:
                cleaned_response = response.text.strip("```json").strip("```").strip()
                roadmap_json = json.loads(cleaned_response)
                return roadmap_json
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON: {e}")
                print("Raw response:", response.text)
                return None
                
        except Exception as e:
            print(f"Error generating roadmap: {e}")
            return None


    def save_roadmap(self, roadmap: Dict[str, Any], filename: str):
          """Save the roadmap to a JSON file."""
          try:
              # Check the current working directory
              print(f"Saving roadmap in: {os.getcwd()}")
              
              with open(filename, 'w') as f:
                  json.dump(roadmap, f, indent=2)
              print(f"Roadmap saved to {filename}")
          except Exception as e:
              print(f"Error saving roadmap: {e}")
              print(f"Full error details: {repr(e)}")


def main():
    # Get API key from environment variable
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("Please set the GEMINI_API_KEY environment variable")
        return

    generator = RoadmapGenerator(api_key)
    
    # Get topic from user
    topic = input("Enter the topic you want to learn: ")
    
    # Generate roadmap
    roadmap = generator.generate_roadmap(topic)
    
    if roadmap:
        # Save roadmap to file
        filename = f"{topic.lower().replace(' ', '_')}_roadmap.json"
        generator.save_roadmap(roadmap, filename)
        
        # Pretty print the roadmap
        print("\nGenerated Roadmap:")
        print(json.dumps(roadmap, indent=2))

if __name__ == "__main__":
    main()