import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { CurrentUserContext } from "../../App";
import { getCookie } from "../Cookie/Cookie.jsx";
import Front_ENV from "../../../Front_ENV.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faQuestionCircle,
  faChevronDown,
  faChevronRight,
  faLayerGroup,
  faArrowLeft,
  faClock,
  faPlay,
  faStop,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import "./Unit.css";
import Loader from "../Loader/Loader";

const Unit = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showMessage, currentUser } = useContext(CurrentUserContext);
  const [unit, setUnit] = useState(null);
  const [allUnits, setAllUnits] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // Timer and Time states
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(25); // Default 25 minutes

  const courseId = location.state?.courseID;

  const fetchUnit = async () => {
    try {
      const response = await fetch(`${Front_ENV.Back_Origin}/getUnit/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: getCookie("token") || "",
        },
      });

      const data = await response.json();

      if (data.data) {
        setUnit(data.data);
      } else {
        showMessage(data.error || "Failed to load unit", true);
      }
    } catch (error) {
      showMessage("Error loading unit", true);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUnits = async () => {
    if (!courseId) return;

    try {
      const response = await fetch(
        `${Front_ENV.Back_Origin}/getCourseUnits/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: getCookie("token") || "",
          },
        }
      );

      const data = await response.json();

      if (data.data) {
        setAllUnits(data.data);
      }
    } catch (error) {
      console.error("Error loading course units:", error);
    }
  };

  const fetchCourseInfo = async () => {
    if (!courseId) return;

    try {
      const response = await fetch(
        `${Front_ENV.Back_Origin}/getCourse/${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: getCookie("token") || "",
          },
        }
      );

      const data = await response.json();

      if (data.data) {
        setCourseInfo(data.data);
      }
    } catch (error) {
      console.error("Error loading course info:", error);
    }
  };

  useEffect(() => {
    fetchUnit();
    fetchAllUnits();
    fetchCourseInfo();
  }, [id, courseId]);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      // Timer finished - could add notification here
      alert("Timer finished!");
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startTimer = () => {
    setTimerSeconds(timerMinutes * 60);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatTimerTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex],
    }));
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const submitQuiz = () => {
    if (!unit?.quiz?.questions) return;

    const results = unit.quiz.questions.map((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      const correctOptionIndex = question.correctAnswer; // Backend sends correctAnswer field
      const isCorrect = selectedAnswer === correctOptionIndex;

      return {
        question: question.question,
        selectedAnswer:
          selectedAnswer !== undefined
            ? question.options[selectedAnswer]
            : "Not answered",
        correctAnswer: question.options[correctOptionIndex],
        isCorrect,
      };
    });

    const score = results.filter((result) => result.isCorrect).length;
    const percentage = Math.round((score / unit.quiz.questions.length) * 100);

    setQuizResults({
      results,
      score,
      total: unit.quiz.questions.length,
      percentage,
    });
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
  };

  if (loading) return <Loader />;

  if (!unit) {
    return (
      <div className="unit-error">
        <h3>Unit not found</h3>
        <button onClick={() => navigate(-1)} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="unit-reading-container">
      {/* Fixed Navigation Header */}
      <div className="unit-nav-header">
        <button
          onClick={() => {
            if (courseId) {
              navigate(`/CourseDetails/${courseId}`);
            } else {
              navigate("/courses");
            }
          }}
          className="nav-back-button"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Course</span>
        </button>

        {/* Center Time Display and Timer */}
        <div className="nav-center-section">
          <div className="current-time">
            <FontAwesomeIcon icon={faClock} className="time-icon" />
            <span className="time-display">{formatTime(currentTime)}</span>
          </div>

          <div className="timer-section">
            {timerActive ? (
              <div className="active-timer">
                <span className="timer-display">
                  {formatTimerTime(timerSeconds)}
                </span>
                <button
                  className="timer-control-btn stop-btn"
                  onClick={stopTimer}
                >
                  <FontAwesomeIcon icon={faStop} />
                </button>
              </div>
            ) : (
              <div className="timer-controls">
                <input
                  type="number"
                  value={timerMinutes}
                  onChange={(e) =>
                    setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  max="120"
                  className="timer-input"
                  placeholder="25"
                />
                <span className="timer-label">min</span>
                <button
                  className="timer-control-btn start-btn"
                  onClick={startTimer}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="unit-progress">
          <div className="unit-meta">
            <FontAwesomeIcon icon={faLayerGroup} className="unit-meta-icon" />
            <span className="unit-title-nav">{unit.title}</span>
          </div>
        </div>
      </div>

      {/* Main Reading Content */}
      <div className="reading-layout">
        {/* Table of Contents Sidebar */}
        <div className="toc-sidebar">
          <div className="toc-header">
            <FontAwesomeIcon icon={faBook} />
            <div className="header-text">
              <h3>{courseInfo?.title || "Course"}</h3>
            </div>
          </div>

          <div className="toc-search">
            <input
              type="text"
              placeholder="Search..."
              className="toc-search-input"
            />
          </div>

          <div className="toc-content">
            {allUnits?.map((unitItem, index) => (
              <div key={unitItem.id} className="toc-unit">
                <button
                  className={`toc-unit-btn ${
                    unitItem.id === unit?.id ? "active" : ""
                  }`}
                  onClick={() =>
                    navigate(`/Unit/${unitItem.id}`, {
                      state: { courseID: courseId },
                    })
                  }
                >
                  <div className="unit-details">
                    <span className="unit-title">{unitItem.title}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Reading Area */}
        <div className="reading-content">
          <div className="unit-title-section">
            <h1 className="unit-main-title">{unit.title}</h1>
            <div className="unit-meta-info">
              <span className="chapter-count">
                <FontAwesomeIcon icon={faBook} />
                {unit.chapters?.length || 0} Chapters
              </span>
              {unit.quiz?.questions?.length > 0 && (
                <span className="quiz-count">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  {unit.quiz.questions.length} Quiz Questions
                </span>
              )}
            </div>
          </div>

          {/* Reading Content */}
          <div className="reading-sections">
            {unit.chapters?.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="reading-chapter">
                <div className="chapter-title-section">
                  <h2 className="chapter-title">
                    <span className="chapter-number">
                      Chapter {chapterIndex + 1}
                    </span>
                    {chapter.title}
                  </h2>
                </div>

                <div className="chapter-reading-content">
                  {chapter.sections?.map((section, sectionIndex) => (
                    <section
                      key={sectionIndex}
                      id={`section-${chapterIndex}-${sectionIndex}`}
                      className="reading-section"
                    >
                      <h3 className="section-title">{section.title}</h3>
                      <div className="section-content">
                        <p className="section-text">{section.content}</p>
                      </div>

                      {section.subsections?.map(
                        (subsection, subsectionIndex) => (
                          <div
                            key={subsectionIndex}
                            className="reading-subsection"
                          >
                            <h4 className="subsection-title">
                              {subsection.title}
                            </h4>
                            <div className="subsection-content">
                              <p className="subsection-text">
                                {subsection.content}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </section>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quiz Section */}
          {unit.quiz?.questions?.length > 0 && (
            <div id="unit-quiz" className="reading-quiz-section">
              <div className="quiz-title-section">
                <h2 className="quiz-title">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  Unit Assessment
                </h2>
                <p className="quiz-description">
                  Test your understanding of the concepts covered in this unit.
                </p>
              </div>

              {!showQuiz ? (
                <div className="quiz-start-card">
                  <div className="quiz-info">
                    <h3>Ready to test your knowledge?</h3>
                    <p>
                      This quiz contains {unit.quiz.questions.length} questions
                      based on the material you just read.
                    </p>
                    <ul className="quiz-tips">
                      <li>Take your time to read each question carefully</li>
                      <li>You can review your answers before submitting</li>
                      <li>
                        You'll see your results immediately after submission
                      </li>
                    </ul>
                  </div>
                  <button
                    className="start-quiz-button"
                    onClick={() => setShowQuiz(true)}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    Start Quiz
                  </button>
                </div>
              ) : (
                <div className="quiz-content">
                  {!quizSubmitted ? (
                    <div className="quiz-questions">
                      <div className="quiz-progress">
                        <span>
                          Progress: {Object.keys(selectedAnswers).length}/
                          {unit.quiz.questions.length} answered
                        </span>
                      </div>

                      {unit.quiz.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="question-card">
                          <div className="question-header">
                            <span className="question-number">
                              Question {questionIndex + 1}
                            </span>
                            <h4 className="question-text">
                              {question.question}
                            </h4>
                          </div>

                          <div className="question-options">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="option-label">
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  value={optionIndex}
                                  checked={
                                    selectedAnswers[questionIndex] ===
                                    optionIndex
                                  }
                                  onChange={() =>
                                    handleAnswerSelect(
                                      questionIndex,
                                      optionIndex
                                    )
                                  }
                                />
                                <span className="option-text">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="quiz-actions">
                        <button
                          className="submit-quiz-btn"
                          onClick={submitQuiz}
                          disabled={
                            Object.keys(selectedAnswers).length <
                            unit.quiz.questions.length
                          }
                        >
                          Submit Quiz
                        </button>
                        <button
                          className="cancel-quiz-btn"
                          onClick={() => setShowQuiz(false)}
                        >
                          Cancel Quiz
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="quiz-results">
                      <div className="results-header">
                        <h3>Quiz Results</h3>
                        <div className="score-display">
                          <span className="score">
                            {quizResults.score}/{quizResults.total}
                          </span>
                          <span className="percentage">
                            ({quizResults.percentage}%)
                          </span>
                        </div>
                      </div>

                      <div className="results-details">
                        {quizResults.results.map((result, index) => (
                          <div
                            key={index}
                            className={`result-item ${
                              result.isCorrect ? "correct" : "incorrect"
                            }`}
                          >
                            <h4>
                              Question {index + 1}: {result.question}
                            </h4>
                            <p>
                              <strong>Your answer:</strong>{" "}
                              {result.selectedAnswer}
                            </p>
                            <p>
                              <strong>Correct answer:</strong>{" "}
                              {result.correctAnswer}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="quiz-actions">
                        <button className="retake-quiz-btn" onClick={resetQuiz}>
                          Retake Quiz
                        </button>
                        <button
                          className="close-quiz-btn"
                          onClick={() => setShowQuiz(false)}
                        >
                          Close Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unit;
