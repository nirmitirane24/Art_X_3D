import React, { useState, useEffect } from 'react';
import './ShadowControls.css'; // Import the new CSS file

const ShadowControls = ({ object, updateObject }) => {
    const [castShadow, setCastShadow] = useState(false);
    const [receiveShadow, setReceiveShadow] = useState(false);

    useEffect(() => {
          if (object?.material) {
              setCastShadow(object.material.castShadow || false);
              setReceiveShadow(object.material.receiveShadow || false);
          }
    }, [object]);
    

    const handleCastShadowChange = () => {
      setCastShadow(!castShadow)
      updateObject(object.id, { material: { ...object.material, castShadow: !castShadow } });
    };
    const handleReceiveShadowChange = () => {
        setReceiveShadow(!receiveShadow)
      updateObject(object.id, { material: { ...object.material, receiveShadow: !receiveShadow } });
    };

    return (
        <div className="shadow-controls">
            <h5>Shadows</h5>
              <div className="control-row">
                  <label>Cast</label>
                   <div className='option-buttons'>
                        <button onClick={() => handleCastShadowChange()} className={castShadow ? 'selected' : ''} >Yes</button>
                        <button onClick={() => handleCastShadowChange()} className={!castShadow ? 'selected' : ''}>No</button>
                     </div>
              </div>
            <div className="control-row">
                <label>Receive</label>
               <div className='option-buttons'>
                    <button onClick={() => handleReceiveShadowChange()} className={receiveShadow ? 'selected' : ''} >Yes</button>
                    <button onClick={() => handleReceiveShadowChange()} className={!receiveShadow ? 'selected' : ''}>No</button>
                </div>
            </div>
        </div>
    );
};

export default ShadowControls;