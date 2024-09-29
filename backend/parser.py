import json

class RoadmapParser:
    def __init__(self, json_data):
        self.data = json_data
        self.mermaid_lines = []
        self.node_counter = {}  # To keep track of node numbers for each level

    def get_node_id(self, level, original_id):
        # Use original IDs directly as they seem well-formatted in your JSON
        return original_id

    def add_class_definitions(self):
        self.mermaid_lines.append("classDef default fill:#f9f,stroke:#333,stroke-width:2px;")
        self.mermaid_lines.append("classDef alternative fill:#ccf,stroke:#333,stroke-width:1px;")
        self.mermaid_lines.append("classDef assignment fill:#fcc,stroke:#333,stroke-width:2px;")

    def generate_mermaid(self):
        self.mermaid_lines.append("graph TD")
        
        levels = self.data["graph"]["levels"]
        all_nodes = {}  # Keep track of all nodes for connecting levels
        
        # First pass: Create all nodes
        for level in levels:
            level_num = level["level"]
            for node in level["nodes"]:
                node_id = node["id"]
                content = node["content"]
                all_nodes[node_id] = {
                    "level": level_num,
                    "type": node["type"],
                    "content": content
                }
                self.mermaid_lines.append(f'    {node_id}["{content}"]')

        # Second pass: Create connections
        for level in levels:
            level_num = level["level"]
            if level_num == 0:
                continue  # Skip root level for connections
                
            for node in level["nodes"]:
                node_id = node["id"]
                # Connect to prerequisites or to all nodes in previous level if no prerequisites specified
                prerequisites = node["longDescription"].get("prerequisites", [])
                
                if prerequisites:
                    for prereq in prerequisites:
                        if node["type"] == "compulsory":
                            self.mermaid_lines.append(f"    {prereq} --> {node_id}")
                        else:
                            self.mermaid_lines.append(f"    {prereq} -.-> {node_id}")
                else:
                    # Connect to all nodes in previous level
                    for prev_node_id, prev_node in all_nodes.items():
                        if prev_node["level"] == level_num - 1:
                            if node["type"] == "compulsory":
                                self.mermaid_lines.append(f"    {prev_node_id} --> {node_id}")
                            else:
                                self.mermaid_lines.append(f"    {prev_node_id} -.-> {node_id}")

        # Add styling
        self.add_class_definitions()
        for node_id, node in all_nodes.items():
            if node["type"] == "non-compulsory":
                self.mermaid_lines.append(f"class {node_id} alternative;")

        return "\n".join(self.mermaid_lines)

def parse_roadmap(json_file_path):
    try:
        # If json_file_path is already a dictionary, use it directly
        if isinstance(json_file_path, dict):
            json_data = json_file_path
        else:
            with open(json_file_path, 'r') as file:
                json_data = json.load(file)
        
        parser = RoadmapParser(json_data)
        return parser.generate_mermaid()
    except Exception as e:
        print(f"Error parsing roadmap: {e}")
        return None

# Example usage
json_data = {
  "graph": {
    "levels": [
      {
        "level": 0,
        "nodes": [
          {
            "id": "root",
            "type": "compulsory",
            "content": "Distributed Systems Overview",
            "longDescription": {
              "description": "Introduction to distributed systems, their benefits, and challenges.",
              "importance": "Understanding the fundamentals of distributed systems is crucial for building scalable and reliable applications."
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
            "content": "Distributed System Architectures",
            "longDescription": {
              "details": "Exploring different distributed system architectures, such as client-server, peer-to-peer, and cloud-based systems.",
              "prerequisites": [],
              "timeEstimate": "3 hours",
              "learningOutcome": "Understanding the strengths and weaknesses of different architectural approaches.",
              "resources": [
                "https://www.nginx.com/resources/glossary/distributed-system-architecture/"
              ]
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
            "content": "Consistency and Replication",
            "longDescription": {
              "details": "Understanding data consistency and replication techniques in distributed systems.",
              "prerequisites": [
                "A"
              ],
              "timeEstimate": "4 hours",
              "learningOutcome": "Knowing how to ensure data integrity and availability in a distributed environment.",
              "resources": [
                "https://www.oreilly.com/library/view/data-consistency-in/9781492046328/"
              ]
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
            "content": "Concurrency and Fault Tolerance",
            "longDescription": {
              "details": "Learning about concurrency control and fault tolerance mechanisms in distributed systems.",
              "prerequisites": [
                "B"
              ],
              "timeEstimate": "5 hours",
              "learningOutcome": "Understanding how to handle concurrency and failures in a distributed system.",
              "resources": [
                "https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-2015-16.pdf"
              ]
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
            "content": "Distributed Transactions",
            "longDescription": {
              "details": "Exploring distributed transaction concepts, protocols, and challenges.",
              "prerequisites": [
                "C"
              ],
              "timeEstimate": "4 hours",
              "learningOutcome": "Understanding how to manage transactions across multiple systems.",
              "resources": [
                "https://docs.microsoft.com/en-us/azure/architecture/best-practices/transactions"
              ]
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
            "content": "Distributed Messaging and Queuing",
            "longDescription": {
              "details": "Learning about different distributed messaging and queuing technologies for communication and coordination.",
              "prerequisites": [
                "D"
              ],
              "timeEstimate": "5 hours",
              "learningOutcome": "Understanding how to implement asynchronous communication and message-based architectures.",
              "resources": [
                "https://aws.amazon.com/products/managed-messaging/"
              ]
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
            "content": "Distributed Consensus Algorithms",
            "longDescription": {
              "details": "Exploring consensus algorithms, such as Paxos and Raft, for achieving agreement in distributed systems.",
              "prerequisites": [
                "E"
              ],
              "timeEstimate": "4 hours",
              "learningOutcome": "Understanding how distributed systems can reach a consensus on critical decisions.",
              "resources": [
                "https://raft.github.io/raft.pdf"
              ]
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
            "content": "Building Distributed Applications",
            "longDescription": {
              "details": "Applying the concepts learned to design and build distributed applications.",
              "prerequisites": [
                "F"
              ],
              "timeEstimate": "6 hours",
              "learningOutcome": "Gaining hands-on experience in developing distributed systems.",
              "resources": [
                "https://www.udacity.com/school-of-cloud-computing/nanodegree/nd023"
              ]
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
            "content": "Distributed Systems Pitfalls and Best Practices",
            "longDescription": {
              "details": "Exploring common pitfalls and best practices in designing and implementing distributed systems.",
              "prerequisites": [
                "G"
              ],
              "timeEstimate": "3 hours",
              "learningOutcome": "Learning from real-world experiences and industry recommendations.",
              "resources": [
                "https://blog.acolyer.org/2016/03/28/distributed-system-gotchas/"
              ]
            }
          },
          {
            "id": "HA",
            "type": "assignment",
            "content": "Distributed Systems Design and Implementation Project",
            "longDescription": {
              "details": "Designing and implementing a distributed system project.",
              "whenToUse": "To apply the concepts learned and build a practical system.",
              "expectedOutcome": "A working distributed system demonstrating theoretical knowledge and practical skills."
            }
          }
        ]
      }
    ]
  }
}

mermaid_diagram = parse_roadmap(json_data)
print(mermaid_diagram)