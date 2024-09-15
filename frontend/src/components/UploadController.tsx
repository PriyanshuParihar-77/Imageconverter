import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ImageContext } from '../context/Context';
import { CloudUploadIcon, DownloadIcon, CheckCircleIcon } from '@heroicons/react/outline';

const UploadController: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { previewUrl, finalImageUrl, setPreviewUrl, setFinalImageUrl } = useContext(ImageContext);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setUploadProgress(0);
      setUploadSuccess(false);
    }
  };

  const simulateSlowProgress = (callback: () => Promise<void>) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        setUploadProgress(progress);
      } else {
        clearInterval(timer);
        callback();
      }
    }, 300);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('brightness', brightness.toString());
    formData.append('contrast', contrast.toString());
    formData.append('saturation', saturation.toString());
    formData.append('rotation', rotation.toString());

    simulateSlowProgress(async () => {
      try {
        const previewResponse = await axios.post('http://localhost:3001/preview', formData, {
          responseType: 'blob',
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });

        const previewUrl = URL.createObjectURL(previewResponse.data);
        setPreviewUrl(previewUrl);

        const processResponse = await axios.post('http://localhost:3001/upload', formData);
        setFinalImageUrl(processResponse.data.imageUrl);

        setUploadProgress(100);
        setUploadSuccess(true);
      } catch (error) {
        console.error('Error uploading or processing the image:', error);
      }
    });
  };

  const handleDownload = async () => {
    if (!finalImageUrl) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/download?format=${downloadFormat}&imageUrl=${encodeURIComponent(finalImageUrl)}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: `image/${downloadFormat}` });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `image.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadMessage(`Image successfully downloaded as ${downloadFormat.toUpperCase()}`);
      setTimeout(() => setDownloadMessage(null), 3000);
    } catch (error) {
      console.error('Error downloading the image:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'olive', color: 'white' }}>
      {/* Branding */}
      <h1 className="text-4xl font-bold mb-8">Image Converter</h1>

      <div className="bg-slate-800 rounded-lg p-8 shadow-lg w-96 flex flex-col justify-center items-center">
        {/* Upload File button */}
        <label className="flex items-center cursor-pointer w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg mb-4 justify-center">
          Upload File
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {fileName && <div className="text-sm mb-4">{fileName}</div>}

        <div className="w-full mb-4">
          <label>Brightness:</label>
          <input type="range" value={brightness} min="0" max="2" step="0.1" onChange={(e) => setBrightness(parseFloat(e.target.value))} className="w-full" />
        </div>

        <div className="w-full mb-4">
          <label>Contrast:</label>
          <input type="range" value={contrast} min="0" max="2" step="0.1" onChange={(e) => setContrast(parseFloat(e.target.value))} className="w-full" />
        </div>

        <div className="w-full mb-4">
          <label>Saturation:</label>
          <input type="range" value={saturation} min="0" max="2" step="0.1" onChange={(e) => setSaturation(parseFloat(e.target.value))} className="w-full" />
        </div>

        <div className="w-full mb-4">
          <label>Rotation:</label>
          <input type="range" value={rotation} min="0" max="360" step="1" onChange={(e) => setRotation(parseFloat(e.target.value))} className="w-full" />
        </div>

        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full mb-4">
            <div
              className="bg-yellow-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg mb-4 flex items-center justify-center"
        >
        
          Process Image
        </button>

        {uploadSuccess && (
          <div className="text-center text-green-400 font-bold mb-4 flex items-center justify-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Image successfully uploaded!
          </div>
        )}

        {previewUrl && <img src={previewUrl} alt="Image Preview" className="w-full rounded-lg mt-2 mb-4" />}

        {finalImageUrl && (
          <div>
            <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'jpeg')} className="w-full mb-4 bg-gray-700 text-white py-2 px-4 rounded-lg">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>

            <button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <DownloadIcon className="h-5 w-5 mr-2" />
              Download Image
            </button>

            {downloadMessage && <div className="text-center text-green-400 font-bold mt-4">{downloadMessage}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadController;
