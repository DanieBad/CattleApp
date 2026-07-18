import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Upload } from 'lucide-react';

interface SignaturePadProps {
  onSign: (dataUrl: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onSign, 
  onClear, 
  width = 400, 
  height = 200 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!hasSignature) setHasSignature(true);
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
        onSign(canvas.toDataURL('image/png'));
      }
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        if (onClear) onClear();
        onSign(''); // Clear signature data upstream
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        
        // Draw the uploaded image onto the canvas
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calculate scale to fit image within canvas while maintaining aspect ratio
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            setHasSignature(true);
            onSign(canvas.toDataURL('image/png'));
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
      <div 
        style={{ 
          border: '1px solid var(--border)', 
          borderRadius: '8px', 
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ 
            display: 'block', 
            touchAction: 'none', // Prevents scrolling while drawing on touch devices
            cursor: 'crosshair',
            width: '100%',
            maxWidth: `${width}px`,
            height: 'auto'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: `${width}px`, justifyContent: 'space-between' }}>
        <button 
          type="button" 
          onClick={clear} 
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.9rem' }}
        >
          <Eraser size={16} />
          Clear Pad
        </button>
        
        <div style={{ position: 'relative' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              opacity: 0, 
              cursor: 'pointer' 
            }}
          />
          <button 
            type="button" 
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.9rem' }}
          >
            <Upload size={16} />
            Upload Image
          </button>
        </div>
      </div>
    </div>
  );
};
