"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface Position {
  x: number;
  y: number;
}
const images = [
  "/flag-india.webp",
  "/flag-israel.webp",
  "/iskcon-logo-250.jpg",
  "/al-league.jpg",
];
const getRandomSpawnDelay = () => {
  return Math.floor(Math.random() * (3000 - 1000) + 1000);
};
export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [currentFlag, setCurrentFlag] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [showEffect, setShowEffect] = useState<{
    type: "smash" | "miss";
    pos: Position;
  } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [flagDuration, setFlagDuration] = useState(2000); // Initial duration 2 seconds
  const [flagClicked, setFlagClicked] = useState(false);

  const sounds = {
    smash: typeof Audio !== "undefined" ? new Audio("/punch-sound.mp3") : null,
    miss: typeof Audio !== "undefined" ? new Audio("/miss-sound.mp3") : null,
    gameOver:
      typeof Audio !== "undefined" ? new Audio("/emotional-sound.mp3") : null,
    gameStart: typeof Audio !== "undefined" ? new Audio("/among-us.mp3") : null,
  };

  const playSound = (soundType: keyof typeof sounds) => {
    if (sounds[soundType]) {
      sounds[soundType]?.play();
    }
  };

  const getRandomPosition = () => {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    return { x, y };
  };

  const showRandomFlag = useCallback(() => {
    if (gameOver) return;

    setFlagClicked(false); // Reset flag clicked state
    const randomFlag = images[Math.floor(Math.random() * images.length)];
    const newPosition = getRandomPosition();
    setCurrentFlag(randomFlag);
    setPosition(newPosition);

    const timeout = setTimeout(() => {
      if (!flagClicked && currentFlag) {
        // Check if flag wasn't clicked
        const missPosition = { ...position };
        setMisses((prev) => {
          const newMisses = prev + 1;
          if (newMisses >= 5) {
            setGameOver(true);
            playSound("gameOver");
          }
          playSound("miss");
          setShowEffect({ type: "miss", pos: missPosition });
          setTimeout(() => setShowEffect(null), 500);
          return newMisses;
        });
      }
      setCurrentFlag(null);
    }, flagDuration);

    return () => clearTimeout(timeout);
  }, [gameOver, flagDuration, position, currentFlag, flagClicked, playSound]);

  const handleFlagClick = () => {
    if (currentFlag) {
      setFlagClicked(true); // Mark flag as clicked
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore % 25 === 0) {
          setFlagDuration((current) => {
            const reduction = Math.floor(newScore / 25) * 300;
            return Math.max(current - reduction, 500);
          });
        }
        return newScore;
      });
      playSound("smash");
      setShowEffect({ type: "smash", pos: position });
      setTimeout(() => setShowEffect(null), 500);
      setCurrentFlag(null);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    playSound("gameStart");
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (gameStarted && countdown === 0 && !gameOver) {
      const spawnFlag = () => {
        showRandomFlag();
        const nextSpawnDelay = getRandomSpawnDelay();
        timeoutRef.current = setTimeout(spawnFlag, nextSpawnDelay);
      };

      spawnFlag();
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [gameStarted, countdown, gameOver]);

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setMisses(0);
    setCountdown(3);
    setCurrentFlag(null);
    setFlagDuration(2000);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-white text-black">
      {!gameStarted ? (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={startGame}
            className="px-6 py-3 bg-blue-500 rounded-lg text-xl hover:bg-blue-600"
          >
            Start Game
          </button>
        </div>
      ) : countdown > 0 ? (
        <div className="flex items-center justify-center h-full text-6xl">
          {countdown}
        </div>
      ) : (
        <div className="relative h-full">
          <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md text-black">
            <p className="text-xl font-bold">Score: {score}</p>
            <p className="text-sm">Misses: {misses}/5</p>
          </div>

          {currentFlag && (
            <div
              style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                cursor: "pointer",
              }}
              onClick={handleFlagClick}
            >
              <Image
                src={currentFlag}
                alt="Flag"
                width={100}
                height={100}
                className="transition-opacity duration-200"
              />
            </div>
          )}

          {showEffect && (
            <div
              style={{
                position: "absolute",
                left: showEffect.pos.x,
                top: showEffect.pos.y,
                fontSize: "2rem",
              }}
            >
              {showEffect.type === "smash" ? "🩴" : "❌"}
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
              <h2 className="text-4xl mb-4">Game Over!</h2>
              <p className="text-2xl mb-4">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-500 rounded-lg text-xl hover:bg-blue-600"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
