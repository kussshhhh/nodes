// import { MarkerType } from 'reactflow';

// const nodeWidth = 200;
// const nodeHeight = 100;

// export const generateNodes = (data) => {
//   let nodes = [];
//   let yOffset = 0;

//   data.levels.forEach((level, levelIndex) => {
//     const levelWidth = level.nodes.length * (nodeWidth + 100);
//     let xOffset = -levelWidth / 2;

//     level.nodes.forEach((node) => {
//       nodes.push({
//         id: node.id,
//         position: { x: xOffset, y: yOffset },
//         data: {
//           title: node.data.title,
//           content: node.data.content,
//           isCompulsory: node.data.isCompulsory,
//         },
//         type: 'custom',
//       });
//       xOffset += nodeWidth + 400;
//     });
//     yOffset += nodeHeight + 150;
//   });

//   return nodes;
// };

// export const generateEdges = (data) => {
//   let edges = [];
//   data.levels.forEach((level) => {
//     if (level.edges) {
//       level.edges.forEach((edge) => {
//         edges.push({
//           id: edge.id,
//           source: edge.source,
//           target: edge.target,
//           type: 'bezier',
//           markerEnd: {
//             type: MarkerType.ArrowClosed,
//             color: edge.style?.stroke || '#436e86',
//           },
//           style: { stroke: edge.style?.stroke || '#436e86', strokeWidth: 2 },
//         });
//       });
//     }
//   });
//   return edges;
// };


import { MarkerType } from 'reactflow';

const nodeWidth = 200;
const nodeHeight = 100;

export const generateNodes = (data) => {
  // Add safety checks
  if (!data) {
    console.error('Data is undefined');
    return [];
  }
  
  if (!data.levels || !Array.isArray(data.levels)) {
    console.error('data.levels is undefined or not an array:', data);
    return [];
  }

  let nodes = [];
  let yOffset = 0;
  
  data.levels.forEach((level, levelIndex) => {
    // Add safety check for level.nodes
    if (!level.nodes || !Array.isArray(level.nodes)) {
      console.error(`Level ${levelIndex} nodes is undefined or not an array:`, level);
      return;
    }

    const levelWidth = level.nodes.length * (nodeWidth + 100);
    let xOffset = -levelWidth / 2;
    
    level.nodes.forEach((node) => {
      // Add safety check for node structure
      if (!node || !node.id || !node.data) {
        console.error('Invalid node structure:', node);
        return;
      }

      nodes.push({
        id: node.id,
        position: { x: xOffset, y: yOffset },
        data: {
          title: node.data.title || 'Untitled',
          content: node.data.content || '',
          isCompulsory: node.data.isCompulsory || false,
        },
        type: 'custom',
      });
      xOffset += nodeWidth + 400;
    });
    yOffset += nodeHeight + 150;
  });
  
  return nodes;
};

export const generateEdges = (data) => {
  if (!data || !data.levels) {
    console.error('Data or data.levels is undefined');
    return [];
  }

  let edges = [];
  data.levels.forEach((level, levelIndex) => {
    if (level.edges && Array.isArray(level.edges)) {
      level.edges.forEach((edge) => {
        if (!edge || !edge.id || !edge.source || !edge.target) {
          console.error(`Invalid edge in level ${levelIndex}:`, edge);
          return;
        }

        edges.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'bezier',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edge.style?.stroke || '#436e86',
          },
          style: { stroke: edge.style?.stroke || '#436e86', strokeWidth: 2 },
        });
      });
    }
  });
  
  return edges;
};