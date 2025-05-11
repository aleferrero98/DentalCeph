import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 100%;
  display: block;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
`;

const PdfPreview = styled.iframe`
  width: 90vw;
  height: 80vh;
  border: none;
  background: #fff;
`;

const HelpText = styled.div`
  color: #888;
  font-size: 1.2rem;
  text-align: center;
  padding: 2rem;
`;

const FloatingInput = styled.input`
  position: absolute;
  z-index: 10;
  font-size: ${({ fontSize }) => fontSize || 18}px;
  color: ${({ color }) => color || '#222'};
  font-family: ${({ fontFamily }) => fontFamily || 'Arial, sans-serif'};
  border: 1.5px solid #4f46e5;
  border-radius: 6px;
  padding: 2px 6px;
  background: #fff;
  outline: none;
  min-width: 40px;
`;

// Default font families
const FONT_FAMILIES = ['Arial', 'Verdana', 'Tahoma', 'Times New Roman', 'Courier New', 'Georgia'];

// Modal bonito para mostrar el resultado de Jarabak
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalBox = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  padding: 2rem 2.5rem;
  min-width: 320px;
  text-align: center;
`;
const ModalButton = styled.button`
  margin-top: 1.5rem;
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  &:hover { background: #e68900; }
`;

const CanvasArea = forwardRef(function CanvasArea({ image, pdf, onImageLoad, zoom, rotation, activeTool = 'point', color = '#ff9800', thickness = 4, fontSize = 18, fontFamily = 'Arial', onAddPoint, onAddLine, onSaveImage }, ref) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  // Store points, lines, and texts
  const [points, setPoints] = useState([]); // {x, y, color, thickness, erasable}
  const [lines, setLines] = useState([]);   // {x1, y1, x2, y2, color, thickness, erasable}
  const [texts, setTexts] = useState([]);   // {x, y, text, color, fontSize, fontFamily, erasable}
  // For drawing lines
  const [drawingLine, setDrawingLine] = useState(null); // {x1, y1, x2, y2}
  // For adding/editing text
  const [inputText, setInputText] = useState('');
  const [inputPos, setInputPos] = useState(null); // {x, y}
  const [movingTextIdx, setMovingTextIdx] = useState(null);
  const [dragOffset, setDragOffset] = useState({x:0, y:0});
  // For animated dash offset
  const [dashOffset, setDashOffset] = useState(0);
  // Estado para selección de ángulo
  const [angleSelection, setAngleSelection] = useState([]); // indices de las líneas seleccionadas
  const [angleResult, setAngleResult] = useState(null); // resultado temporal
  const [angles, setAngles] = useState([]); // { ... , erasable }
  const [hoveredLine, setHoveredLine] = useState(null); // índice de la recta bajo el cursor
  // Estado para Jarabak
  const [jarabakLines, setJarabakLines] = useState([]); // { ... , erasable }
  // Estado para mostrar el modal de Jarabak
  const [jarabakResult, setJarabakResult] = useState(null);

  // Get image size for correct scaling
  const [imgDims, setImgDims] = useState({ width: 0, height: 0 });

  // Update image dimensions on load
  const handleImgLoad = (e) => {
    if (onImageLoad) onImageLoad(e);
    setImgDims({ width: e.target.naturalWidth, height: e.target.naturalHeight });
  };

  // Convert mouse event to image coordinates (taking zoom/rotation into account)
  const getRelativeCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / (zoom / 100);
    let y = (e.clientY - rect.top) / (zoom / 100);
    // Apply reverse rotation
    const rad = -rotation * Math.PI / 180;
    const cx = imgDims.width / 2;
    const cy = imgDims.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + cx;
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + cy;
    return { x: rx, y: ry };
  };

  // Detectar si el mouse está sobre una recta (para selección intuitiva)
  const getLineAt = (x, y) => {
    // Tolerancia en píxeles
    const tolerance = 8;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      // Distancia punto-recta
      const dx = l.x2 - l.x1;
      const dy = l.y2 - l.y1;
      const length = Math.sqrt(dx*dx + dy*dy);
      if (length === 0) continue;
      const t = ((x - l.x1) * dx + (y - l.y1) * dy) / (length * length);
      if (t < 0 || t > 1) continue;
      const px = l.x1 + t * dx;
      const py = l.y1 + t * dy;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist < tolerance) return i;
    }
    return null;
  };

  // Mouse down: start drawing line, add point, or add/move text
  const handleMouseDown = (e) => {
    if (!image || pdf) return;
    if (e.button !== 0) return; // Only left click
    const { x, y } = getRelativeCoords(e);
    if (activeTool === 'point') {
      const pt = { x, y, color, thickness, erasable: true };
      addPoint(pt);
      if (onAddPoint) onAddPoint(pt);
    } else if (activeTool === 'line') {
      setDrawingLine({ x1: x, y1: y, x2: x, y2: y, color, thickness, erasable: true });
    } else if (activeTool === 'text') {
      // Check if clicking on existing text for moving
      const idx = texts.findIndex(t => {
        // Simple bounding box hit test
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = `${t.fontSize || fontSize}px ${t.fontFamily || fontFamily}`;
        const w = ctx.measureText(t.text).width;
        const h = t.fontSize || fontSize;
        return x >= t.x && x <= t.x + w && y >= t.y - h && y <= t.y;
      });
      if (idx !== -1) {
        // Start moving text
        setMovingTextIdx(idx);
        setDragOffset({ x: x - texts[idx].x, y: y - texts[idx].y });
      } else {
        // Add new text
        setInputPos({ x, y });
        setInputText('');
      }
    } else if (activeTool === 'angle') {
      if (angleSelection.length < 2) {
        const idx = getLineAt(x, y);
        if (idx !== null && !angleSelection.includes(idx)) {
          setAngleSelection([...angleSelection, idx]);
        }
      } else if (angleSelection.length === 2) {
        // Esperar clic en el área del ángulo
        const l1 = lines[angleSelection[0]];
        const l2 = lines[angleSelection[1]];
        const intersection = getLinesIntersection(l1, l2);
        if (!intersection) {
          setAngleSelection([]);
          setAngleResult(null);
          return;
        }
        // Vectores desde el vértice: usar el punto más alejado
        function farthestPoint(line, intersection) {
          const d1 = Math.hypot(line.x1 - intersection.x, line.y1 - intersection.y);
          const d2 = Math.hypot(line.x2 - intersection.x, line.y2 - intersection.y);
          return d1 > d2 ? { x: line.x1, y: line.y1 } : { x: line.x2, y: line.y2 };
        }
        const p1 = farthestPoint(l1, intersection);
        const p2 = farthestPoint(l2, intersection);
        const v1 = { x: p1.x - intersection.x, y: p1.y - intersection.y };
        const v2 = { x: p2.x - intersection.x, y: p2.y - intersection.y };
        // Normalizar
        const norm = v => { const len = Math.sqrt(v.x*v.x + v.y*v.y); return { x: v.x/len, y: v.y/len }; };
        const u1 = norm(v1);
        const u2 = norm(v2);
        // Bisectriz agudo y obtuso
        const bisAgudo = norm({ x: u1.x + u2.x, y: u1.y + u2.y });
        const bisObtuso = norm({ x: u1.x - u2.x, y: u1.y - u2.y });
        // Arcos
        function getArc(center, v1, v2, radius, useMinor) {
          const a1 = Math.atan2(v1.y, v1.x);
          const a2 = Math.atan2(v2.y, v2.x);
          let start = a1, end = a2;
          let diff = end - start;
          if (useMinor) {
            if (diff < 0) diff += 2 * Math.PI;
            if (diff > Math.PI) { [start, end] = [end, start]; diff = end - start; if (diff < 0) diff += 2 * Math.PI; }
          } else {
            if (diff < 0) diff += 2 * Math.PI;
            if (diff < Math.PI) { [start, end] = [end, start]; diff = end - start; if (diff < 0) diff += 2 * Math.PI; }
          }
          return { center, radius, start, end };
        }
        const arcAgudo = getArc(intersection, v1, v2, 32, true);
        const arcObtuso = getArc(intersection, v1, v2, 32, false);
        const angleAgudo = ((arcAgudo.end - arcAgudo.start + 2 * Math.PI) % (2 * Math.PI)) * 180 / Math.PI;
        const angleObtuso = ((arcObtuso.end - arcObtuso.start + 2 * Math.PI) % (2 * Math.PI)) * 180 / Math.PI;
        // Vector mouse desde el vértice
        const vm = { x: x - intersection.x, y: y - intersection.y };
        const normVm = norm(vm);
        // Ángulo entre bisectriz y mouse
        const dotAgudo = bisAgudo.x * normVm.x + bisAgudo.y * normVm.y;
        const dotObtuso = bisObtuso.x * normVm.x + bisObtuso.y * normVm.y;
        // El mayor producto escalar indica la bisectriz más cercana
        if (dotAgudo >= dotObtuso) {
          addAngle({ l1idx: angleSelection[0], l2idx: angleSelection[1], angle: angleAgudo, intersection, arcPoints: arcAgudo, color, erasable: true });
        } else {
          addAngle({ l1idx: angleSelection[0], l2idx: angleSelection[1], angle: angleObtuso, intersection, arcPoints: arcObtuso, color, erasable: true });
        }
        setAngleSelection([]);
        setAngleResult(null);
      }
    } else if (activeTool === 'jarabak') {
      if (!drawingLine) {
        setDrawingLine({ x1: x, y1: y, x2: x, y2: y, color, thickness, erasable: true });
      }
    }
  };

  // Mouse move: animate line, move text, o detectar hover sobre recta en modo ángulo
  const handleMouseMove = (e) => {
    if (drawingLine) {
      const { x, y } = getRelativeCoords(e);
      setDrawingLine((prev) => ({ ...prev, x2: x, y2: y }));
    } else if (movingTextIdx !== null) {
      const { x, y } = getRelativeCoords(e);
      setTexts(prev => prev.map((t, i) => i === movingTextIdx ? { ...t, x: x - dragOffset.x, y: y - dragOffset.y } : t));
    } else if (activeTool === 'angle') {
      const { x, y } = getRelativeCoords(e);
      const idx = getLineAt(x, y);
      setHoveredLine(idx);
    } else {
      setHoveredLine(null);
    }
  };

  // Mouse leave: limpiar hover
  const handleMouseLeave = () => {
    setHoveredLine(null);
  };

  // Mouse up: terminar línea en modo jarabak
  const handleMouseUp = (e) => {
    if (activeTool === 'jarabak' && drawingLine) {
      const { x, y } = getRelativeCoords(e);
      const newLine = { ...drawingLine, x2: x, y2: y, color, erasable: true };
      addJarabakLine(newLine);
      setDrawingLine(null);
    } else if (drawingLine) {
      const { x, y } = getRelativeCoords(e);
      // Calculate line equation: y = mx + b or general form Ax + By + C = 0
      const x1 = drawingLine.x1, y1 = drawingLine.y1, x2 = x, y2 = y;
      let m = null, b = null, A = null, B = null, C = null;
      if (x2 !== x1) {
        m = (y2 - y1) / (x2 - x1);
        b = y1 - m * x1;
      }
      // General form: Ax + By + C = 0
      A = y2 - y1;
      B = x1 - x2;
      C = x2 * y1 - x1 * y2;
      const newLine = {
        ...drawingLine,
        x2, y2,
        origin: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        equation: {
          slope: m,
          intercept: b,
          general: { A, B, C }
        },
        erasable: true
      };
      addLine(newLine);
      setDrawingLine(null);
    } else if (movingTextIdx !== null) {
      setMovingTextIdx(null);
    }
  };

  // Handle text input confirm (Enter or blur)
  const handleInputConfirm = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    if (!inputText.trim()) {
      setInputPos(null);
      setInputText('');
      return;
    }
    addText({
      x: inputPos.x,
      y: inputPos.y,
      text: inputText,
      color,
      fontSize,
      fontFamily,
      erasable: true
    });
    setInputPos(null);
    setInputText('');
  };

  // Animation for drawing line (dash offset)
  useEffect(() => {
    let animId;
    if (drawingLine) {
      const animate = () => {
        setDashOffset(prev => (prev + 6) % 60);
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    } else {
      setDashOffset(0);
    }
    return () => animId && cancelAnimationFrame(animId);
  }, [drawingLine]);

  // Draw points, lines, and texts on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = imgDims.width;
    canvas.height = imgDims.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw all lines (hover/selección)
    lines.forEach((l, i) => {
      ctx.save();
      if (activeTool === 'angle' && (hoveredLine === i || angleSelection.includes(i))) {
        ctx.strokeStyle = l.color;
        ctx.lineWidth = l.thickness + (hoveredLine === i ? 3 : 0);
        ctx.shadowColor = '#ff9800';
        ctx.shadowBlur = 8;
      } else {
        ctx.strokeStyle = l.color;
        ctx.lineWidth = l.thickness;
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      ctx.restore();
    });
    // Dibujar líneas de Jarabak igual que las normales
    jarabakLines.forEach((l) => {
      ctx.save();
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.thickness;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      ctx.restore();
    });
    // Draw animated line with animated dash
    if (drawingLine) {
      ctx.save();
      ctx.strokeStyle = drawingLine.color;
      ctx.lineWidth = drawingLine.thickness;
      ctx.setLineDash([12, 10]);
      ctx.lineDashOffset = -dashOffset;
      ctx.beginPath();
      ctx.moveTo(drawingLine.x1, drawingLine.y1);
      ctx.lineTo(drawingLine.x2, drawingLine.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    // Draw all points
    points.forEach(pt => {
      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.thickness * 1.2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
    // Draw all texts
    texts.forEach(t => {
      ctx.save();
      ctx.font = `${t.fontSize || 18}px ${t.fontFamily || 'Arial'}`;
      ctx.fillStyle = t.color || '#222';
      ctx.textBaseline = 'bottom';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
    // Dibuja todos los ángulos guardados
    angles.forEach(a => {
      if (a.arcPoints) {
        const { center, radius, start, end } = a.arcPoints;
        ctx.save();
        ctx.strokeStyle = a.color || '#ff9800';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, start, end);
        ctx.stroke();
        ctx.restore();
        // Escribir el valor del ángulo
        ctx.save();
        ctx.fillStyle = a.color || '#ff9800';
        ctx.font = 'bold 18px Arial';
        const mid = (start + end) / 2;
        const tx = center.x + (radius + 18) * Math.cos(mid);
        const ty = center.y + (radius + 18) * Math.sin(mid);
        ctx.fillText(`${a.angle.toFixed(1)}°`, tx, ty);
        ctx.restore();
      }
    });
  }, [points, lines, drawingLine, texts, image, imgDims, zoom, rotation, dashOffset, angleResult, angleSelection, hoveredLine, angles, jarabakLines]);

  // Canvas style: scale and rotate with image, top-left aligned
  const canvasStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: image && !pdf ? 'auto' : 'none',
    transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
    transformOrigin: 'top left',
    zIndex: 2,
  };

  // Image style: for correct overlay, top-left aligned
  const imgStyle = {
    display: image ? 'block' : 'none',
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 8,
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    transform: `scale(${zoom/100}) rotate(${rotation}deg)`,
    transformOrigin: 'top left',
  };

  // Floating input style: position in image coordinates, scale/rotate with image
  const getInputStyle = () => {
    if (!inputPos) return { display: 'none' };
    return {
      left: inputPos.x * (zoom / 100),
      top: inputPos.y * (zoom / 100) - fontSize,
      fontSize,
      color,
      fontFamily,
      minWidth: 40,
      transform: `rotate(${rotation}deg)`
    };
  };

  // Export as PNG/JPG/JPEG/PDF (original size, no margins)
  const exportAs = async (format = 'png') => {
    if (!image) return;
    // Create a temp canvas with original image size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgDims.width;
    tempCanvas.height = imgDims.height;
    const ctx = tempCanvas.getContext('2d');
    // Draw the base image
    const img = new window.Image();
    img.src = image;
    await new Promise(res => { img.onload = res; });
    ctx.drawImage(img, 0, 0, imgDims.width, imgDims.height);
    // Draw all lines
    lines.forEach(l => {
      ctx.save();
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.thickness;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      ctx.restore();
    });
    // Draw all points
    points.forEach(pt => {
      ctx.save();
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.thickness * 1.2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
    // Draw all texts
    texts.forEach(t => {
      ctx.save();
      ctx.font = `${t.fontSize || 18}px ${t.fontFamily || 'Arial'}`;
      ctx.fillStyle = t.color || '#222';
      ctx.textBaseline = 'bottom';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
    // Save as requested format
    if (format === 'pdf') {
      const pdf = new jsPDF({ orientation: tempCanvas.width > tempCanvas.height ? 'l' : 'p', unit: 'px', format: [tempCanvas.width, tempCanvas.height] });
      pdf.addImage(tempCanvas.toDataURL('image/png'), 'PNG', 0, 0, tempCanvas.width, tempCanvas.height);
      // File System Access API
      if (window.showSaveFilePicker) {
        const opts = {
          suggestedName: 'dentalceph.pdf',
          types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }]
        };
        const handle = await window.showSaveFilePicker(opts);
        const writable = await handle.createWritable();
        await writable.write(pdf.output('arraybuffer'));
        await writable.close();
      } else {
        pdf.save('dentalceph.pdf');
      }
    } else {
      const mime = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const ext = format === 'jpg' ? 'jpg' : format === 'jpeg' ? 'jpeg' : 'png';
      const dataUrl = tempCanvas.toDataURL(mime);
      // File System Access API
      if (window.showSaveFilePicker) {
        const opts = {
          suggestedName: `dentalceph.${ext}`,
          types: [{ description: 'Image', accept: { [mime]: [`.${ext}`] } }]
        };
        const handle = await window.showSaveFilePicker(opts);
        const writable = await handle.createWritable();
        // Convert base64 to blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        await writable.write(blob);
        await writable.close();
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `dentalceph.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // Función para calcular la intersección de dos rectas
  function getLinesIntersection(l1, l2) {
    const { x1: x1, y1: y1, x2: x2, y2: y2 } = l1;
    const { x1: x3, y1: y3, x2: x4, y2: y4 } = l2;
    const denom = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
    if (denom === 0) return null; // Paralelas
    const px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4)) / denom;
    const py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4)) / denom;
    return { x: px, y: py };
  }

  // Al cerrar el modal, eliminar las líneas de Jarabak
  const handleCloseJarabakModal = () => {
    if (jarabakResult && jarabakResult.lines) {
      setJarabakLines(prev => prev.filter(l => !l.erasable));
    }
    setJarabakResult(null);
  };

  // Limpiar jarabakLines y resultado al cambiar de modo o imagen
  useEffect(() => {
    setJarabakLines(prev => prev.filter(l => !l.erasable));
    setJarabakResult(null);
  }, [activeTool, image, pdf]);

  // Al guardar: marcar todos los elementos como no borrables
  const backupAnnotations = () => {
    setPoints(prev => prev.map(pt => ({ ...pt, erasable: false })));
    setLines(prev => prev.map(l => ({ ...l, erasable: false })));
    setTexts(prev => prev.map(t => ({ ...t, erasable: false })));
    setAngles(prev => prev.map(a => ({ ...a, erasable: false })));
    setJarabakLines(prev => prev.map(jl => ({ ...jl, erasable: false })));
  };

  // Al borrar todo: eliminar solo los elementos borrables
  const clearAll = () => {
    setPoints(prev => prev.filter(pt => !pt.erasable));
    setLines(prev => prev.filter(l => !l.erasable));
    setTexts(prev => prev.filter(t => !t.erasable));
    setAngles(prev => prev.filter(a => !a.erasable));
    setJarabakLines(prev => prev.filter(jl => !jl.erasable));
    setAngleSelection([]);
    setAngleResult(null);
    setJarabakResult(null);
  };

  // useImperativeHandle para exponer las funciones
  useImperativeHandle(ref, () => ({
    clearAll,
    backupAnnotations,
    exportAs
  }), [image, points, lines, texts, imgDims]);

  const [undoStack, setUndoStack] = useState([]); // {type, element}
  const [redoStack, setRedoStack] = useState([]); // {type, element}

  const addPoint = (pt) => {
    setPoints(prev => [...prev, pt]);
    setUndoStack(prev => [...prev, { type: 'point', element: pt }]);
    setRedoStack([]);
  };
  const addLine = (line) => {
    setLines(prev => [...prev, line]);
    setUndoStack(prev => [...prev, { type: 'line', element: line }]);
    setRedoStack([]);
  };
  const addText = (text) => {
    setTexts(prev => [...prev, text]);
    setUndoStack(prev => [...prev, { type: 'text', element: text }]);
    setRedoStack([]);
  };
  const addAngle = (angle) => {
    setAngles(prev => [...prev, angle]);
    setUndoStack(prev => [...prev, { type: 'angle', element: angle }]);
    setRedoStack([]);
  };
  const addJarabakLine = (jl) => {
    setJarabakLines(prev => [...prev, jl]);
    setUndoStack(prev => [...prev, { type: 'jarabak', element: jl }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, last]);
    if (last.type === 'point') {
      setPoints(points.filter(e => e !== last.element));
    } else if (last.type === 'line') {
      setLines(lines.filter(e => e !== last.element));
    } else if (last.type === 'text') {
      setTexts(texts.filter(e => e !== last.element));
    } else if (last.type === 'angle') {
      setAngles(angles.filter(e => e !== last.element));
    } else if (last.type === 'jarabak') {
      setJarabakLines(jarabakLines.filter(e => e !== last.element));
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, last]);
    if (last.type === 'point') {
      setPoints([...points, last.element]);
    } else if (last.type === 'line') {
      setLines([...lines, last.element]);
    } else if (last.type === 'text') {
      setTexts([...texts, last.element]);
    } else if (last.type === 'angle') {
      setAngles([...angles, last.element]);
    } else if (last.type === 'jarabak') {
      setJarabakLines([...jarabakLines, last.element]);
    }
  };

  useImperativeHandle(ref, () => ({
    clearAll,
    backupAnnotations,
    exportAs,
    handleUndo,
    handleRedo
  }), [clearAll, backupAnnotations, exportAs, handleUndo, handleRedo]);

  return (
    <CanvasWrapper
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: image && !pdf ? (activeTool === 'point' ? 'crosshair' : activeTool === 'line' ? 'pointer' : activeTool === 'text' ? 'text' : 'default') : 'default' }}
    >
      {!image && !pdf && (
        <HelpText>
          🩻 Abre una imagen para comenzar a trabajar sobre ella. ¡Se aceptan los formatos PNG, JPG o PDF! 🚀<br/>
          🛠️ Usa la barra de herramientas superior para seleccionar colores 🎨 y herramientas ✏️
        </HelpText>
      )}
      {image && (
        <>
          <img
            ref={imgRef}
            src={image}
            alt="Radiograph"
            style={imgStyle}
            onLoad={handleImgLoad}
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            width={imgDims.width}
            height={imgDims.height}
            style={canvasStyle}
          />
          {/* Floating input for text */}
          {inputPos && activeTool === 'text' && (
            <FloatingInput
              autoFocus
              fontSize={fontSize}
              color={color}
              fontFamily={fontFamily}
              style={getInputStyle()}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onBlur={handleInputConfirm}
              onKeyDown={handleInputConfirm}
              placeholder="Type..."
            />
          )}
        </>
      )}
      {pdf && (
        <PdfPreview src={pdf} title="PDF Preview" />
      )}
      {jarabakResult && (
        <ModalOverlay>
          <ModalBox>
            <h2>Jarabak Ratio</h2>
            <div style={{ fontSize: '2.2rem', color: '#ff9800', margin: '1.2rem 0' }}>{jarabakResult.ratio.toFixed(3)}</div>
            <ModalButton onClick={handleCloseJarabakModal}>Close</ModalButton>
          </ModalBox>
        </ModalOverlay>
      )}
    </CanvasWrapper>
  );
});

export default CanvasArea; 