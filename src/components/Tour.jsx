import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import styled from 'styled-components';

const TourOverlay = styled.div`
  .driver-popover {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.15);
    padding: 1.5rem;
  }

  .driver-popover-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: #222c36;
    margin-bottom: 0.5rem;
  }

  .driver-popover-description {
    font-size: 1rem;
    color: #666;
    line-height: 1.5;
  }

  .driver-popover-footer {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .driver-popover-progress-text {
    color: #666;
    font-size: 0.9rem;
  }

  .driver-popover-prev-btn,
  .driver-popover-next-btn {
    background: #4f46e5;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;

    &:hover {
      background: #4338ca;
    }
  }

  .driver-popover-close-btn {
    color: #666;
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #222;
    }
  }
`;

const Tour = ({ onClose }) => {
  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 0,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      steps: [
        {
          element: '#open-image-button',
          stagePadding: 20,
          popover: {
            title: 'Empezá cargando una imagen',
            description: 'Elegí una imagen desde tu computadora para empezar a trabajar. Por ahora se aceptan los formatos PNG, JPG, JPEG o WEBP.',
            position: 'bottom'
          }
        },
        {
          element: '#point-mode-button',
          stagePadding: 20,
          popover: {
            title: 'Marcá los puntos',
            description: 'Marcá los puntos necesarios para ayudarte a trazar las rectas con precisión.',
            position: 'bottom'
          }
        },
        {
          element: '#thickness-tool-group',
          stagePadding: 20,
          popover: {
            title: 'Ajustá el grosor',
            description: 'Podés cambiar qué tan gruesas se verán las líneas y los puntos que dibujes posteriormente.',
            position: 'bottom'
          }
        },
        {
          element: '#color-palette-tool-group',
          stagePadding: 20,
          popover: {
            title: 'Elige un color adecuado',
            description: 'Selecciona un color que contraste con la imagen. Se aplicará a los puntos, líneas y ángulos que dibujes, y lo vas a ver reflejado en el círculo de la izquierda.',
            position: 'bottom'
          }
        },
        {
          element: '#line-mode-button',
          stagePadding: 20,
          popover: {
            title: 'Trazado de rectas',
            description: 'Dibujá las rectas que van a formar los ángulos. Hacelo arrastrando el mouse desde el punto inicial hasta el final.',
            position: 'bottom'
          }
        },
        {
          element: '#angle-mode-button',
          stagePadding: 20,
          popover: {
            title: 'Medí un ángulo fácilmente',
            description: 'Hacé clic izquierdo sobre las dos rectas que forman el ángulo. Después, hacé un tercer clic en el área donde está el ángulo (ya sea agudo u obtuso) para obtener su valor.',
            position: 'bottom'
          }
        },
        {
          element: '#jarabak-mode-button',
          stagePadding: 20,
          popover: {
            title: 'Porcentaje de Jarabak',
            description: 'Activá este modo para calcular el porcentaje de Jarabak trazando dos rectas temporales. El resultado se mostrará en una ventana emergente.',
            position: 'bottom'
          }
        },
        {
          element: '#undo-button',
          stagePadding: 20,
          popover: {
            title: '¿Te equivocaste?',
            description: '¡No pasa nada! Usá el botón de deshacer para volver atrás paso a paso.',
            position: 'bottom'
          }
        },
        {
          element: '#redo-button',
          stagePadding: 20,
          popover: {
            title: 'Rehacer cambios',
            description: '¿Te arrepentiste de deshacer algo? Con este botón lo traés de vuelta.',
            position: 'bottom'
          }
        },
        {
          element: '#save-changes-button',
          stagePadding: 20,
          popover: {
            title: 'Protegé tus cambios',
            description: 'Guardá tu progreso para que no se pierda si más adelante tocás el botón de eliminar. No se guarda nada en la nube ni en tu dispositivo.',
            position: 'bottom'
          }
        },
        {
          element: '#download-image-button',
          stagePadding: 20,
          popover: {
            title: 'Llevate tu trabajo',
            description: 'Guardá en tu compu la imagen con todos los cambios que hiciste.',
            position: 'bottom'
          }
        },
        {
          element: '#delete-content-button',
          stagePadding: 20,
          popover: {
            title: 'Borrar lo editado',
            description: 'Eliminá todos los cambios hechos sobre la imagen sin borrarla. Los cambios guardados no se ven afectados.',
            position: 'bottom'
          }
        }
      ],
      onDestroyed: () => {
        if (onClose) onClose();
      }
    });

    // Start the tour when the component mounts
    driverObj.drive();

    // Cleanup
    return () => {
      driverObj.destroy();
    };
  }, [onClose]);

  return <TourOverlay />;
};

export default Tour; 