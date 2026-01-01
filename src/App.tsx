import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import "./App.css"; // Import the App.css file

let playerState = {
  currentLevel: 3,
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
    <label className="radio-button-label" style={{ position: "relative" }}>
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
        {selectedValue === value && value !== "both" && (
          <>
            <span className="radio-button-dot-inner" />
            {value === "squares" && (
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "0%",
                  backgroundColor: "white",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
          </>
        )}
        {value === "both" && (
          <>
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
            >
              {selectedValue === value && (
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "white",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </span>
            <span
              style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "16px",
                height: "16px",
                borderRadius: "0%",
                border: `2px solid black`,
                backgroundColor: "transparent",
              }}
            />
            {selectedValue === value && (
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "8px",
                  height: "8px",
                  borderRadius: "0%",
                  backgroundColor: "black",
                }}
              />
            )}
          </>
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
  canFasterDrift: boolean;
}> = ({
  open,
  onClose,
  onChooseMoreDots,
  onChooseLessTime,
  onChooseFasterDrifting,
  canFasterDrift,
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
          disabled={!canFasterDrift}
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

const LevelDownDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onChooseDownLevel: () => void;
  onChooseMoreTime: () => void;
  onChooseSlowerDrifting: () => void;
  canDownLevel: boolean;
  canSlowerDrift: boolean;
}> = ({
  open,
  onClose,
  onChooseDownLevel,
  onChooseMoreTime,
  onChooseSlowerDrifting,
  canDownLevel,
  canSlowerDrift,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Adjust Difficulty</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Choose your challenge: Down a level, more time, or slower drifting?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          disabled={!canDownLevel}
          onClick={() => {
            onChooseDownLevel();
            onClose();
          }}
        >
          DOWN A LEVEL
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            onChooseMoreTime();
            onClose();
          }}
        >
          MORE TIME
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={!canSlowerDrift}
          onClick={() => {
            onChooseSlowerDrifting();
            onClose();
          }}
        >
          SLOWER DRIFTING
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DotGuessingGame: React.FC = () => {
  type Dot = {
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

  const [message, setMessage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(7);
  const [shapeType, setShapeType] = useState<string>("dots"); // Default
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);


  const [minDots, setMinDots] = useState<number>(1); // Initial value for MIN
  const [maxDots, setMaxDots] = useState<number>(4); // Initial value for MAX
  const [dotSize, setDotSize] = useState<number>(75); // Initial size for dots
  const [colorType, setColorType] = useState<string>("blue"); // Default
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [guessButtons, setGuessButtons] = useState<number[]>([]);
  const [clickedButton, setClickedButton] = useState<number | null>(null); // Track the clicked button
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false); // New state to disable buttons
  const [isLevelUpDialogOpen, setIsLevelUpDialogOpen] =
    useState<boolean>(false);
  const [isLevelDownDialogOpen, setIsLevelDownDialogOpen] =
    useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [driftSpeed, setDriftSpeed] = useState<number>(0);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // restart game

      // Focus the input field when the game starts
      if (inputRef.current) {
        inputRef.current.focus();
      }
  }, [isGameRunning]);

  useEffect(() => {
    // timer
    let timer: number | undefined;
    if (isGameRunning && !isPaused) {
      if (timeLeft > 0 && !buttonsDisabled) {
        timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1); // Decrement time left every second
        }, 1000);
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
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, isGameRunning, isPaused, buttonsDisabled]);

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
          let timer: number | undefined;
          if (isGameRunning && !isPaused) {
            if (timeLeft > 0 && !buttonsDisabled) {
              timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
              }, 1000);
            } else if (timeLeft === 0) {
              setMessage("");
              setIsGameRunning(false);
              setIsPaused(false);
              setTimeout(() => {
                startOneGame();
              }, 250);
            }
            intervalRef.current = setInterval(() => {
              setDots((prevDots) => {
                return prevDots.map((dot) => {
                  if (!dot.vxSign || !dot.vySign || !dot.r) {
                    return dot;
                  }
                  let vxSign = dot.vxSign;
                  let vySign = dot.vySign;
                  let deltaX = vxSign * driftSpeed * dot.r;
                  let deltaY = vySign * driftSpeed * dot.r;
                  let newTop = parseFloat(dot.top || "0") + deltaY;
                  let newLeft = parseFloat(dot.left || "0") + deltaX;
                  if (newTop <= 0 || newTop >= 90) {
                    vySign = -vySign;
                    newTop = Math.max(0, Math.min(90, newTop));
                  }
                  if (newLeft <= 0 || newLeft >= 94) {
                    vxSign = -vxSign;
                    newLeft = Math.max(0, Math.min(94, newLeft));
                  }
                  return {
                    color: dot.color,
                    shape: dot.shape,
                    top: newTop + "%",
                    left: newLeft + "%",
                    vxSign,
                    vySign,
                    r: dot.r
                  };
                });
              });
            }, 50);
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
          return () => {
            if (timer) clearTimeout(timer);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          };
        }, [timeLeft, isGameRunning, isPaused, buttonsDisabled, driftSpeed]);



  const resetMinMax = (level: number) => {
    // just setting initial values after moving a level
    const min = level;
    const max = level > 3 ? 2 * level : level + 4; // expand range gradually till 8 choices
    setMinDots(min);
    setMaxDots(max);
  };

  const startOneGame = () => {
    // Clear any existing drifting interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // reset and start _next set_

    const randomNumDots =
      Math.floor(Math.random() * (maxDots - minDots + 1)) + minDots; // Use min and max values

    const generatedDots: Dot[] = Array.from({ length: randomNumDots }, () => {
      let shape;
      if (shapeType === "dots") {
        shape = "circle"; // Only generate circles
      } else if (shapeType === "squares") {
        shape = "square"; // Only generate squares
      }
      else {
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
      }
      else {
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
      setIsGameRunning(false); // Stop the current game
      setTimeout(() => {
        startOneGame(); // Start the next game
      }, 250);
    }
  };

  function advanceLevel() {
    showLevelUpPopup(); // find out how they want to increase the level
  }

  function demoteLevel() {
    showLevelDownPopup();
  }

  function showLevelUpPopup() {
    setIsPaused(true); // Pause the game while dialog is open
    setIsLevelUpDialogOpen(true);
  }

  function showLevelDownPopup() {
    setIsPaused(true); // Pause the game while dialog is open
    setIsLevelDownDialogOpen(true);
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

  const handleChooseMoreTime = () => {
    // Implement logic for "More Time" choice
    console.log("User chose More Time");
    playerState.initialTimeLimit++; // Increase time limit
    setIsPaused(false); // Resume the game after choice
    startOneGame(); // Start the next game with new time limit
  };

  const handleChooseDownLevel = () => {
    // Implement logic for "Down a Level" choice
    console.log("User chose Down a Level");
    if (playerState.currentLevel > 0) {
      playerState.currentLevel--;
      resetMinMax(playerState.currentLevel);
    }
    setIsPaused(false); // Resume the game after choice
    startOneGame(); // Start the next game with new level
  };

  const handleChooseFasterDrifting = () => {
    // Implement logic for "Faster Drifting" choice
    console.log("User chose Faster Drifting");
    setDriftSpeed(Math.min(driftSpeed + 0.5, 4.0)); // Increase speed by 0.5, cap at 4.0
    setIsPaused(false); // Resume the game after choice
    startOneGame(); // Start the next game with faster drifting
  };

  const handleChooseSlowerDrifting = () => {
    // Implement logic for "Slower Drifting" choice
    console.log("User chose Slower Drifting");
    setDriftSpeed(Math.max(driftSpeed - 0.5, 0.0)); // Decrease speed by 0.5, floor at 0.0
    setIsPaused(false); // Resume the game after choice
    startOneGame(); // Start the next game with slower drifting
  };

  const handleKeepGoing = () => {
    // Just resume without changes
    console.log("User chose Keep Going");
    setIsPaused(false);
    startOneGame();
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
              (playerState.initialTimeLimit = newValue as number)
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
            Drifting Dots Speed: {driftSpeed === 0 ? "Off" : driftSpeed.toFixed(2)}
          </Typography>
          <Slider
            value={driftSpeed}
            min={0}
            max={4.0}
            step={0.1}
            onChange={(_, newValue) => setDriftSpeed(newValue as number)}
            sx={{
              width: "80%",
              height: "24px",
              "& .MuiSlider-track": {
                height: "8px",
              },
              "& .MuiSlider-rail": {
                height: "8px",
              },
              "& .MuiSlider-thumb": {
                width: "24px",
                height: "24px",
              },
            }}
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



      {/* Difficulty choice dialog */}
      <LevelUpDialog
        open={isLevelUpDialogOpen}
        onClose={() => {
          setIsLevelUpDialogOpen(false);
          setIsPaused(false);
          startOneGame();
        }}
        onChooseMoreDots={handleChooseMoreDots}
        onChooseLessTime={handleChooseLessTime}
        onChooseFasterDrifting={handleChooseFasterDrifting}
        canFasterDrift={driftSpeed < 4.0}
      />

      {/* Difficulty adjustment dialog */}
      <LevelDownDialog
        open={isLevelDownDialogOpen}
        onClose={() => {
          setIsLevelDownDialogOpen(false);
          setIsPaused(false);
          startOneGame();
        }}
        onChooseDownLevel={handleChooseDownLevel}
        onChooseMoreTime={handleChooseMoreTime}
        onChooseSlowerDrifting={handleChooseSlowerDrifting}
        canDownLevel={playerState.currentLevel > 1}
        canSlowerDrift={driftSpeed > 0.0}
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
              border: "2px solid white",
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
