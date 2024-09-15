import React from 'react';
import UploadController from './components/UploadController';
import ViewImage from './components/ViewImage';
import { ImageProvider } from './context/Context';

const App: React.FC = () => {
  return (
    <ImageProvider>
      <div>
        <UploadController />
        {/* <ViewImage /> */}
      </div>
    </ImageProvider>
  );
};

export default App;
