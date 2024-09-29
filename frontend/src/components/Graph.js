import React, { useState, useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import Popup from './Popup';
import { generateNodes, generateEdges } from './graphUtils';

const nodeTypes = {
  custom: CustomNode,
};

const Graph = ({ data }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes(data));
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges(data));
  const [popupData, setPopupData] = useState(null)

  const handleSendToBackend = () => {
    console.log("bitch: ", popupData.content ) ;
  }

  const onNodeClick = useCallback((event, node) => {
    setPopupData(node.data) ;
  }, []) ;

  const closePopup = () => {
    setPopupData(null) ;
  }



  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        style={{ background: '#2c405c' }}
        defaultEdgeOptions={{
          type: 'beziar',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#436e86',
          },
          style: { stroke: '#436e86', strokeWidth: 2 },
        }}
      >
        <Controls />
        <Background color="#aaa" gap={16} />
        {popupData && (
        <Popup
          title={popupData.title}
          content={popupData.content}
          onClose={closePopup}
          onSendToBackend={handleSendToBackend}
        />

      )}
        
      </ReactFlow>
      
    </div>
  );
};

export default Graph;