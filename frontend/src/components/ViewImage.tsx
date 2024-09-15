import React, { useContext } from 'react';
import { ImageContext } from '../context/Context';

const Preview: React.FC = () => {
  const { previewUrl } = useContext(ImageContext);

  return (
    <div>
      {previewUrl ? (
        <div>
          <h3>Image Preview:</h3>
          <img src={previewUrl} alt="Image Preview" style={{ maxWidth: '100%' }} />
        </div>
      ) : (
        <p>No preview available</p>
      )}
    </div>
  );
};

export default Preview;
