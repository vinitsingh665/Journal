"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover" | "win">("start");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Game variables that will be calculated dynamically
  let PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 12;
  const BALL_RADIUS = 5;
  let BRICK_ROW_COUNT = 12;
  let BRICK_COLUMN_COUNT = 15;
  const BRICK_PADDING = 2;
  const BRICK_OFFSET_TOP = 80;
  let BRICK_OFFSET_LEFT = 0;

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Full screen canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    PADDLE_WIDTH = Math.max(80, canvas.width * 0.15);
    BRICK_COLUMN_COUNT = Math.floor(canvas.width / 35);
    BRICK_ROW_COUNT = Math.floor(canvas.height * 0.4 / 17); // Take up top 40% of screen

    const BRICK_WIDTH = (canvas.width - BRICK_PADDING * (BRICK_COLUMN_COUNT + 1)) / BRICK_COLUMN_COUNT;
    const BRICK_HEIGHT = 15;
    BRICK_OFFSET_LEFT = (canvas.width - (BRICK_COLUMN_COUNT * (BRICK_WIDTH + BRICK_PADDING))) / 2;

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

    const bricks: { x: number, y: number, status: number, color: string }[][] = [];
    
    // Create a cool pattern or just rows of colors
    const getBrickColor = (c: number, r: number) => {
      const hue = (r / BRICK_ROW_COUNT) * 60 + 15; // Orange to yellow gradient
      return `hsl(${hue}, 90%, 55%)`;
    };

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        // Randomly skip some bricks for a fragmented look like the screenshot, or just solid
        const status = Math.random() > 0.1 ? 1 : 0; 
        bricks[c][r] = { x: 0, y: 0, status, color: getBrickColor(c, r) };
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
      ctx.font = "bold 20vw Inter, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("404", canvas.width / 2, canvas.height / 2);
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
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="z-10 absolute inset-0 w-full h-full">
        {gameState === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent animate-pulse">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Lost in the Markets?</h2>
            <p className="text-gray-400 mb-8 max-w-md text-center">The page you're looking for doesn't exist, but don't let a bad trade ruin your day. Take a break and play some Brickmania!</p>
            <button 
              onClick={startGame}
              className="group relative px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold text-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] flex items-center gap-3"
            >
              <span>▶</span> Play Brickmania
            </button>
            <p className="mt-6 text-gray-400 text-sm">Use Mouse, Touch, or Arrow Keys</p>
            
            <Link href="/" className="mt-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2">
              <span>←</span> Return to Dashboard
            </Link>
          </div>
        )}

        <div className="relative w-full h-full overflow-hidden bg-gray-900/20">
          
          {/* Game Header */}
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center text-sm font-medium z-20 pointer-events-none">
             <div className="text-blue-400">SCORE: {score}</div>
             <div className="flex gap-1">
               {Array.from({ length: Math.max(3, lives) }).map((_, i) => (
                 <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-gray-700'}`} />
               ))}
             </div>
          </div>

          {/* Game Over / Win Overlays */}
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
            className="block cursor-none touch-none w-full h-full"
          />
        </div>
        
        {/* Exit Button During Game */}
        {gameState === "playing" && (
          <Link href="/" className="absolute bottom-4 right-4 z-40 text-gray-500 hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-full text-sm backdrop-blur-md">
            Exit Game
          </Link>
        )}
      </div>
    </div>
  );
}
