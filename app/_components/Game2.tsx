"use client";

import React, { useState, useCallback } from "react";

// Array of flag images (you'll need to replace these with actual flag image URLs)
const FLAGS = [
  "/flag-india.webp",
  "/flag-israel.webp",
  "/iskcon-logo-250.jpg",
  "/al-league.jpg",
];

interface GameState {
  isStarted: boolean;
  isGameOver: boolean;
  isCountdownActive: boolean;
  countdown: number;
  score: number;
  misses: number;
  currentFlag: {
    top: number;
    left: number;
    image: string;
    isVisible: boolean;
  } | null;
  popupDuration: number;
  difficulty: number;
  feedbackEmoji: {
    emoji: string;
    top: number;
    left: number;
  } | null;
}

const FlagSmashGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    isGameOver: false,
    isCountdownActive: false,
    countdown: 3,
    score: 0,
    misses: 0,
    currentFlag: null,
    popupDuration: 2000, // Initial popup duration
    difficulty: 1,
    feedbackEmoji: null,
  });

  // Sounds
  const smashSound =
    typeof Audio !== "undefined" ? new Audio("/punch-sound.mp3") : null;
  const missSound =
    typeof Audio !== "undefined" ? new Audio("/miss-sound.mp3") : null;
  const gameOverSound =
    typeof Audio !== "undefined" ? new Audio("/emotional-sound.mp3") : null;
  const gameStartSound =
    typeof Audio !== "undefined" ? new Audio("/among-us.mp3") : null;

  const generateRandomPosition = () => {
    return {
      top: Math.random() * (window.innerHeight - 100),
      left: Math.random() * (window.innerWidth - 100),
    };
  };

  const spawnFlag = useCallback(() => {
    // Don't spawn flags if game is over
    if (gameState.isGameOver) return;

    const randomFlag = FLAGS[Math.floor(Math.random() * FLAGS.length)];
    const position = generateRandomPosition();

    setGameState((prev) => {
      // Adjust popup duration based on score milestones
      const newPopupDuration = calculatePopupDuration(prev.score);

      return {
        ...prev,
        currentFlag: {
          ...position,
          image: randomFlag,
          isVisible: true,
        },
        feedbackEmoji: null,
        popupDuration: newPopupDuration,
      };
    });

    // Auto-miss if not clicked in time
    setTimeout(() => {
      setGameState((prevState) => {
        // Don't process miss if game is already over
        if (prevState.isGameOver) return prevState;

        if (prevState.currentFlag?.isVisible) {
          if (prevState.misses >= 4) {
            // Play game over sad music
            gameOverSound?.play();

            return {
              ...prevState,
              isGameOver: true,
              isStarted: false,
              isCountdownActive: false,
              currentFlag: null,
              feedbackEmoji: {
                emoji: "❌",
                top: prevState.currentFlag.top,
                left: prevState.currentFlag.left,
              },
            };
          }

          // Play miss sound
          missSound?.play();

          return {
            ...prevState,
            misses: prevState.misses + 1,
            currentFlag: null,
            feedbackEmoji: {
              emoji: "❌",
              top: prevState.currentFlag.top,
              left: prevState.currentFlag.left,
            },
          };
        }
        return prevState;
      });

      // Spawn next flag after miss only if game is not over
      if (!gameState.isGameOver) {
        setTimeout(spawnFlag, 500);
      }
    }, gameState.popupDuration);
  }, [gameState.popupDuration, gameState.isGameOver, missSound, gameOverSound]);

  // Calculate popup duration based on score milestones
  const calculatePopupDuration = (score: number) => {
    if (score >= 75) return 800;
    if (score >= 50) return 1200;
    if (score >= 25) return 1500;
    return 2000;
  };

  const startCountdown = () => {
    setGameState((prev) => ({
      ...prev,
      isCountdownActive: true,
    }));
    gameStartSound?.play();

    const countdownInterval = setInterval(() => {
      setGameState((prev) => {
        if (prev.countdown > 1) {
          return { ...prev, countdown: prev.countdown - 1 };
        } else {
          clearInterval(countdownInterval);
          gameStartSound?.pause();
          spawnFlag();
          return {
            ...prev,
            countdown: 0,
            isStarted: true,
            isCountdownActive: false,
          };
        }
      });
    }, 1000);
  };

  const handleFlagSmash = () => {
    if (!gameState.currentFlag?.isVisible || gameState.isGameOver) return;

    // Play smash sound
    smashSound?.play();

    setGameState((prev) => {
      // Increase score and adjust difficulty
      const newScore = prev.score + 1;

      return {
        ...prev,
        score: newScore,
        currentFlag: null,
        feedbackEmoji: {
          emoji: "🩴",
          top: prev.currentFlag?.top || 0,
          left: prev.currentFlag?.left || 0,
        },
      };
    });

    // Spawn next flag after a short delay
    setTimeout(spawnFlag, 500);
  };

  const restartGame = () => {
    // Stop game over music if it's playing
    gameOverSound?.pause();
    gameOverSound!.currentTime = 0;

    setGameState({
      isStarted: false,
      isGameOver: false,
      isCountdownActive: false,
      countdown: 3,
      score: 0,
      misses: 0,
      currentFlag: null,
      popupDuration: 2000,
      difficulty: 1,
      feedbackEmoji: null,
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
      {/* Start Game Screen */}
      {!gameState.isStarted &&
        !gameState.isGameOver &&
        !gameState.isCountdownActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startCountdown}
              className="bg-green-500 text-white px-6 py-3 rounded-lg text-2xl hover:bg-green-600 transition"
            >
              Start Game
            </button>
          </div>
        )}

      {/* Countdown */}
      {gameState.isCountdownActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-9xl">
          {gameState.countdown}
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white">
          <h2 className="text-4xl mb-4">Game Over</h2>
          <p className="text-2xl mb-6">Your Score: {gameState.score}</p>
          <button
            onClick={restartGame}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-2xl hover:bg-blue-600 transition"
          >
            Restart Game
          </button>
        </div>
      )}

      {/* Score Display */}
      {gameState.isStarted && !gameState.isGameOver && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md">
          <p className="text-xl font-bold">Score: {gameState.score}</p>
          <p className="text-sm">Misses: {gameState.misses}/5</p>
        </div>
      )}

      {/* Feedback Emoji */}
      {gameState.feedbackEmoji && (
        <div
          className="absolute text-6xl animate-ping"
          style={{
            top: gameState.feedbackEmoji.top,
            left: gameState.feedbackEmoji.left,
          }}
        >
          {gameState.feedbackEmoji.emoji}
        </div>
      )}

      {/* Flag Popup */}
      {!gameState.isGameOver && gameState.currentFlag?.isVisible && (
        <div
          style={{
            position: "absolute",
            top: gameState.currentFlag.top,
            left: gameState.currentFlag.left,
            transition: "opacity 0.3s ease-out",
          }}
          className="cursor-pointer"
          onClick={handleFlagSmash}
        >
          <img
            src={gameState.currentFlag.image}
            alt="Flag"
            className="w-24 h-24 object-cover hover:scale-110 transition"
          />
        </div>
      )}
    </div>
  );
};

export default FlagSmashGame;
