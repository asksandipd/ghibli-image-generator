import { useEffect } from 'react';

const TrussAnimation = ({ speed }: { speed: number }) => {
  useEffect(() => {
    const canvas = document.getElementById('trussCanvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = 100; // Match the header title size

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas');
      return;
    }
    let animationFrameId: number;
    let isAnimating = true;

    const drawTruss = (time: number) => {
      if (!isAnimating) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const trussWidth = 50;
      const trussHeight = 20;
      const offset = (time * speed) % trussWidth;

      for (let y = 0; y < canvas.height; y += trussHeight) {
        for (let x = -trussWidth; x < canvas.width; x += trussWidth) {
          ctx.beginPath();
          ctx.moveTo(x + offset, y);
          ctx.lineTo(x + trussWidth / 2 + offset, y + trussHeight);
          ctx.lineTo(x + trussWidth + offset, y);
          ctx.closePath();
          ctx.strokeStyle = '#646cff';
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(drawTruss);
    };

    const toggleAnimation = () => {
      isAnimating = !isAnimating;
      if (isAnimating) {
        animationFrameId = requestAnimationFrame(drawTruss);
      }
    };

    canvas.addEventListener('click', toggleAnimation);
    animationFrameId = requestAnimationFrame(drawTruss);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', toggleAnimation);
    };
  }, [speed]);

  return <canvas id="trussCanvas" style={{ width: '100%', height: '100px' }}></canvas>;
};

export default TrussAnimation;