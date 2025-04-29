import { useEffect } from 'react';

const BouncingBalls = ({ speed }: { speed: number }) => {
  useEffect(() => {
    const canvas = document.getElementById('bouncingBallsCanvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    canvas.width = window.innerWidth;
    canvas.height = 100; // Match the header title size

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas');
      return;
    }

    const balls = Array.from({ length: Math.floor(speed * 20) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() * 4 - 2) * speed,
      dy: (Math.random() * 4 - 2) * speed,
      radius: Math.random() * 20 + 10,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    }));

    interface Ball {
      x: number;
      y: number;
      dx: number;
      dy: number;
      radius: number;
      color: string;
    }

    const drawBall = (ball: Ball): void => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      ctx.fill();
      ctx.closePath();
    };

    const updateBalls = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      balls.forEach((ball) => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
          ball.dx *= -1;
        }
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
          ball.dy *= -1;
        }

        drawBall(ball);
      });
      requestAnimationFrame(updateBalls);
    };

    updateBalls();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [speed]);

  return <canvas id="bouncingBallsCanvas" style={{ width: '100%', height: '100px' }}></canvas>;
};

export default BouncingBalls;