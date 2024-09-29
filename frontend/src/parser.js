export function parseGraphToReactFlowElements(graphData) {
    console.log('Parsing graph data:', graphData);
    
    if (!graphData || !graphData.levels) {
      console.error('Invalid graph data structure');
      return [];
    }
  
    let elements = [];
    let yOffset = 0;
  
    graphData.levels.forEach((level, levelIndex) => {
      const levelYOffset = yOffset;
      let xOffset = 0;
  
      // Parse nodes
      if (level.nodes && Array.isArray(level.nodes)) {
        level.nodes.forEach((node, nodeIndex) => {
          if (node.id && node.data) {
            const element = {
              id: node.id,
              type: 'custom',
              position: { x: xOffset, y: levelYOffset },
              data: {
                ...node.data,
                label: node.data.title // React Flow uses 'label' for node text
              }
            };
            elements.push(element);
            console.log('Created node:', element);
  
            xOffset += 200; // Adjust this value for desired horizontal spacing
          }
        });
      }
  
      // Parse edges
      if (level.edges && Array.isArray(level.edges)) {
        level.edges.forEach(edge => {
          if (edge.id && edge.source && edge.target) {
            const element = {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: 'smoothstep',
              animated: true,
              style: { stroke: edge.style?.stroke || '#000000' }
            };
            elements.push(element);
            console.log('Created edge:', element);
          }
        });
      }
  
      yOffset += 150; // Adjust this value for desired vertical spacing between levels
    });
  
    console.log('Total elements created:', elements.length);
    return elements;
  }