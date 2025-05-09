import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderOpen, faSave, faDownload, faTrash, faUndo, faRedo, faSyncAlt,
  faDotCircle, faSlash, faRulerCombined, faPercent, faFont, faPalette, faBars, faEllipsisV
} from '@fortawesome/free-solid-svg-icons';

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
  margin-right: 1.2rem;
  &:last-child {
    border-right: none;
    margin-right: 0;
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
  font-size: 1.3rem;
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
  font-size: 0.85rem;
  color: #222c36;
  margin-top: 0.2rem;
  text-align: center;
  width: 100%;
`;

// Example color palette
const COLORS = [
  '#ff9800', '#000', '#fff', '#f44336', '#4caf50', '#2196f3', '#e91e63',
  '#ffeb3b', '#00e676', '#00bcd4', '#9c27b0', '#607d8b', '#bdbdbd', '#ffc107',
];

// Example thickness options
const THICKNESS = [2, 4, 7];

// Example font sizes
const FONT_SIZES = [14, 18, 24, 32];

// Círculo grande para mostrar el color seleccionado
const CurrentColorCircle = styled.div`
  width: 32px;
  height: 32px;
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

function Toolbar({
  activeTool, onToolChange,
  color, onColorChange,
  thickness, onThicknessChange,
  fontSize, onFontSizeChange,
  onOpen, onSave, onDownload, onDelete,
  onUndo, onRedo, onRotate, onZoomChange, zoom,
}) {
  const colorInputRef = useRef();
  const handleCustomColor = () => {
    colorInputRef.current.click();
  };
  const handleColorChange = (e) => {
    onColorChange(e.target.value);
  };
  return (
    <ToolbarContainer>
      {/* Menu & Zoom */}
      <ToolGroup>
        <ToolButtonsRow>
          <ToolButton title="Menu">
            <FontAwesomeIcon icon={faEllipsisV} />
          </ToolButton>
          <select
            aria-label="Zoom"
            value={zoom}
            onChange={e => onZoomChange(Number(e.target.value))}
            style={{ marginLeft: 8, fontSize: '1rem', borderRadius: 6 }}
          >
            {[50, 75, 100, 125, 150, 200].map(z => (
              <option key={z} value={z}>{z}%</option>
            ))}
          </select>
        </ToolButtonsRow>
      </ToolGroup>

      {/* File actions */}
      <ToolGroup>
        <ToolButtonsRow>
          <ToolButton title="Open image" onClick={onOpen}>
            <FontAwesomeIcon icon={faFolderOpen} />
          </ToolButton>
          <ToolButton title="Save" onClick={onSave}>
            <FontAwesomeIcon icon={faSave} />
          </ToolButton>
          <ToolButton title="Download" onClick={onDownload}>
            <FontAwesomeIcon icon={faDownload} />
          </ToolButton>
          <ToolButton title="Delete all" onClick={onDelete}>
            <FontAwesomeIcon icon={faTrash} />
          </ToolButton>
        </ToolButtonsRow>
      </ToolGroup>

      {/* Tools */}
      <ToolGroup>
        <ToolButtonsRow>
          <ToolButton title="Mark point" active={activeTool==='point'} onClick={()=>onToolChange('point')}>
            <FontAwesomeIcon icon={faDotCircle} />
          </ToolButton>
          <ToolButton title="Draw line" active={activeTool==='line'} onClick={()=>onToolChange('line')}>
            <FontAwesomeIcon icon={faSlash} />
          </ToolButton>
          <ToolButton title="Angle" active={activeTool==='angle'} onClick={()=>onToolChange('angle')}>
            <FontAwesomeIcon icon={faRulerCombined} />
          </ToolButton>
          <ToolButton title="Jarabak %" active={activeTool==='jarabak'} onClick={()=>onToolChange('jarabak')}>
            <FontAwesomeIcon icon={faPercent} />
          </ToolButton>
        </ToolButtonsRow>
        <ToolLabel>Herramientas</ToolLabel>
      </ToolGroup>

      {/* Thickness */}
      <ToolGroup>
        <ToolButtonsRow>
          {THICKNESS.map(t => (
            <ToolButton
              key={t}
              title={`Thickness ${t}`}
              active={thickness===t}
              onClick={()=>onThicknessChange(t)}
              style={{padding: 0, width: 32, height: 32, justifyContent: 'center'}}
            >
              <div style={{width: 24, height: t, background: '#222c36', borderRadius: 4}} />
            </ToolButton>
          ))}
        </ToolButtonsRow>
        <ToolLabel>Grosor</ToolLabel>
      </ToolGroup>

      {/* Color palette */}
      <ToolGroup>
        <ToolButtonsRow>
          {/* Círculo grande para color actual */}
          <CurrentColorCircle color={color} title="Current color" />
          {COLORS.map(c => (
            <ColorDot
              key={c}
              color={c}
              selected={color===c}
              onClick={()=>onColorChange(c)}
              title={c}
            />
          ))}
          {/* Botón para color personalizado con icono y estilo de ToolButton */}
          <ToolButton
            title="Custom color"
            style={{ padding: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleCustomColor}
          >
            <FontAwesomeIcon icon={faPalette} style={{ color: '#888', fontSize: '1.2rem' }} />
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
          <ToolButton title="Text" active={activeTool==='text'} onClick={()=>onToolChange('text')}>
            <FontAwesomeIcon icon={faFont} />
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

      {/* Undo/Redo/Rotate */}
      <ToolGroup>
        <ToolButtonsRow>
          <ToolButton title="Undo" onClick={onUndo}>
            <FontAwesomeIcon icon={faUndo} />
          </ToolButton>
          <ToolButton title="Redo" onClick={onRedo}>
            <FontAwesomeIcon icon={faRedo} />
          </ToolButton>
          <ToolButton title="Rotate" onClick={onRotate}>
            <FontAwesomeIcon icon={faSyncAlt} />
          </ToolButton>
        </ToolButtonsRow>
      </ToolGroup>
    </ToolbarContainer>
  );
}

export default Toolbar; 