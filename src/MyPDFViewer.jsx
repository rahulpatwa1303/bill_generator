import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { pdfjs } from 'react-pdf-viewer';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

const MyPDFViewer = ({ fileUrl }) => {
  // Create instance of the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}>
        <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  );
};

export default MyPDFViewer;
