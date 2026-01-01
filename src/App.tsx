import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import "./App.css"; // Import the App.css file

let playerState = {
  currentLevel: 1,
  score: 0, // overall score correct for all rounds
  totalScore: 0, // overall total Score
  correctCount: 0, // for this round
  incorrectCount: 0, // for this round
  initialTimeLimit: 7, // seconds
};

const shapeOptions = [
  { label: "DOTS", value: "dots" },
  { label: "SQUARES", value: "squares" },
  { label: "BOTH", value: "both" },
];

const colorOptions = [
  { label: "Red", value: "red", color: "red" },
  { label: "Blue", value: "blue", color: "blue" },
  { label: "Black", value: "black", color: "black" },
  {
    label: "Many",
    value: "many",
    gradient: "linear-gradient(90deg, red, blue, green, yellow)",
  },
];

type CustomRadioButtonProps = {
  label: string;
  value: string;
  selectedValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  color: string;
  gradient?: string;
};

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  label,
  value,
  selectedValue,
  onChange,
  color,
  gradient,
}) => (
  <Box className="radio-button-container">
    <label className="radio-button-label">
      <input
        type="radio"
        value={value}
        checked={selectedValue === value}
        onChange={onChange}
        className="radio-button-hidden" // Hides the native radio button
      />
      <span
        className={`radio-button-dot ${
          selectedValue === value
            ? "radio-button-selected"
            : "radio-button-unselected"
        }`}
        style={{
          background: gradient || undefined,
          backgroundColor:
            value === "both" ? "transparent" : gradient ? "transparent" : color,
          width: value === "both" ? "20px" : "40px", // Smaller square for "both"
          height: value === "both" ? "20px" : "40px", // Smaller square for "both"
          position: "relative",
          marginTop: value === "both" ? "10px" : "0px",
          border: value === "both" ? `2px solid ${color}` : "none",
          borderRadius:
            value === "both" ? "0%" : value === "squares" ? "0%" : "50%", // Square for "Both"
        }}
      >
        {selectedValue === value && <span className="radio-button-dot-inner" />}
        {value === "both" && (
          <span
            style={{
              position: "absolute",
              top: "-10px",
              left: "-10px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
        )}
      </span>
      <span
        className={`radio-button-label-text ${
          gradient ? "gradient-text" : "radio-button-text-default"
        }`}
        style={{
          background: gradient || undefined, // Apply the gradient background
          fontWeight: "bold",
          fontSize: "20px", // Make the text larger
          WebkitBackgroundClip: gradient ? "text" : undefined,
          backgroundClip: gradient ? "text" : undefined, // Standard background-clip
          marginLeft: "10px", // Space between the button and text
          marginTop: value === "both" ? "6px" : "0px",
        }}
      >
        {label}
      </span>
    </label>
  </Box>
);

type ButtonGridProps = {
  buttons: string[];
  clickedButton: string | number;
  handleButtonClick: (value: string | number) => void;
  buttonsDisabled: boolean;
};

// Reusable ButtonGrid Component
const ButtonGrid: React.FC<ButtonGridProps> = ({
  buttons,
  clickedButton,
  handleButtonClick,
  buttonsDisabled,
}) => (
  <Box
    sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}
  >
    {buttons.length > 0 ? (
      buttons.map((buttonValue) => (
        <Button
          key={buttonValue}
          variant={clickedButton === buttonValue ? "contained" : "outlined"}
          onClick={() => handleButtonClick(buttonValue)}
          disabled={buttonsDisabled}
          sx={{
            fontSize: "30px", // Set larger font size
            fontWeight: "bold", // Bold font weight
            color: "white", // Text color
            minHeight: "50px", // Increase button height
            padding: "12px 20px", // Add padding
            backgroundColor: "#3f51b5", // Set background color for guess buttons
            ":hover": {
              backgroundColor: "#303f9f", // Darker color on hover
            },
          }}
        >
          {buttonValue}
        </Button>
      ))
    ) : (
      <Typography>No guesses available</Typography>
    )}
  </Box>
);

const LevelUpDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onChooseMoreDots: () => void;
  onChooseLessTime: () => void;
  onChooseFasterDrifting: () => void;
}> = ({
  open,
  onClose,
  onChooseMoreDots,
  onChooseLessTime,
  onChooseFasterDrifting,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Difficulty</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Choose your challenge: More dots, less time, or faster drifting?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            onChooseMoreDots();
            onClose();
          }}
        >
          MORE DOTS
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            onChooseLessTime();
            onClose();
          }}
        >
          LESS TIME
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            onChooseFasterDrifting();
            onClose();
          }}
        >
          FASTER DRIFTING
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DotGuessingGame: React.FC = () => {
  type Dot = {
    x?: number; // existing property (you might already have this)
    y?: number; // existing property (you might already have this)
    size?: number; // assuming size is used somewhere in your code
    color?: string; // assuming you have a color for dots
    shape?: "circle" | "square"; // shape can be 'circle' or 'square'
    top?: string; // CSS position value like '50%'
    left?: string; // CSS position value like '50%'
    vxSign?: number; // direction x for drifting (-1 or 1)
    vySign?: number; // direction y for drifting (-1 or 1)
    r?: number; // speed factor for drifting
  };

  const [dots, setDots] = useState<Dot[]>([]);
  const [numDots, setNumDots] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(7);
  const [shapeType, setShapeType] = useState<string>("dots"); // Default
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false); // Level-up notification
  const [minDots, setMinDots] = useState<number>(1); // Initial value for MIN
  const [maxDots, setMaxDots] = useState<number>(4); // Initial value for MAX
  const [dotSize, setDotSize] = useState<number>(75); // Initial size for dots
  const [colorType, setColorType] = useState<string>("blue"); // Default
  const inputRef = useRef<HTMLInputElement>(null);
  const [guessButtons, setGuessButtons] = useState<number[]>([]);
  const [clickedButton, setClickedButton] = useState<number | null>(null); // Track the clicked button
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false); // New state to disable buttons
  const [isLevelUpDialogOpen, setIsLevelUpDialogOpen] =
    useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [driftSpeed, setDriftSpeed] = useState<number>(0);

  useEffect(() => {
    // restart game
    if (isGameRunning) {
      // Focus the input field when the game starts
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isGameRunning]);

  useEffect(() => {
    // timer
    if (isGameRunning && !isPaused) {
      if (timeLeft > 0 && !buttonsDisabled) {
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1); // Decrement time left every second
        }, 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        // If the timer reaches zero
        setMessage(""); // Clear any messages
        setIsGameRunning(false);
        setIsPaused(false); // Stop the game
        setIsPaused(false); // Reset pause state when time runs out

        // Start the next game after a short delay
        setTimeout(() => {
          startOneGame(); // Restart the game
        }, 250); // Delay before the next round starts
      }
    }
  }, [
    timeLeft,
    isGameRunning,
    buttonsDisabled,
    isPaused,
  ]);

  useEffect(() => {
    // Update dot shapes immediately when `shapeType` changes
    setDots((prevDots) =>
      prevDots.map((dot) => ({
        ...dot,
        shape:
          shapeType === "dots"
            ? "circle"
            : shapeType === "squares"
              ? "square"
              : Math.random() < 0.5
                ? "circle"
                : "square", // Random if 'both'
      })),
    );
  }, [shapeType]);

  useEffect(() => {
    // Update dot colors immediately when `colorType` changes
    setDots((prevDots) =>
      prevDots.map((dot) => ({
        ...dot,
        color:
          colorType === "red"
            ? "red"
            : colorType === "blue"
              ? "blue"
              : colorType === "black"
                ? "black"
                : getRandomColor(), // Random if 'many'
      })),
    );
  }, [colorType]);



  useEffect(() => {
    if (isGameRunning && !isPaused) {
      if (timeLeft > 0 && !buttonsDisabled) {
        const timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        setMessage("");
        setIsGameRunning(false);
        setIsPaused(false);
        setTimeout(() => {
          startOneGame();
        }, 250);
      }
    }
    /* if (!isPaused) {
      const interval = setInterval(() => {
        setDots((prevDots) =>
          prevDots.map((dot) => {
        if (!dot.vxSign || !dot.vySign || !dot.r) {
          return dot;
        }

        let vxSign = dot.vxSign;
        let vySign = dot.vySign;

        let deltaX = vxSign * driftSpeed * dot.r;
        let deltaY = vySign * driftSpeed * dot.r;

        let newTop = parseFloat(dot.top || "0") + deltaY;
        let newLeft = parseFloat(dot.left || "0") + deltaX;

  //         // Bounce off edges (top 0-90%, left 0-95% to avoid border)
        if (newTop <= 0 || newTop >= 90) {
          vySign = -vySign;
          newTop = Math.max(0, Math.min(90, newTop));
        }
        if (newLeft <= 0 || newLeft >= 94) {
          vxSign = -vxSign;
          newLeft = Math.max(0, Math.min(94, newLeft));
        }

        return {
          ...dot,
          vxSign,
          vySign,
          top: newTop + "%",
          left: newLeft + "%",
        }
      });
  //     // Check for collisions between dots
  // if (bouncingEnabled) {
  //   for (let i = 0; i < updatedDots.length; i++) {
  //     for (let j = i + 1; j < updatedDots.length; j++) {
  //       const dot1 = updatedDots[i];
  //       const dot2 = updatedDots[j];
  //       if (!dot1 || !dot2) continue;

  //       const cx1 = parseFloat(dot1.left || "0") + 20;
  //       const cy1 = parseFloat(dot1.top || "0") + 20;
  //       const cx2 = parseFloat(dot2.left || "0") + 20;
  //       const cy2 = parseFloat(dot2.top || "0") + 20;

  //       if (Math.abs(cx1 - cx2) < 40 && Math.abs(cy1 - cy2) < 40) {
  //         // Collision: reverse directions
  //         const tempVx = dot1.vxSign;
  //         const tempVy = dot1.vySign;
  //         dot1.vxSign = dot2.vxSign;
  //         dot1.vySign = dot2.vySign;
  //         dot2.vxSign = tempVx;
  //         dot2.vySign = tempVy;
  //       }
  //     }
  //   }
  // }
        }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
    } */
  }, [timeLeft, isGameRunning, buttonsDisabled, isPaused]);

  const resetMinMax = (level) => {
    // just setting initial values after moving a level
    const min = level;
    const max = level > 3 ? 2 * level : level + 4; // expand range gradually till 8 choices
    setMinDots(min);
    setMaxDots(max);
  };

  const startOneGame = () => {
    // reset and start _next set_

    const randomNumDots =
      Math.floor(Math.random() * (maxDots - minDots + 1)) + minDots; // Use min and max values

    const generatedDots: Dot[] = Array.from({ length: randomNumDots }, () => {
      let shape;
      if (shapeType === "dots") {
        shape = "circle"; // Only generate circles
      } else if (shapeType === "squares") {
        shape = "square"; // Only generate squares
      } else {
        // Randomly assign shape if "both" is selected
        shape = Math.random() < 0.5 ? "circle" : "square";
      }

      let color;
      if (colorType === "red") {
        color = "red"; // Only generate red dots
      } else if (colorType === "blue") {
        color = "blue"; // Only generate blue dots
      } else if (colorType === "black") {
        color = "black"; // Only generate black dots
      } else {
        color = getRandomColor(); // Assign random color for "many"
      }

      return {
        top: Math.random() * 90 + "%",
        left: Math.random() * 90 + "%",
        shape: shape,
        color: color, // Assign color based on selection
        vxSign: Math.random() > 0.5 ? 1 : -1,
        vySign: Math.random() > 0.5 ? 1 : -1,
        r: Math.abs(Math.random() - 0.5) * 2, // 0 to 1
      };
    });

    setDots(generatedDots);
    setNumDots(randomNumDots);
    setButtonsDisabled(false);
    setTimeLeft(playerState.initialTimeLimit);
    setIsGameRunning(true);
    setMessage("");
    setGuess("");
    setClickedButton(null); // Reset clicked button state here

    // Generate guess buttons

    // Clear button focus - in case next round has same button ids
    let buttons = document.querySelectorAll(".MuiButton-root");
    buttons.forEach((button: HTMLButtonElement) => {
      button.blur(); // Remove focus outline
    });

    const numButtons = maxDots - minDots + 1 < 8 ? maxDots - minDots + 1 : 8; // number of buttons to show
    const possibleRanges = [];

    // Generate all possible ranges of N numbers containing the correct answer, and staying in range
    for (
      let start = Math.max(minDots, randomNumDots - numButtons + 1);
      start <= randomNumDots && start <= maxDots - numButtons + 1;
      start++
    ) {
      possibleRanges.push(
        Array.from({ length: numButtons }, (_, i) => start + i),
      );
    }
    // Randomly pick one of the valid ranges
    const selectedRange =
      possibleRanges[Math.floor(Math.random() * possibleRanges.length)];

    // Set the guess buttons
    setGuessButtons(selectedRange);

    // Ensure the input field refocuses every time the game starts or resets
    inputRef.current?.focus();
  }; // END startOneGame

  // Reset the clicked button state whenever new dots are generated
  useEffect(() => {
    setClickedButton(null); // Reset clicked button state when dots change
  }, [dots]);

  const handleButtonClick = (value: number) => {
    const newGuess = value.toString(); // Set the guess based on button clicked
    setGuess(newGuess); // Update the guess state
    setClickedButton(value); // Store which button was clicked

    // Disable buttons and stop the timer immediately
    setButtonsDisabled(true); // Disable guess buttons

    // Check the guess directly here, passing the new guess value
    checkGuess(newGuess); // Process the guess
  };

  const checkGuess = (currentGuess: string) => {
    let correctCount = playerState.correctCount;
    let incorrectCount = playerState.incorrectCount;

    // If no guess was made, start the next game without any message
    if (currentGuess.trim() === "") {
      console.log("No guess was made.");
      setTimeout(startOneGame, 0); // Delay before starting the next game if no guess
      return;
    }

    playerState.totalScore++; // increment overall total

    // Determine if the guess is correct
    if (parseInt(currentGuess) === numDots) {
      correctCount++; // correct for this round
      playerState.score++; // increment overall corrects score
      setMessage("Correct!");
    } else {
      setMessage(`Incorrect - ${numDots}!`);
      incorrectCount++; // Increment incorrect count, not score
    }

    // every 10 answers, check if they level up or down
    /*if ((correctCount + incorrectCount) % 10 === 0) {*/
    let levelUpHappened = false;
    if ((correctCount + incorrectCount) % 5 === 0) {
      if (incorrectCount == 0) {
        // perfect
        levelUpHappened = true;
        advanceLevel();
      } else if (correctCount < 2 && playerState.currentLevel > 0) {
        demoteLevel();
      }
      // reset the counts for the next round
      correctCount = 0;
      incorrectCount = 0;
    }

    playerState.correctCount = correctCount; // Anyhow, reset correct count
    playerState.incorrectCount = incorrectCount; // and incorrect count

    // Keep the game running, but disable buttons and stop the timer
    setButtonsDisabled(true); // Disable guess buttons and stop timer

    // Only start next game if not leveling up
    if (!levelUpHappened) {
      setTimeout(() => {
        startOneGame(); // Start the next game
      }, 250);
    }
  };

  function advanceLevel() {
    showLevelUpPopup(); // find out how they want to increase the level
  }

  function demoteLevel() {
    if (playerState.currentLevel > 0) {
      playerState.currentLevel--;
      showLevelDownPopup();
      resetMinMax(playerState.currentLevel);
    }
  }

  function showLevelUpPopup() {
    setIsPaused(true); // Pause the game while dialog is open
    setIsLevelUpDialogOpen(true);
  }

  function showLevelDownPopup() {
    alert(
      `Let's try an easier level for a bit. You are now on Level ` +
        playerState.currentLevel +
        `. Keep going!`,
    );
  }

  // Handle user choice
  const handleChooseMoreDots = () => {
    // Implement logic for "More Dots" choice
    // e.g., Increase the number of dots for the next level
    console.log("User chose More Dots");
    playerState.currentLevel++;
    resetMinMax(playerState.currentLevel);
    setIsPaused(false); // Resume the game after choice
    startOneGame(); // Start the next game with new level
  };

  const handleChooseLessTime = () => {
    // Implement logic for "Less Time" choice
    // e.g., Decrease the time limit for the next level
    console.log("User chose Less Time");
    if (playerState.initialTimeLimit == 1) {
      // can't decrease
      console.log("can't decrease time to 0!");
    } else {
      playerState.initialTimeLimit--;
    }
    setIsPaused(false); // Resume the game after choice
    startOneGame(); // Start the next game with new time limit
  };

  const handleChooseFasterDrifting = () => {
    // Implement logic for "Faster Drifting" choice
    console.log("User chose Faster Drifting");
    setDriftSpeed(Math.min(driftSpeed + 0.5, 4.0)); // Increase speed by 0.5, cap at 4.0
    setIsPaused(false); // Resume the game after choice
    startOneGame(); // Start the next game with faster drifting
  };

  const handleEndGame = () => {
    setIsGameRunning(false); // Stop the game
    setTimeLeft(playerState.initialTimeLimit); // Reset the timer
    setButtonsDisabled(true); // disable guess buttons
    setMessage("Game Over!"); // Show game over message
    setDots([]); // Clear the dots
    setGuessButtons([]); // Clear the guess buttons
  };

  const handleStartGame = () => {
    setIsPaused(false);
    playerState.correctCount = 0; // Reset correct count
    playerState.incorrectCount = 0; // Reset incorrect count

    playerState.score = 0;
    playerState.totalScore = 0;
    resetMinMax(playerState.currentLevel); // set min and max dots
    startOneGame();
  };

  // Function to generate random color
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <Box className="main-container">
      {/* Left Column */}
      <Box className="left-column">
        {/* Shape Selection */}
        <Box className="shape-selection">
          {shapeOptions.map((shape) => (
            <CustomRadioButton
              key={shape.value}
              label={shape.label}
              value={shape.value}
              selectedValue={shapeType}
              onChange={() => setShapeType(shape.value)}
              color="blue"
            />
          ))}
        </Box>

        {/* Color Selection */}
        <Box className="color-selection">
          {colorOptions.map((color0) => (
            <CustomRadioButton
              key={color0.value}
              label={color0.label}
              value={color0.value}
              selectedValue={colorType}
              onChange={() => setColorType(color0.value)}
              color={color0.color}
              gradient={color0.gradient}
            />
          ))}
        </Box>

        {/* Dot Size Slider */}
        <Box sx={{ width: "100%", textAlign: "center", marginBottom: "30px" }}>
          <Typography
            className="slider-text"
            component="span"
            sx={{ fontWeight: "bold", fontSize: "30px" }}
          >
            Dot Size: {dotSize}px
          </Typography>
          <Slider
            value={dotSize}
            min={10}
            max={150}
            step={5}
            onChange={(_, newValue) =>
              setDotSize(newValue as unknown as number)
            }
            sx={{ width: "100%" }}
          />
        </Box>

        {/* Time Limit Slider */}
        <Box sx={{ width: "100%", textAlign: "center", marginBottom: "30px" }}>
          <Typography
            className="slider-text"
            sx={{ fontWeight: "bold", fontSize: "30px" }}
          >
            Time Limit: {playerState.initialTimeLimit} seconds
          </Typography>
          <Slider
            value={playerState.initialTimeLimit}
            min={1}
            max={15}
            step={1}
            onChange={(_, newValue) =>
              (playerState.initialTimeLimit = newValue)
            }
            sx={{ width: "100%", color: "secondary.main" }}
          />
        </Box>

        {/* Level Selection */}
        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (playerState.currentLevel > 1) {
                playerState.currentLevel--;
                resetMinMax(playerState.currentLevel);
              }
            }}
            sx={{
              fontSize: "30px",
              fontWeight: "bold",
              minWidth: "50px",
              padding: "10px",
            }}
          >
            -
          </Button>
          <Typography
            sx={{
              fontSize: "30px",
              fontWeight: "bold",
              minWidth: "100px",
              textAlign: "center",
            }}
          >
            Level: {playerState.currentLevel}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              playerState.currentLevel++;
              resetMinMax(playerState.currentLevel);
            }}
            sx={{
              fontSize: "30px",
              fontWeight: "bold",
              minWidth: "50px",
              padding: "10px",
            }}
          >
            +
          </Button>
        </Box>

        {/* Display for MIN and MAX */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "30px",
          }}
        >
          <Typography
            sx={{
              fontSize: "30px",
              fontWeight: "bold",
              width: "45%",
              textAlign: "center",
              padding: "10px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
            }}
          >
            Min: {minDots}
          </Typography>
          <Typography
            sx={{
              fontSize: "30px",
              fontWeight: "bold",
              width: "45%",
              textAlign: "center",
              padding: "10px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
            }}
          >
            Max: {maxDots}
          </Typography>
        </Box>

        {/* Drifting Dots Speed Slider */}
        <Box sx={{ width: "100%", textAlign: "center", marginBottom: "30px" }}>
          <Typography
            sx={{ fontSize: "30px", fontWeight: "bold", marginBottom: "10px" }}
          >
            Drifting Dots Speed: {driftSpeed.toFixed(2)}
          </Typography>
          <Slider
            value={driftSpeed}
            min={0}
            max={4.0}
            step={0.1}
            onChange={(_, newValue) => setDriftSpeed(newValue as number)}
            sx={{ width: "80%" }}
          />
        </Box>
      </Box>

      {/* middle column, with main box for dots */}
      {/* Top Display for Level and Score */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
        }}
      >
        <Typography
          variant="h6"
          className="level"
          sx={{ fontSize: "30px", fontWeight: "bold" }}
        >
          Level: {playerState.currentLevel}
        </Typography>
        <Typography
          variant="h6"
          className="score"
          sx={{ fontSize: "30px", fontWeight: "bold" }}
        >
          Score: {playerState.score}/{playerState.totalScore}
        </Typography>

        {/* Timer Display */}

        <Typography
          variant="h6"
          className="timer"
          sx={{
            fontSize: "30px",
            fontWeight: "bold",
          }}
        >
          Time left: {timeLeft}s
        </Typography>
      </Box>

      {/* Display Level-Up Popup */}
      {showLevelUp && (
        <Box
          className="level-up-popup"
          sx={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "20px",
            backgroundColor: "#ffeb3b",
            borderRadius: "10px",
            zIndex: 10,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Level Up! Now on Level {playerState.currentLevel}
        </Box>
      )}

      {/* Difficulty choice dialog */}
      <LevelUpDialog
        open={isLevelUpDialogOpen}
        onClose={() => setIsLevelUpDialogOpen(false)}
        onChooseMoreDots={handleChooseMoreDots}
        onChooseLessTime={handleChooseLessTime}
        onChooseFasterDrifting={handleChooseFasterDrifting}
      />

      {/* Main Box for Dots */}
      <Box
        sx={{
          width: "70%",
          height: "85vh",
          border: "2px solid black",
          position: "relative",
          marginTop: "20px",
          marginRight: "20px",
        }}
      >
        {dots.map((dot, index) => (
          <Box
            key={index}
            sx={{
              width: dotSize,
              height: dotSize,
              borderRadius: dot.shape === "circle" ? "50%" : "0%",
              backgroundColor: dot.color || "red",
              border: "2px solid black",
              position: "absolute",
              top: dot.top,
              left: dot.left,
            }}
          />
        ))}
      </Box>

      {/* Result message and counters container - under main box */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "absolute",
          bottom: "20px", // Adjust to save room for the main box
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%", // Use full width of the parent
        }}
      >
        {/* Result message */}
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: message.includes("Correct") ? "green" : "red", // Optional: color based on message
            flexGrow: 1, // Allow the message to take up remaining space
            marginRight: "80px", // Ensure space for the counters
            fontWeight: "bold",
            minHeight: "40px", // Reserve space for the result message (adjust height as necessary)
            display: "flex",
            alignItems: "center", // Vertically center the message within the reserved space
            justifyContent: "center", // Center the message horizontally
          }}
        >
          {message}
        </Typography>

        <Box className="counters">
          <Typography
            variant="h6"
            className="counter-correct"
            sx={{ fontWeight: "bold", fontSize: "30px" }}
          >
            Correct: {playerState.correctCount}
          </Typography>
          <Typography
            variant="h6"
            className="counter-incorrect"
            sx={{ fontWeight: "bold", fontSize: "30px" }}
          >
            Incorrect: {playerState.incorrectCount}
          </Typography>
        </Box>
      </Box>

      {/* Right Column */}
      <Box className="right-column">
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            if (!isGameRunning) {
              handleStartGame();
            } else if (isPaused) {
              setIsPaused(false);
            } else {
              setIsPaused(true);
            }
          }}
          sx={{
            fontSize: "30px", // Set larger font size
            fontWeight: "bold", // Bold font weight
            color: "white", // Bright text color
            padding: "12px 20px", // Padding for larger button size
            backgroundColor: "black", // Customize the button background
            ":hover": {
              backgroundColor: "#d81b60", // Darker color on hover
            },
          }}
        >
          {!isGameRunning ? "START" : isPaused ? "RESUME" : "PAUSE"}
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={handleStartGame}
          sx={{
            fontSize: "30px",
            fontWeight: "bold",
            color: "white",
            padding: "12px 20px",
            backgroundColor: "red",
            marginLeft: "10px",
            ":hover": {
              backgroundColor: "#b71c1c",
            },
          }}
        >
          RESTART
        </Button>

        <ButtonGrid
          buttons={guessButtons.map((button) => button.toString())}
          clickedButton={clickedButton}
          handleButtonClick={handleButtonClick}
          buttonsDisabled={buttonsDisabled}
        />
      </Box>
    </Box>
  );
};

export default DotGuessingGame;
