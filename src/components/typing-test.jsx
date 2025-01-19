import { useRef, useState, useEffect } from "react";
import "./style.css";
import { Modal, Button, Dropdown, Icon } from "semantic-ui-react";
import paragraphsData from "./type-test.json";

const timerOptions = [
  { key: 30, value: 30, text: "30 seconds" },
  { key: 60, value: 60, text: "60 seconds" },
  { key: 120, value: 120, text: "120 seconds" },
];

const levelOptions = [
  { key: "easy", value: "easy", text: "Easy" },
  { key: "medium", value: "medium", text: "Medium" },
  { key: "hard", value: "hard", text: "Hard" },
];

const TypingTest = () => {
  const [maxTime, setMaxTime] = useState(30);
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [mistakes, setMistakes] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [WPM, setWPM] = useState(0);
  const [CPM, setCPM] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [correctWrong, setCorrectWrong] = useState([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(
    getRandomParagraph("easy", 30)
  );
  const [level, setLevel] = useState("easy");
  const [selectedTime, setSelectedTime] = useState(30);
  const [intervalId, setIntervalId] = useState(null);

  const inputRef = useRef(null);
  const charRef = useRef([]);

  function getRandomParagraph(level, time) {
    const paragraphs = paragraphsData[level][time];
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    return paragraphs[randomIndex];
  }

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    if (isTyping && timeLeft > 0) {
      const newIntervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);

        const correctChars = charIndex - mistakes;
        const totalTime = maxTime - timeLeft;

        const cpm = correctChars * (60 / totalTime);
        setCPM(isFinite(cpm) && cpm > 0 ? parseInt(cpm, 10) : 0);

        const wpm = Math.round((correctChars / 5 / totalTime) * 60);
        setWPM(isFinite(wpm) && wpm > 0 ? wpm : 0);
      }, 1000);

      setIntervalId(newIntervalId);

      return () => clearInterval(newIntervalId);
    }

    if (timeLeft === 0) {
      setIsTyping(false);
      setShowResultModal(true);
    }
  }, [isTyping, timeLeft, maxTime, charIndex, mistakes]);

  const resetGame = () => {
    setTimeLeft(selectedTime);
    setIsTyping(false);
    setCharIndex(0);
    setMistakes(0);
    setCPM(0);
    setWPM(0);
    setInputValue("");
    setCorrectWrong(Array(currentParagraph.length).fill(""));
    inputRef.current.blur();
    setShowResultModal(false);
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    const characters = charRef.current;
    const currentChar = characters[charIndex];
    const typedChar = e.target.value.slice(-1);

    if (charIndex < characters.length && timeLeft > 0) {
      handleTypingStart();
      if (typedChar === currentChar.textContent) {
        correctWrong[charIndex] = "correct";
      } else {
        correctWrong[charIndex] = "wrong";
        setMistakes((prev) => prev + 1);
      }
      setCharIndex(charIndex + 1);
    }
  };

  const handleLevelChange = (e, { value }) => {
    setLevel(value);
    setCurrentParagraph(getRandomParagraph(value, selectedTime));
    resetGame();
  };

  const handleTimeChange = (e, { value }) => {
    setSelectedTime(value);
    setTimeLeft(value);
    setMaxTime(value);
    setCurrentParagraph(getRandomParagraph(level, value));
    setIsTyping(false);
    setCharIndex(0);
    setMistakes(0);
    setCPM(0);
    setWPM(0);
    setInputValue("");
    setCorrectWrong(Array(currentParagraph.length).fill(""));
  };

  const refreshParagraph = () => {
    setCurrentParagraph(getRandomParagraph(level, selectedTime));
    resetGame();
  };

  const accuracy = CPM > 0 ? ((1 - mistakes / CPM) * 100).toFixed(2) : "0";
  return (
    <div className="whole-content">
      <h1 className="header">Rapid Typer</h1>
      <div className="typing-test-container">
        <div className="typing-test-container-div1">
          <div className="stats-box">
            <p>
              <strong>Time Left:</strong> {timeLeft} seconds
            </p>
          </div>
          <Icon
            name="refresh"
            size="large"
            onClick={refreshParagraph}
            className="refresh-icon"
          />
        </div>
        <div className="paragraph-box">
          {currentParagraph.split("").map((char, index) => (
            <span
              key={index}
              className={`char ${index === charIndex ? "active" : ""} ${
                correctWrong[index]
              }`}
              ref={(el) => (charRef.current[index] = el)}
            >
              {char}
            </span>
          ))}
        </div>
        <input
          type="text"
          className="input-field"
          placeholder="Type To Start...."
          value={inputValue}
          ref={inputRef}
          onChange={handleChange}
          onKeyDown={handleTypingStart}
        />

        <div className="level-time-dropdowns">
          <Dropdown
            fluid
            selection
            options={levelOptions}
            value={level}
            onChange={handleLevelChange}
            placeholder="Select Level"
            className="level-time-dropdowns-dp"
          />
          <Dropdown
            fluid
            selection
            options={timerOptions}
            value={selectedTime}
            onChange={handleTimeChange}
            placeholder="Select Time"
            className="level-time-dropdowns-dp"
          />
        </div>
        <Button className="reset-button" onClick={resetGame}>
          Try Again
        </Button>

        {/* Result Modal */}
        <Modal open={showResultModal} size="small">
          <Modal.Header>
            <h2>Typing Test Results</h2>
          </Modal.Header>
          <Modal.Content>
            <div>
              <p>
                <strong>Mistakes:</strong> {mistakes}
              </p>
              <p>
                <strong>WPM:</strong> {WPM}
              </p>
            </div>
            <div>
              <p>
                <strong>CPM:</strong> {CPM}
              </p>
              <p>
                <strong>Accuracy:</strong> {accuracy}%
              </p>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={resetGame} className="try-again-button">
              Try Again
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
      <div className="footer">
        <p>@Rapidtyper | Visit again</p>
      </div>
    </div>
  );
};

export default TypingTest;
