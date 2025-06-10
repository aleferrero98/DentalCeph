import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderOpen, faSave, faDownload, faTrash, faUndo, faRedo, faSyncAlt,
  faDotCircle, faSlash, faRulerCombined, faPercent, faFont, faPalette, faBars, faMugHot, faWandMagicSparkles
} from '@fortawesome/free-solid-svg-icons';
import Tour from './Tour';

// Toolbar container
const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  gap: 1.5rem;
  flex-wrap: wrap;
  @media (max-width: 900px) {
    gap: 0.5rem;
    padding: 0.5rem 0.2rem;
  }
`;

// Group for related tools
const ToolGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border-right: 2px solid #eee;
  padding-right: 1.2rem;
  &:first-child {
    padding-left: 0;
  }
  &:not(:first-child) {
    padding-left: 1.2rem;
  }
  &:last-child {
    border-right: none;
    padding-right: 0;
  }
`;

// Button style
const ToolButton = styled.button`
  background: ${({ active }) => (active ? '#e0e7ff' : 'transparent')};
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  transition: background 0.2s;
  outline: none;
  &:hover, &:focus {
    background: #f0f4ff;
  }
  ${({ active }) => active && css`
    box-shadow: 0 0 0 2px #4f46e5;
  `}
`;

// Color dot
const ColorDot = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ color }) => color};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1.5px #bbb;
  cursor: pointer;
  margin-right: 0.2rem;
  ${({ selected }) => selected && css`
    box-shadow: 0 0 0 2.5px #4f46e5;
  `}
`;

// Label for accessibility
const ToolLabel = styled.span`
  font-size: 1.0rem;
  color: #222c36;
  margin-top: 0.2rem;
  text-align: center;
  width: 100%;
  font-family: 'Nunito Sans', sans-serif;
`;

// Example color palette
const COLORS = [
  '#ff9800', '#00e676', '#f44336', '#d6d6d6', '#000',
  '#ffeb3b', '#ff00ff', '#00ffff', '#9c27b0', '#fff'
];

// Example thickness options
const THICKNESS = [2, 4, 7];

// Example font sizes
const FONT_SIZES = [14, 18, 24, 32];

const ICON_COLOR = "#222c36";

// Círculo grande para mostrar el color seleccionado
const CurrentColorCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ color }) => color};
  border: 3px solid #bbb;
  margin-right: 0.7rem;
  box-shadow: 0 0 0 2px #fff, 0 2px 8px rgba(0,0,0,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Fila de botones dentro de cada grupo
const ToolButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
`;

// Dropdown para el menú de tres puntos
const DropdownMenu = styled.div`
  position: absolute;
  top: 2.5rem;
  left: 0;
  min-width: 207px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  z-index: 100;
  padding: 0.3rem 0;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.18s;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: none; }
  }
`;
const DropdownItem = styled.button`
  background: none;
  border: none;
  text-align: left;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-family: 'Nunito Sans', sans-serif;
  color: #222c36;
  cursor: pointer;
  transition: background 0.15s;
  &:hover, &:focus {
    background: #f0f4ff;
    color: #4f46e5;
    outline: none;
  }
`;
const MenuWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Special container for color palette
const ColorPaletteRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-width: 180px;
  justify-content: center;
`;

function Toolbar({
  activeTool, onToolChange,
  color, onColorChange,
  thickness, onThicknessChange,
  fontSize, onFontSizeChange,
  onOpen, onSave, onDownload, onDelete,
  onUndo, onRedo, onRotate, onZoomChange, zoom,
}) {
  const colorInputRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const menuRef = useRef();

  const handleTourClose = () => {
    setShowTour(false);
  };

  const handleCustomColor = () => {
    colorInputRef.current.click();
  };
  const handleColorChange = (e) => {
    onColorChange(e.target.value);
  };
  // Cerrar el menú al hacer click fuera
  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);
  return (
    <ToolbarContainer className="toolbar-container">
      {/* Menu & Zoom */}
      <ToolGroup>
        <ToolButtonsRow>
          <MenuWrapper ref={menuRef}>
            <ToolButton title="Menú" onClick={() => setMenuOpen(o => !o)}>
              <FontAwesomeIcon icon={faBars} style={{ color: ICON_COLOR }} />
            </ToolButton>
            {menuOpen && (
              <DropdownMenu>
                <DropdownItem onClick={() => { setMenuOpen(false); onOpen(); }}>
                  Abrir imagen
                </DropdownItem>
                <DropdownItem onClick={() => { setMenuOpen(false); onDownload(); }}>
                  Descargar imagen
                </DropdownItem>
                <DropdownItem onClick={() => { setMenuOpen(false); setShowTour(true); }}>
                  Descubrir funciones
                  <FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: ICON_COLOR, marginLeft: '8px' }} />
                </DropdownItem>
                <DropdownItem onClick={() => { setMenuOpen(false); window.open('https://cafecito.app/alejandroferrero', '_blank'); }}>
                  Invitame un cafecito
                  <FontAwesomeIcon icon={faMugHot} style={{ color: ICON_COLOR, marginLeft: '8px' }} />
                </DropdownItem>
              </DropdownMenu>
            )}
          </MenuWrapper>
          <select
            aria-label="Zoom"
            value={zoom}
            onChange={e => onZoomChange(Number(e.target.value))}
            style={{ marginLeft: 8, fontSize: '1rem', borderRadius: 6 }}
          >
            {[10, 25, 50, 75, 90, 100, 110, 125, 150, 175, 200].map(z => (
              <option key={z} value={z}>{z}%</option>
            ))}
          </select>
        </ToolButtonsRow>
      </ToolGroup>

      {/* File actions + Undo/Redo/Rotate */}
      <ToolGroup>
        <ToolButtonsRow>
          <ToolButton title="Abrir imagen" onClick={onOpen} id="open-image-button">
            <FontAwesomeIcon icon={faFolderOpen} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Guardar cambios" onClick={onSave} id="save-changes-button">
            <FontAwesomeIcon icon={faSave} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Descargar imagen" onClick={onDownload} id="download-image-button">
            <FontAwesomeIcon icon={faDownload} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Borrar el contenido de la imagen" onClick={onDelete} id="delete-content-button">
            <FontAwesomeIcon icon={faTrash} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Deshacer cambios" onClick={onUndo} id="undo-button">
            <FontAwesomeIcon icon={faUndo} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Rehacer cambios" onClick={onRedo} id="redo-button">
            <FontAwesomeIcon icon={faRedo} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Rotar imagen" onClick={onRotate} id="rotate-image-button">
            <FontAwesomeIcon icon={faSyncAlt} style={{ color: ICON_COLOR }} />
          </ToolButton>
        </ToolButtonsRow>
      </ToolGroup>

      {/* Tools */}
      <ToolGroup>
        <ToolButtonsRow>
          <ToolButton title="Marcar punto" active={activeTool==='point'} onClick={()=>onToolChange('point')} id="point-mode-button">
            <FontAwesomeIcon icon={faDotCircle} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Trazar recta" active={activeTool==='line'} onClick={()=>onToolChange('line')} id="line-mode-button">
            <FontAwesomeIcon icon={faSlash} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Medir ángulo" active={activeTool==='angle'} onClick={()=>onToolChange('angle')} id="angle-mode-button">
            <FontAwesomeIcon icon={faRulerCombined} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <ToolButton title="Medir y calcular el porcentaje de Jarabak" active={activeTool==='jarabak'} onClick={()=>onToolChange('jarabak')} id="jarabak-mode-button">
            <FontAwesomeIcon icon={faPercent} style={{ color: ICON_COLOR }} />
          </ToolButton>
        </ToolButtonsRow>
        <ToolLabel>Herramientas</ToolLabel>
      </ToolGroup>

      {/* Thickness */}
      <ToolGroup id="thickness-tool-group">
        <ToolButtonsRow>
          {THICKNESS.map(t => (
            <ToolButton
              key={t}
              title={`Grosor ${t}`}
              active={thickness===t}
              onClick={()=>onThicknessChange(t)}
              style={{padding: 0, width: 32, height: 32, justifyContent: 'center'}}
            >
              <div style={{width: 24, height: t, background: ICON_COLOR, borderRadius: 4}} />
            </ToolButton>
          ))}
        </ToolButtonsRow>
        <ToolLabel>Grosor</ToolLabel>
      </ToolGroup>

      {/* Color palette */}
      <ToolGroup id="color-palette-tool-group">
        <ToolButtonsRow>
          <CurrentColorCircle color={color} title="Color seleccionado" />
          <ColorPaletteRow>
            {COLORS.map(c => (
              <ColorDot
                key={c}
                color={c}
                selected={color===c}
                onClick={()=>onColorChange(c)}
                title={c}
              />
            ))}
          </ColorPaletteRow>
          <ToolButton
            title="Seleccionar color"
            style={{ padding: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleCustomColor}
          >
            <FontAwesomeIcon icon={faPalette} style={{ color: ICON_COLOR }} />
            <input
              type="color"
              ref={colorInputRef}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              onChange={handleColorChange}
              tabIndex={-1}
            />
          </ToolButton>
        </ToolButtonsRow>
        <ToolLabel>Colores</ToolLabel>
      </ToolGroup>

      {/* Text tool */}
      <ToolGroup>
        <ToolButtonsRow>
          <ToolButton title="Añadir texto" active={activeTool==='text'} onClick={()=>onToolChange('text')}>
            <FontAwesomeIcon icon={faFont} style={{ color: ICON_COLOR }} />
          </ToolButton>
          <select
            aria-label="Font size"
            value={fontSize}
            onChange={e => onFontSizeChange(Number(e.target.value))}
            style={{ marginLeft: 8, fontSize: '1rem', borderRadius: 6 }}
          >
            {FONT_SIZES.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </ToolButtonsRow>
        <ToolLabel>Texto</ToolLabel>
      </ToolGroup>
      {showTour && <Tour onClose={handleTourClose} />}
    </ToolbarContainer>
  );
}

export default Toolbar; 