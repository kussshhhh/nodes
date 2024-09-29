import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }) => {

    const firstLine = data.content ? data.content.split('\n')[0] : '';
    
  return (
    <div className={`p-4 rounded-lg shadow-md ${data.isCompulsory ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 border border-gray-300'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="font-bold mb-2">{data.title}</div>
      <div className="text-sm">{firstLine}</div>
      {data.isCompulsory && (
        <div className="mt-2 text-xs font-semibold text-blue-600">Compulsory</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      
    </div>
  );
};

export default CustomNode;