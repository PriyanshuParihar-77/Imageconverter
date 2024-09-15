import React, { createContext, useState, ReactNode } from 'react';

interface ImageContextType {
  previewUrl: string | null;
  finalImageUrl: string | null;
  setPreviewUrl: (url: string) => void;
  setFinalImageUrl: (url: string) => void;
}

export const ImageContext = createContext<ImageContextType>({
  previewUrl: null,
  finalImageUrl: null,
  setPreviewUrl: () => {},
  setFinalImageUrl: () => {},
});

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  return (
    <ImageContext.Provider value={{ previewUrl, finalImageUrl, setPreviewUrl, setFinalImageUrl }}>
      {children}
    </ImageContext.Provider>
  );
};
