import { MarkerType } from 'reactflow';

const nodeWidth = 200;
const nodeHeight = 100;

export const generateNodes = (data) => {
  let nodes = [];
  let yOffset = 0;

  data.levels.forEach((level, levelIndex) => {
    const levelWidth = level.nodes.length * (nodeWidth + 100);
    let xOffset = -levelWidth / 2;

    level.nodes.forEach((node) => {
      nodes.push({
        id: node.id,
        position: { x: xOffset, y: yOffset },
        data: {
          title: node.data.title,
          content: node.data.content,
          isCompulsory: node.data.isCompulsory,
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
  let edges = [];
  data.levels.forEach((level) => {
    if (level.edges) {
      level.edges.forEach((edge) => {
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