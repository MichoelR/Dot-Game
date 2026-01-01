import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography, TextField, Slider } from "@mui/material";
import './App.css'; // Import the App.css file

const shapeOptions = [
	{ label: 'Dots', value: 'dots' },
	{ label: 'Squares', value: 'squares' },
	{ label: 'Both', value: 'both' },
  ];

const colorOptions = [
	{ label: 'Red', value: 'red', color: 'red' },
	{ label: 'Blue', value: 'blue', color: 'blue' },
	{ label: 'Black', value: 'black', color: 'black' },
	{
	  label: 'Many',
	  value: 'many',
	  gradient: 'linear-gradient(90deg, red, blue, green, yellow)',
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

const CustomRadioButton: React.FC<CustomRadioButtonProps>  = ({ label, value, selectedValue, onChange, color, gradient }) => (
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
          selectedValue === value ? "radio-button-selected" : "radio-button-unselected"
        }`}
        style={{
          background: gradient || undefined,
          backgroundColor: gradient ? "transparent" : color,
		            width: '40px', // Adjust width as needed
          height: '40px', // Adjust height as needed
          borderRadius:
		   (value === 'both') ? '20px 20px 0 0' :
		   (value === 'squares') ? '0%' :
		   '50%' , // Rounded top for "Both"
        }}
      >  
        {selectedValue === value && <span className="radio-button-dot-inner" />}      
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
          marginLeft: '10px', // Space between the button and text
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
const ButtonGrid: React.FC<ButtonGridProps>  = ({ buttons, clickedButton, handleButtonClick, buttonsDisabled }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
	{buttons.length > 0 ? (
	  buttons.map((buttonValue) => (
		<Button
		  key={buttonValue}
		  variant={clickedButton === buttonValue ? "contained" : "outlined"}
		  onClick={() => handleButtonClick(buttonValue)}
		  disabled={buttonsDisabled}
		  sx={{
			fontSize: '30px',    // Set larger font size
			fontWeight: 'bold',  // Bold font weight
			color: 'white',      // Text color
			minHeight: '50px',   // Increase button height
			padding: '12px 20px', // Add padding
			backgroundColor: '#3f51b5', // Set background color for guess buttons
			':hover': {
			  backgroundColor: '#303f9f', // Darker color on hover
			}
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

const DotGuessingGame: React.FC = () => {

type Dot = {
  x?: number; // existing property (you might already have this)
  y?: number; // existing property (you might already have this)
  size?: number; // assuming size is used somewhere in your code
  color?: string; // assuming you have a color for dots
  shape?: 'circle' | 'square'; // shape can be 'circle' or 'square'
  top?: string; // CSS position value like '50%'
  left?: string; // CSS position value like '50%'
};

  const [dots, setDots] = useState<Dot[]>([]);
  const [numDots, setNumDots] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(7);
  const [shapeType, setShapeType] = useState<string>("dots"); // Default
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [minDots, setMinDots] = useState<number>(4); // Initial value for MIN
  const [maxDots, setMaxDots] = useState<number>(10); // Initial value for MAX
  const [dotSize, setDotSize] = useState<number>(75); // Initial size for dots
  const [colorType, setColorType] = useState<string>("blue"); // Default
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [initialTimeLimit, setInitialTimeLimit] = useState<number>(7); // Default to 7 seconds
  const [guessButtons, setGuessButtons] = useState<number[]>([]);
  const [clickedButton, setClickedButton] = useState<number | null>(null); // Track the clicked button
  const [buttonsDisabled, setButtonsDisabled] = useState<boolean>(false); // New state to disable buttons


  useEffect(() => { // restart game
    if (isGameRunning) {
      //startGame();
      
      // Focus the input field when the game starts
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isGameRunning]);

	useEffect(() => { // timer
	  if (isGameRunning) {
		if (timeLeft > 0 && !buttonsDisabled) {
		  const timer = setTimeout(() => {
			setTimeLeft(timeLeft - 1); // Decrement time left every second
		  }, 1000);
		  return () => clearTimeout(timer);
		} else if (timeLeft === 0) {
		  // If the timer reaches zero
		  setMessage(""); // Clear any messages
		  setIsGameRunning(false); // Stop the game when time runs out

		  // Start the next game after a short delay
		  setTimeout(() => {
			startGame(); // Restart the game
			//setTimeLeft(initialTimeLimit); // Reset time for the new round
			//setIsGameRunning(true); // Re-enable the game for the new round
		  }, 1000); // Delay before the next round starts
		}
	  }
	}, [timeLeft, isGameRunning, initialTimeLimit, buttonsDisabled]);

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
		}))
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
		}))
	  );
	}, [colorType]);


const startGame = () => { // reset _next set_
  const randomNumDots = Math.floor(Math.random() * (maxDots - minDots + 1)) + minDots; // Use min and max values

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
    };
  });

  setDots(generatedDots);
  setNumDots(randomNumDots);
  setButtonsDisabled(false);
  setTimeLeft(initialTimeLimit);
  setIsGameRunning(true);
  setMessage("");
  setGuess("");
  setClickedButton(null); // Reset clicked button state here
  
  // Generate guess buttons
  
  // Clear button focus - in case next round has same button ids
    let buttons = document.querySelectorAll('.MuiButton-root');
    buttons.forEach((button: HTMLButtonElement) => {
      button.blur(); // Remove focus outline
    });
	
  const numButtons = (maxDots-minDots+1 < 8) ? maxDots-minDots+1 : 8; // number of buttons to show
  console.log('nmB:'+numButtons);
  const possibleRanges = [];
  
  // Generate all possible ranges of N numbers containing the correct answer, and staying in range
  for (let start = Math.max(minDots, randomNumDots - numButtons + 1);
          (start <= randomNumDots) && (start <= maxDots - numButtons + 1);
		  start++) {
      possibleRanges.push(Array.from({ length: numButtons }, (_, i) => start + i));
  }
  // Randomly pick one of the valid ranges
  const selectedRange = possibleRanges[Math.floor(Math.random() * possibleRanges.length)];
  
  // Set the guess buttons
  setGuessButtons(selectedRange);

  // Ensure the input field refocuses every time the game starts or resets
  inputRef.current?.focus();
  
};

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
	  // If no guess was made, start the next game without any message
	  if (currentGuess.trim() === "") {
		console.log('No guess was made.');
		setTimeout(startGame, 0); // Delay before starting the next game if no guess
		return;
	  }

	  // Determine if the guess is correct
	  if (parseInt(currentGuess) === numDots) {
		setMessage("Correct!");
		setCorrectCount(correctCount + 1); // Increment correct count
	  } else {
		setMessage(`Incorrect - ${numDots}!`);
		setIncorrectCount(incorrectCount + 1); // Increment incorrect count
	  }
	  
	  // Keep the game running, but disable buttons and stop the timer
	  setButtonsDisabled(true); // Disable guess buttons and stop timer

	  setTimeout(() => {
		startGame(); // Start the next round
	  }, 2000);
	};

  const handleEndGame = () => {
	  setIsGameRunning(false); // Stop the game
	  setTimeLeft(initialTimeLimit); // Reset the timer
	  setButtonsDisabled(true); // disable guess buttons
	  setMessage("Game Over!"); // Show game over message
	  //setCorrectCount(0); // Reset correct count
	  //setIncorrectCount(0); // Reset incorrect count
	  setDots([]); // Clear the dots
	  setGuessButtons([]); // Clear the guess buttons
  };

  const handleStartGame = () => {
    //setIsGameRunning(true);
	startGame();
	setCorrectCount(0); // Reset correct count
	setIncorrectCount(0); // Reset incorrect count

  };

  // Function to generate random color
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
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
		  <Typography className="slider-text" component="span" sx={{ fontWeight: "bold", fontSize: "30px"}}>

		    Dot Size: {dotSize}px
		  </Typography>
          <Slider value={dotSize} min={10} max={150} step={5}
		    onChange={(_,newValue) => setDotSize(newValue as unknown as number)}
		    sx={{ width: "100%" }} />
        </Box>

        {/* Time Limit Slider */}
        <Box sx={{ width: "100%", textAlign: "center", marginBottom: "30px" }}>
          <Typography className="slider-text" sx={{ fontWeight: "bold", fontSize: "30px"}}>
		    Time Limit: {initialTimeLimit} seconds
	      </Typography>
          <Slider value={initialTimeLimit} min={1} max={15} step={1}
		    onChange={(_,newValue) => setInitialTimeLimit(newValue as unknown as number)}
		    sx={{ width: "100%", color: "secondary.main" }} />
        </Box>

		{/* Input fields for MIN and MAX */}
		<Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
		  <TextField
			label="MIN"
			type="number"
			value={minDots}
			onChange={(e) => setMinDots(Number(e.target.value))}
			variant="outlined"
			size="small"
			sx={{ width: "45%" }}
			InputLabelProps={{
			  sx: { fontSize: "30px", fontWeight: "bold" }, // Adjust label size and weight
			}}
			InputProps={{
			  sx: { fontSize: "30px", fontWeight: "bold", padding: "10px" }, // Adjust input text size and padding
			}}
		  />
		  <TextField
			label="MAX"
			type="number"
			value={maxDots}
			onChange={(e) => setMaxDots(Number(e.target.value))}
			variant="outlined"
			size="small"
			sx={{ width: "45%" }}
			InputLabelProps={{
			  sx: { fontSize: "30px", fontWeight: "bold" }, // Adjust label size and weight
			}}
			InputProps={{
			  sx: { fontSize: "30px", fontWeight: "bold", padding: "10px" }, // Adjust input text size and padding
			}}
		  />
		</Box>
		
      </Box>

  {/* middle column, with main box for dots */}
    {/* Timer Display - Centered Above the Main Box */}
      {isGameRunning && (
        <Typography variant="h6" 
		  className="timer"
		  sx={{
		    fontSize: "30px",
			fontWeight: "bold",
		  }}
		>
          Time left: {timeLeft}s
        </Typography>
      )}

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
          <Typography variant="h6" className="counter-correct" 
		    sx={{ fontWeight: "bold", fontSize: "30px"}}
		  >
            Correct: {correctCount}
          </Typography>
          <Typography variant="h6" className="counter-incorrect"
		    sx={{ fontWeight: "bold", fontSize: "30px"}}
		  >
            Incorrect: {incorrectCount}
          </Typography>
        </Box>
	</Box>

      {/* Right Column */}
      <Box className="right-column">
	  
		<Button 
		  variant="outlined" 
		  color="secondary" 
		  onClick={isGameRunning ? handleEndGame : handleStartGame}
		  sx={{
			fontSize: '30px',    // Set larger font size
			fontWeight: 'bold',  // Bold font weight
			color: 'white',      // Bright text color
			padding: '12px 20px', // Padding for larger button size
			backgroundColor: 'black', // Customize the button background
			':hover': {
			  backgroundColor: '#d81b60', // Darker color on hover
			}
		  }}
		>
		  {isGameRunning ? 'STOP' : 'START'}
		</Button>
		
        <TextField
          label="How many?"
          variant="outlined"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyPress={(e) => {
		    const target = e.target as HTMLInputElement;
		    if (e.key === "Enter") {
			  checkGuess(target.value)
			}
		  }}
          sx={{ width: "220px" }}
		  InputLabelProps={{
			sx: { fontSize: "30px", fontWeight: "bold" }, // Adjust label size and weight
		  }}
		  InputProps={{
			sx: { fontSize: "30px", padding: "10px" }, // Adjust input text size and padding
		  }}

        />
		
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
