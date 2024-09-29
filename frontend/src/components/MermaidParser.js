import React from 'react';

export const parseMermaidToReactFlow = (mermaidString) => {
  const lines = mermaidString.split('\n').filter(line => line.trim() !== '');
  const nodes = [];
  const edges = [];

  lines.forEach((line, index) => {
    if (line.includes('-->')) {
      // This is an edge
      const [source, target] = line.split('-->').map(s => s.trim());
      edges.push({
        id: `edge_${index}`,
        source: source,
        target: target,
        type: 'smoothstep',
        animated: true,
      });
    } else {
      // This is a node
      const [id, label] = line.split('[').map(s => s.trim());
      const cleanLabel = label ? label.replace(']', '') : id;
      nodes.push({
        id: id,
        type: 'custom',
        data: { 
          label: cleanLabel,
          root: index === 0 // Set the first node as root
        },
        position: { x: Math.random() * 800, y: Math.random() * 600 }, // Random initial positions
        draggable: true,
      });
    }
  });

  return { nodes, edges };
};

const MermaidParser = ({ mermaidString }) => {
  const { nodes, edges } = parseMermaidToReactFlow(mermaidString);

  return (
    <div>
      <h2>Parsed Mermaid Diagram</h2>
      <h3>Nodes:</h3>
      <pre>{JSON.stringify(nodes, null, 2)}</pre>
      <h3>Edges:</h3>
      <pre>{JSON.stringify(edges, null, 2)}</pre>
    </div>
  );
};

export default MermaidParser;