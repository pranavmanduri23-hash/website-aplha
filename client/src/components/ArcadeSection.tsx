import { useState } from 'react';
import { Gamepad2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface GameScore {
  name: string;
  score: number;
}

export default function ArcadeSection() {
  // Number Guesser Game
  const [showNumberGuesser, setShowNumberGuesser] = useState(false);
  const [targetNumber, setTargetNumber] = useState(Math.floor(Math.random() * 50) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [numberGuesserHighScore, setNumberGuesserHighScore] = useState(0);

  const handleNumberGuess = () => {
    if (!guess.trim()) {
      toast.error('Please enter a number');
      return;
    }

    const guessNum = parseInt(guess);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 50) {
      toast.error('Please enter a number between 1 and 50');
      return;
    }

    if (guessNum === targetNumber) {
      setWon(true);
      setGameOver(true);
      const score = attempts * 10;
      if (score > numberGuesserHighScore) {
        setNumberGuesserHighScore(score);
        toast.success(`🎉 You won! Score: ${score}`);
      } else {
        toast.success(`You won! Score: ${score}`);
      }
    } else if (guessNum < targetNumber) {
      toast.info('Too low! Try higher.');
      setAttempts(attempts - 1);
      setGuess('');
    } else {
      toast.info('Too high! Try lower.');
      setAttempts(attempts - 1);
      setGuess('');
    }

    if (attempts - 1 <= 0 && guessNum !== targetNumber) {
      setGameOver(true);
      setWon(false);
      toast.error(`Game Over! The number was ${targetNumber}`);
    }
  };

  const resetNumberGuesser = () => {
    setTargetNumber(Math.floor(Math.random() * 50) + 1);
    setGuess('');
    setAttempts(5);
    setGameOver(false);
    setWon(false);
  };

  // Fast Clicker Game
  const [showFastClicker, setShowFastClicker] = useState(false);
  const [clickerStarted, setClickerStarted] = useState(false);
  const [clickerTime, setClickerTime] = useState(10);
  const [clickerScore, setClickerScore] = useState(0);
  const [clickerHighScore, setClickerHighScore] = useState(0);
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 });

  const startFastClicker = () => {
    setClickerStarted(true);
    setClickerScore(0);
    setClickerTime(10);
    let timeLeft = 10;

    const timer = setInterval(() => {
      timeLeft--;
      setClickerTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        setClickerStarted(false);
        if (clickerScore > clickerHighScore) {
          setClickerHighScore(clickerScore);
          toast.success(`🎉 Game Over! Final Score: ${clickerScore}`);
        } else {
          toast.info(`Game Over! Final Score: ${clickerScore}`);
        }
      }
    }, 1000);
  };

  const handleTargetClick = () => {
    if (!clickerStarted) return;

    setClickerScore(clickerScore + 1);
    const randomX = Math.random() * 80 + 10;
    const randomY = Math.random() * 60 + 20;
    setButtonPosition({ x: randomX, y: randomY });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        <Gamepad2 className="w-6 h-6 text-secondary" />
        Arcade Games
      </h2>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Number Guesser Card */}
        <div
          className="p-6 rounded-lg cursor-pointer transition-all duration-300"
          style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(24, 28, 50, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 212, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(24, 28, 50, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(37, 80, 140, 0.4)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <h3 className="text-xl font-bold text-primary mb-2">🎯 Number Guesser</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Guess the mystery number between 1 and 50. You have 5 attempts!
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="text-muted-foreground">High Score</div>
              <div className="text-2xl font-bold text-accent">{numberGuesserHighScore}</div>
            </div>
            <Button
              onClick={() => {
                resetNumberGuesser();
                setShowNumberGuesser(true);
              }}
              className="neon-button"
            >
              Play Now
            </Button>
          </div>
        </div>

        {/* Fast Clicker Card */}
        <div
          className="p-6 rounded-lg cursor-pointer transition-all duration-300"
          style={{
            background: 'rgba(24, 28, 50, 0.4)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(37, 80, 140, 0.4)',
            border: '1px solid'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(24, 28, 50, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 212, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(24, 28, 50, 0.4)';
            e.currentTarget.style.borderColor = 'rgba(37, 80, 140, 0.4)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <h3 className="text-xl font-bold text-secondary mb-2">⚡ Fast Clicker</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click the target button as many times as possible in 10 seconds!
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="text-muted-foreground">High Score</div>
              <div className="text-2xl font-bold text-accent">{clickerHighScore}</div>
            </div>
            <Button
              onClick={() => {
                setClickerScore(0);
                setClickerTime(10);
                setClickerStarted(false);
                setShowFastClicker(true);
              }}
              className="neon-button"
            >
              Play Now
            </Button>
          </div>
        </div>
      </div>

      {/* Number Guesser Game Dialog */}
      <Dialog open={showNumberGuesser} onOpenChange={setShowNumberGuesser}>
        <DialogContent style={{
          background: 'rgba(24, 28, 50, 0.9)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          border: '1px solid'
        }}>
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl">🎯 Number Guesser</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!gameOver ? (
              <>
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Guess the number between 1 and 50</p>
                  <div className="flex gap-4 justify-center items-center">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Attempts Left</div>
                      <div className="text-4xl font-bold text-primary">{attempts}</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Enter your guess"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNumberGuess()}
                    className="flex-1 px-4 py-2 rounded text-foreground"
                    style={{
                      background: 'rgba(24, 28, 50, 0.5)',
                      borderColor: 'rgba(37, 80, 140, 0.5)',
                      border: '1px solid'
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleNumberGuess}
                    className="neon-button"
                  >
                    Guess
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">{won ? '🎉' : '😢'}</div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {won ? 'You Won!' : 'Game Over!'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {won ? `The number was ${targetNumber}` : `The number was ${targetNumber}`}
                  </p>
                  <div className="text-3xl font-bold text-accent mb-6">
                    Score: {attempts * 10}
                  </div>
                </div>

                <Button
                  onClick={resetNumberGuesser}
                  className="neon-button w-full gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fast Clicker Game Dialog */}
      <Dialog open={showFastClicker} onOpenChange={setShowFastClicker}>
        <DialogContent style={{
          background: 'rgba(24, 28, 50, 0.9)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          border: '1px solid'
        }}>
          <DialogHeader>
            <DialogTitle className="text-secondary text-2xl">⚡ Fast Clicker</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!clickerStarted ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Click as many times as you can in 10 seconds!</p>
                <Button
                  onClick={startFastClicker}
                  className="neon-button gap-2 text-lg px-6 py-3"
                >
                  Start Game
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className="text-3xl font-bold text-primary">{clickerScore}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Time Left</div>
                    <div className="text-3xl font-bold text-secondary">{clickerTime}s</div>
                  </div>
                </div>

                <div className="relative w-full h-64 rounded-lg border-2" style={{
                  background: 'rgba(24, 28, 50, 0.5)',
                  borderColor: 'rgba(0, 212, 255, 0.3)'
                }}>
                  <button
                    onClick={handleTargetClick}
                    className="absolute w-12 h-12 rounded-full transition-all duration-100"
                    style={{
                      left: `${buttonPosition.x}%`,
                      top: `${buttonPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      background: 'linear-gradient(135deg, oklch(0.65 0.22 200), oklch(0.60 0.25 320))',
                      boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)'
                    }}
                    title="Click me!"
                  />
                </div>

                {clickerTime === 0 && (
                  <Button
                    onClick={() => {
                      setShowFastClicker(false);
                    }}
                    className="neon-button w-full"
                  >
                    Close
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
