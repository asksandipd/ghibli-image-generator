import { useEffect } from 'react';

const GeometricShapes = () => {
  useEffect(() => {
    const canvas = document.getElementById('shapesCanvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas');
      return;
    }

    const getTheme = () => document.body.className;

    interface Shape {
      type: 'circle' | 'triangle' | 'square' | 'hexagon' | 'pentagon';
      x: number;
      y: number;
      size: number;
      maxSize: number;
      speed: number;
      opacity: number;
    }

    const shapes: Shape[] = [];

    const createShape = () => {
      const shapeTypes = ['circle', 'triangle', 'square', 'hexagon', 'pentagon'];
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)] as 'circle' | 'triangle' | 'square' | 'hexagon' | 'pentagon';
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 0;
      const maxSize = Math.random() * 50 + 20;
      const speed = Math.random() * 0.5 + 0.2;
      const opacity = 1;
      shapes.push({ type, x, y, size, maxSize, speed, opacity });
    };

    const drawShape = (shape: Shape) => {
      ctx.beginPath();
      ctx.globalAlpha = shape.opacity;
      const theme = getTheme();
      const colors = theme === 'light' ? ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'] : ['#FFFFFF', '#FFD700', '#ADFF2F', '#00FFFF', '#FF69B4'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      switch (shape.type) {
        case 'circle':
          ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2);
          break;
        case 'triangle':
          ctx.moveTo(shape.x, shape.y - shape.size);
          ctx.lineTo(shape.x - shape.size, shape.y + shape.size);
          ctx.lineTo(shape.x + shape.size, shape.y + shape.size);
          ctx.closePath();
          break;
        case 'square':
          ctx.rect(shape.x - shape.size, shape.y - shape.size, shape.size * 2, shape.size * 2);
          break;
        case 'hexagon':
        case 'pentagon':
          const sides = shape.type === 'hexagon' ? 6 : 5;
          for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 / sides) * i;
            const x = shape.x + shape.size * Math.cos(angle);
            const y = shape.y + shape.size * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
      }
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = `rgba(100, 108, 255, ${shape.opacity})`;
      ctx.stroke();
    };

    const updateShapes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach((shape, index) => {
        shape.size += shape.speed;
        shape.opacity -= 0.005;
        if (shape.size > shape.maxSize || shape.opacity <= 0) {
          shapes.splice(index, 1);
        } else {
          drawShape(shape);
        }
      });
      if (shapes.length < 50) createShape();
      requestAnimationFrame(updateShapes);
    };

    updateShapes();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return <canvas id="shapesCanvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}></canvas>;
};

export default GeometricShapes;