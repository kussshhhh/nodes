// indexDBUtils.js
const DB_NAME = 'LearningGraphDB';
const STORE_NAME = 'graphs';
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'topic' });
      }
    };
  });
};

export const saveGraph = async (topic, graphData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ topic, ...graphData });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getGraph = async (topic) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(topic);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateNodeContent = async (topic, nodeId, newContent, isOpen = true) => {
  const db = await initDB();
  return new Promise(async (resolve, reject) => {
    const graph = await getGraph(topic);
    if (!graph) {
      reject(new Error('Graph not found'));
      return;
    }

    // Update the node content and isOpen status
    graph.levels.forEach(level => {
      level.nodes.forEach(node => {
        if (node.id === nodeId) {
          node.data.content = newContent;
          node.data.isOpen = isOpen;
        }
      });
    });

    // Save the updated graph
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(graph);

    request.onsuccess = () => resolve(graph);
    request.onerror = () => reject(request.error);
  });
};


export const getAllGraphTopics = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    
    request.onsuccess = () => {
      const topics = request.result;
      resolve(topics);
    };
    
    request.onerror = () => reject(request.error);
  });
};