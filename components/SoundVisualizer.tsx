import React, { useRef, useEffect } from 'react';

interface SoundVisualizerProps {
  isPlaying: boolean;
}

const SoundVisualizer: React.FC<SoundVisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 5;
      const gap = 2;
      const numBars = Math.floor(canvas.width / (barWidth + gap));

      for (let i = 0; i < numBars; i++) {
        const barHeight = Math.random() * canvas.height;
        const x = i * (barWidth + gap);
        const y = canvas.height - barHeight;
        ctx.fillStyle = '#6366f1'; // A nice purple color
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width="200"
      height="50"
      style={{ border: '1px solid #333', borderRadius: '4px', background: '#000' }}
    />
  );
};

export default SoundVisualizer;