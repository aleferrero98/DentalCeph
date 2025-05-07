import React, { useState } from 'react';
import styled from 'styled-components';
import Toolbar from './components/Toolbar';
import CanvasArea from './components/CanvasArea';

// Main container for the app
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #f4f6fa;
`;

// Toolbar at the top
const ToolbarWrapper = styled.div`
  width: 100%;
  z-index: 10;
`;

// Main canvas area
const CanvasAreaWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e9eef3;
  overflow: auto;
`;

function App() {
  // UI states
  const [activeTool, setActiveTool] = useState('point');
  const [color, setColor] = useState('#ff9800');
  const [thickness, setThickness] = useState(4);
  const [fontSize, setFontSize] = useState(18);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Image/PDF state
  const [image, setImage] = useState(null);
  const [pdf, setPdf] = useState(null);

  // File input ref
  const fileInputRef = React.useRef();

  // Canvas ref for clearing annotations
  const canvasAreaRef = React.useRef();

  // Handlers
  const handleOpen = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    // Limpiar anotaciones y ángulos al abrir nueva imagen
    if (canvasAreaRef.current && canvasAreaRef.current.clearAll) {
      canvasAreaRef.current.clearAll();
    }
    if (["png", "jpg", "jpeg"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
        setPdf(null);
        setZoom(100); // Set zoom to 100% when opening an image
      };
      reader.readAsDataURL(file);
    } else if (ext === "pdf") {
      const url = URL.createObjectURL(file);
      setPdf(url);
      setImage(null);
      setZoom(100); // Set zoom to 100% when opening a PDF
    } else {
      alert("Unsupported file type. Please select a PNG, JPG, JPEG, or PDF file.");
    }
    e.target.value = '';
  };

  const handleSave = () => {
    if (canvasAreaRef.current && canvasAreaRef.current.saveAsBase) {
      canvasAreaRef.current.saveAsBase();
    }
  };
  const handleDownload = async () => {
    if (canvasAreaRef.current && canvasAreaRef.current.exportAs) {
      // Ask user for format
      const format = window.prompt('Enter format: png, jpg, jpeg, pdf', 'png');
      if (!format) return;
      await canvasAreaRef.current.exportAs(format.toLowerCase());
    }
  };
  const handleDelete = () => {
    if (canvasAreaRef.current && canvasAreaRef.current.clearAll) {
      canvasAreaRef.current.clearAll();
    }
  };
  const handleUndo = () => {};
  const handleRedo = () => {};
  const handleRotate = () => {
    setRotation(r => (r + 90) % 360);
  };
  const handleZoomChange = (z) => setZoom(z);

  // Actualiza la imagen base cuando se guarda
  const handleSaveImage = (newImage) => {
    setImage(newImage);
  };

  return (
    <AppContainer>
      <ToolbarWrapper>
        <Toolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          color={color}
          onColorChange={setColor}
          thickness={thickness}
          onThicknessChange={setThickness}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onOpen={handleOpen}
          onSave={handleSave}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onRotate={handleRotate}
          onZoomChange={handleZoomChange}
          zoom={zoom}
        />
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </ToolbarWrapper>
      <CanvasAreaWrapper>
        <CanvasArea
          ref={canvasAreaRef}
          image={image}
          pdf={pdf}
          zoom={zoom}
          rotation={rotation}
          activeTool={activeTool}
          color={color}
          thickness={thickness}
          fontSize={fontSize}
          onSaveImage={handleSaveImage}
        />
      </CanvasAreaWrapper>
    </AppContainer>
  );
}

export default App;
