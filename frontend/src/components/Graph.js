import React, { useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import { generateNodes, generateEdges } from './graphUtils';

const nodeTypes = {
  custom: CustomNode,
};

const Graph = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes(data));
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges(data));

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: '#f0f0f0' }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#436e86',
          },
          style: { stroke: '#436e86', strokeWidth: 2 },
        }}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default Graph;