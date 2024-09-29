import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyEdgeChanges, 
  applyNodeChanges,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './nd';
import { MermaidParser, parseMermaidToReactFlow} from './MermaidParser'

const nodeTypes = {
  custom: CustomNode,
};

const FlowChart = ({ mermaidString }) => {
  const { nodes: initialNodes, edges: initialEdges } = parseMermaidToReactFlow(mermaidString);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default FlowChart;