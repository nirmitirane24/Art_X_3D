import React, { useState, useEffect } from 'react';
import './visibilityControls.css'; // Import the new CSS file

const VisibilityControls = ({ object, updateObject }) => {
  const [wireframe, setWireframe] = useState(false);
  const [flatShading, setFlatShading] = useState(false);
  const [selectedSide, setSelectedSide] = useState('front');
    
  useEffect(() => {
      if (object?.material){
           setWireframe(object.material.wireframe || false);
           setFlatShading(object.material.flatShading || false);
          setSelectedSide(object.material.side || 'front')
      }
  }, [object]);


    const handleWireframeChange = () => {
        setWireframe(!wireframe)
        updateObject(object.id, { material: { ...object.material, wireframe: !wireframe } });
    };
 
    const handleFlatShadingChange = () => {
        setFlatShading(!flatShading);
         updateObject(object.id, { material: { ...object.material, flatShading: !flatShading } });
    };
     const handleSideChange = (side) => {
          setSelectedSide(side)
        updateObject(object.id, { material: { ...object.material, side: side } });
    };


  return (
      <div className="visibility-controls">
          <h5>Visibility</h5>
          <div className="control-row">
             <div className='label-container'> <label>Wireframe</label></div>
             <div className='option-buttons'>
                    <button onClick={() => handleWireframeChange()} className={wireframe ? 'selected' : ''} >Show</button>
                    <button onClick={() => handleWireframeChange()} className={!wireframe ? 'selected' : ''}>Hide</button>
                </div>
          </div>
          <div className="control-row">
            <div className='label-container'><label>Flat</label></div>
               <div className='option-buttons'>
                    <button onClick={() => handleFlatShadingChange()} className={flatShading ? 'selected' : ''}>Yes</button>
                    <button onClick={() => handleFlatShadingChange()} className={!flatShading ? 'selected' : ''}>No</button>
                </div>
          </div>
         <div className="control-row">
               <div className='label-container'><label>Sides</label></div>
           <div className="side-buttons-container">
              <button
                    className={selectedSide === "double" ? 'selected' : ''}
                    onClick={() => handleSideChange("double")}
                >
                    Both
                </button>
                <button
                    className={selectedSide === "front" ? 'selected' : ''}
                    onClick={() => handleSideChange("front")}
                >
                    Down
                </button>
                <button
                     className={selectedSide === "back" ? 'selected' : ''}
                     onClick={() => handleSideChange("back")}
                >
                    Top
               </button>
              </div>
         </div>
      </div>
  );
};

export default VisibilityControls;