import React, { useState } from 'react';
import styled from 'styled-components';
import Toolbar from './components/Toolbar';
import CanvasArea from './components/CanvasArea';
import SplashScreen from './components/SplashScreen';

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

  const [showSplash, setShowSplash] = useState(true);

  React.useEffect(() => {
    setShowSplash(true);
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
      const modal = document.createElement('div');
      modal.style.padding = '20px';
      modal.style.borderRadius = '8px';
      modal.style.backgroundColor = 'white';
      modal.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.zIndex = '1000';
      modal.style.textAlign = 'center';
      modal.style.width = '500px';
      modal.style.minWidth = '300px';
      modal.style.maxWidth = '90%';

      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
      overlay.style.zIndex = '999';
      overlay.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
      };

      const message = document.createElement('p');
      message.textContent = 'El formato PDF no está soportado actualmente. Por favor, convierta su archivo a un formato compatible (PNG o JPG) utilizando un servicio externo.';

      const convertBtn = document.createElement('button');
      convertBtn.textContent = 'Convertir a PNG';
      convertBtn.style.backgroundColor = '#ff9800';
      convertBtn.style.color = 'white';
      convertBtn.style.border = 'none';
      convertBtn.style.padding = '10px 20px';
      convertBtn.style.borderRadius = '5px';
      convertBtn.style.cursor = 'pointer';
      convertBtn.style.marginRight = '10px';
      convertBtn.onclick = () => window.open('https://convertio.co/es/pdf-png/', '_blank');

      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Cerrar';
      closeBtn.style.backgroundColor = '#ccc';
      closeBtn.style.color = 'black';
      closeBtn.style.border = 'none';
      closeBtn.style.padding = '10px 20px';
      closeBtn.style.borderRadius = '5px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(modal);
      };

      modal.appendChild(message);
      modal.appendChild(convertBtn);
      modal.appendChild(closeBtn);

      document.body.appendChild(overlay);
      document.body.appendChild(modal);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    if (canvasAreaRef.current && canvasAreaRef.current.backupAnnotations) {
      canvasAreaRef.current.backupAnnotations();
    }
  };
  const handleDownload = async () => {
    if (canvasAreaRef.current && canvasAreaRef.current.exportAs) {
      // Ask user for format
      const format = window.prompt('Enter format: png, jpg, jpeg', 'png');
      if (!format) return;
      await canvasAreaRef.current.exportAs(format.toLowerCase());
    }
  };
  const handleDelete = () => {
    if (canvasAreaRef.current && canvasAreaRef.current.clearAll) {
      canvasAreaRef.current.clearAll();
    }
  };
  const handleUndo = () => {
    if (canvasAreaRef.current && canvasAreaRef.current.handleUndo) {
      canvasAreaRef.current.handleUndo();
    }
  };
  const handleRedo = () => {
    if (canvasAreaRef.current && canvasAreaRef.current.handleRedo) {
      canvasAreaRef.current.handleRedo();
    }
  };
  const handleRotate = () => {
    setRotation(r => (r + 90) % 360);
  };
  const handleZoomChange = (z) => setZoom(z);

  // Actualiza la imagen base cuando se guarda
  const handleSaveImage = (newImage) => {
    setImage(newImage);
  };

  return (
    <>
      {showSplash && <SplashScreen />}
      <AppContainer style={{ filter: showSplash ? 'blur(2px)' : 'none', pointerEvents: showSplash ? 'none' : 'auto' }}>
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
    </>
  );
}

export default App;
