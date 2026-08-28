"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover" | "win">("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Game constants
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 12;
  const BALL_RADIUS = 8;
  const BRICK_ROW_COUNT = 5;
  const BRICK_COLUMN_COUNT = 8;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 60;
  const BRICK_OFFSET_LEFT = 30;

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust canvas size
    canvas.width = Math.min(window.innerWidth - 40, 800);
    canvas.height = Math.min(window.innerHeight - 300, 600);

    const BRICK_WIDTH = (canvas.width - BRICK_OFFSET_LEFT * 2 - BRICK_PADDING * (BRICK_COLUMN_COUNT - 1)) / BRICK_COLUMN_COUNT;
    const BRICK_HEIGHT = 20;

    let x = canvas.width / 2;
    let y = canvas.height - 30;
    
    // Randomize initial angle a bit
    const angle = (Math.random() * Math.PI / 4) + Math.PI / 4; 
    const speed = 5;
    let dx = speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1);
    let dy = -speed * Math.sin(angle);

    let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    let rightPressed = false;
    let leftPressed = false;

    // Bricks array
    const bricks: { x: number, y: number, status: number, color: string }[][] = [];
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
    
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r] };
      }
    }

    let currentScore = score;
    let currentLives = lives;
    let animationId: number;

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
      else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
      else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - PADDLE_WIDTH / 2;
      }
    };
    
    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      const relativeX = e.touches[0].clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - PADDLE_WIDTH / 2;
      }
    };

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mouseMoveHandler, false);
    canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.roundRect(paddleX, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
      ctx.closePath();
    };

    const drawBricks = () => {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.roundRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT, 4);
            ctx.fillStyle = bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const collisionDetection = () => {
      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (
              x > b.x &&
              x < b.x + BRICK_WIDTH &&
              y > b.y &&
              y < b.y + BRICK_HEIGHT
            ) {
              dy = -dy;
              b.status = 0;
              currentScore += 10;
              setScore(currentScore);
              
              if (currentScore === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
                setGameState("win");
              }
            }
          }
        }
      }
    };

    const drawText = () => {
      ctx.font = "bold 120px Inter, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.textAlign = "center";
      ctx.fillText("404", canvas.width / 2, canvas.height / 2 + 40);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawText();
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Bounce off left/right
      if (x + dx > canvas.width - BALL_RADIUS || x + dx < BALL_RADIUS) {
        dx = -dx;
      }
      
      // Bounce off top
      if (y + dy < BALL_RADIUS) {
        dy = -dy;
      } 
      // Bottom edge collision
      else if (y + dy > canvas.height - BALL_RADIUS - 10) {
        // Paddle collision
        if (x > paddleX && x < paddleX + PADDLE_WIDTH) {
          dy = -dy;
          // Add some english (spin) depending on where it hits the paddle
          const hitPoint = (x - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
          dx = hitPoint * 5; 
        } else if (y + dy > canvas.height) {
          currentLives--;
          setLives(currentLives);
          
          if (currentLives <= 0) {
            setGameState("gameover");
            return;
          } else {
            x = canvas.width / 2;
            y = canvas.height - 30;
            dx = speed * (Math.random() > 0.5 ? 1 : -1);
            dy = -speed;
            paddleX = (canvas.width - PADDLE_WIDTH) / 2;
          }
        }
      }

      if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += 7;
      } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
      }

      x += dx;
      y += dy;
      
      if (gameState === "playing") {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
      document.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("touchmove", touchMoveHandler);
    };
  }, [gameState]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameState("playing");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="z-10 text-center max-w-3xl w-full">
        {gameState === "start" && (
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Lost in the Markets?</h2>
            <p className="text-gray-400 mb-6">The page you're looking for doesn't exist, but don't let a bad trade ruin your day. Take a break and play some Brickmania!</p>
          </div>
        )}

        <div className="relative mx-auto rounded-xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-900/50 backdrop-blur-sm" style={{ width: 'fit-content' }}>
          
          {/* Game Header */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center text-sm font-medium z-20 pointer-events-none">
             <div className="text-blue-400">SCORE: {score}</div>
             <div className="flex gap-1">
               {Array.from({ length: Math.max(3, lives) }).map((_, i) => (
                 <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-gray-700'}`} />
               ))}
             </div>
          </div>

          {/* Overlays */}
          {gameState === "start" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <button 
                onClick={startGame}
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center gap-3"
              >
                <span>▶</span> Play Brickmania
              </button>
              <p className="mt-6 text-gray-400 text-sm">Use Mouse, Touch, or Arrow Keys</p>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <h2 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h2>
              <p className="text-xl text-white mb-8">Final Score: <span className="text-blue-400 font-bold">{score}</span></p>
              
              <div className="flex gap-4">
                <button 
                  onClick={startGame}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <span>↺</span> Try Again
                </button>
                <Link href="/">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all flex items-center gap-2">
                    <span>←</span> Back to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          )}
          
          {gameState === "win" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <h2 className="text-4xl font-bold text-green-500 mb-2">YOU WIN! 🎉</h2>
              <p className="text-xl text-white mb-8">Perfect Score: <span className="text-blue-400 font-bold">{score}</span></p>
              
              <Link href="/">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center gap-2">
                  <span>←</span> Return to Trading
                </button>
              </Link>
            </div>
          )}

          {/* Canvas */}
          <canvas 
            ref={canvasRef} 
            className="block cursor-none touch-none"
            style={{ width: '800px', height: '600px', maxWidth: '100%', maxHeight: '70vh' }}
          />
        </div>

        {gameState !== "start" && (
          <div className="mt-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2">
              <span>←</span> Skip game and return to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
