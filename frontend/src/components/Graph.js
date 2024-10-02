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
import { updateNodeContent } from './IndexDBUtils';
const nodeTypes = {
  custom: CustomNode,
};

const Graph = ({ data }) => {
  console.log(data);
  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes(data));
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges(data));
  const [popupData, setPopupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const expandNode = useCallback(async (node) => {
    // If the node is already open, just show the popup with existing content
    if (node.data.isOpen) {
      setPopupData({
        title: node.data.title,
        content: node.data.content,
        nodeId: node.id
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/expand_node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: data.topic,
          node_id: node.id,
          title: node.data.title,
          content: node.data.content
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update the node content in IndexedDB
      await updateNodeContent(data.topic, node.id, result.content);

      setPopupData({
        title: node.data.title,
        content: result.content,
        nodeId: node.id
      });

      // Update the nodes state to reflect the change
      setNodes(nodes.map(n => 
        n.id === node.id 
          ? { ...n, data: { ...n.data, content: result.content, isOpen: true }}
          : n
      ));

    } catch (error) {
      console.error('Error expanding the node', error);
    } finally {
      setIsLoading(false);
    }
  }, [data.topic, nodes, setNodes]);

  const handleSendToBackend = useCallback(async () => {
    if (popupData) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/node_question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: data.topic,
            node_id: popupData.nodeId,
            question: "Tell me more about this topic"
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Backend response:', result);
        setPopupData(prevData => ({
          ...prevData,
          content: prevData.content + '\n\nAdditional information:\n' + result.answer
        }));
      } catch (error) {
        console.error('Error sending question to backend', error);
      }
    }
  }, [data.topic, popupData]);

  const onNodeClick = useCallback((event, node) => {
    expandNode(node);
  }, [expandNode]);

  const closePopup = () => {
    setPopupData(null);
  };

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
        style={{ background: '#000000' }}
        defaultEdgeOptions={{
          type: 'bezier',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#436e86',
          },
          style: { stroke: '#436e86', strokeWidth: 2 },
        }}
      >
        <Controls />
        <Background color="#ff12f0" gap={16} />
        {popupData && (
          <Popup
            title={popupData.title}
            content={popupData.content}
            onClose={closePopup}
            onSendToBackend={handleSendToBackend}
            isLoading={isLoading}
          />
        )}
      </ReactFlow>
    </div>
  );
};

export default Graph;