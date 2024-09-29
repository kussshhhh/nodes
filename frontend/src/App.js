import React from 'react';
import Graph from "./components/Graph";
import graphData from './test1.json';
import MainPage from './components/MainPage'; 
const App = () => {
  return (
    <MainPage/>
    // <div className="app-container">
    //   {/* <h1 className="text-2xl font-bold mb-4">Graph Visualization</h1> */}
    //   <div className="graph-wrapper" style={{ width: '100%', height: '600px' }}>
    //     <Graph data={graphData} />
    //   </div>
    // </div>
  );
};

export default App;