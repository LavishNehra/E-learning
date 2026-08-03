import { useState, useContext, useEffect } from "react";
import { CurrentUserContext } from "../../App";
import { useNavigate, useParams, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faBook,
  faQuestionCircle,
  faPlus,
  faTrash,
  faSave,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import "./EditUnit.css";
import Front_ENV from "../../../Front_ENV.jsx";
import { getCookie } from "../Cookie/Cookie.jsx";
import Loader from "../Loader/Loader.jsx";

const EditUnit = () => {
  const { id: unitId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, showMessage } = useContext(CurrentUserContext);
  const courseId = location.state?.courseId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unit, setUnit] = useState({
    title: "",
    chapters: [
      {
        id: 1,
        title: "",
        sections: [
          {
            id: 1,
            heading: "",
            content: "",
            subSections: [
              {
                id: 1,
                subHeading: "",
                subContent: "",
              },
            ],
          },
        ],
        videoUrl: "",
        materials: "",
      },
    ],
    quiz: {
      title: "",
      questions: [
        {
          id: 1,
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    },
  });

  useEffect(() => {
    fetchUnitData();
  }, [unitId]);

  const fetchUnitData = async () => {
    try {
      const response = await fetch(
        `${Front_ENV.Back_Origin}/getUnit/${unitId}`,
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
        setUnit(data.data);
      } else {
        showMessage(data.error || "Failed to load unit", true);
        navigate(-1);
      }
    } catch (error) {
      showMessage("Error loading unit", true);
      console.error(error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUnit = async () => {
    if (!unit.title.trim()) {
      showMessage("Unit title is required", true);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${Front_ENV.Back_Origin}/updateUnit/${unitId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: getCookie("token") || "",
          },
          body: JSON.stringify(unit),
        }
      );

      const data = await response.json();

      if (!data.error) {
        showMessage("Unit updated successfully", false);
        if (courseId) {
          navigate(`/CourseDetails/${courseId}`);
        } else {
          navigate(-1);
        }
      } else {
        showMessage(data.error, true);
      }
    } catch (error) {
      showMessage("Error updating unit", true);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    setUnit({ ...unit, title: e.target.value });
  };

  const addChapter = () => {
    const newChapter = {
      id: unit.chapters.length + 1,
      title: "",
      sections: [
        {
          id: 1,
          heading: "",
          content: "",
          subSections: [
            {
              id: 1,
              subHeading: "",
              subContent: "",
            },
          ],
        },
      ],
      videoUrl: "",
      materials: "",
    };
    setUnit({ ...unit, chapters: [...unit.chapters, newChapter] });
  };

  const deleteChapter = (chapterIndex) => {
    if (unit.chapters.length === 1) {
      showMessage("At least one chapter is required", true);
      return;
    }
    const updatedChapters = unit.chapters.filter(
      (_, index) => index !== chapterIndex
    );
    setUnit({ ...unit, chapters: updatedChapters });
  };

  const handleChapterChange = (chapterIndex, field, value) => {
    const updatedChapters = unit.chapters.map((chapter, index) => {
      if (index === chapterIndex) {
        return { ...chapter, [field]: value };
      }
      return chapter;
    });
    setUnit({ ...unit, chapters: updatedChapters });
  };

  const addSection = (chapterIndex) => {
    const updatedChapters = unit.chapters.map((chapter, index) => {
      if (index === chapterIndex) {
        const newSection = {
          id: chapter.sections.length + 1,
          heading: "",
          content: "",
          subSections: [
            {
              id: 1,
              subHeading: "",
              subContent: "",
            },
          ],
        };
        return { ...chapter, sections: [...chapter.sections, newSection] };
      }
      return chapter;
    });
    setUnit({ ...unit, chapters: updatedChapters });
  };

  const deleteSection = (chapterIndex, sectionIndex) => {
    const updatedChapters = unit.chapters.map((chapter, index) => {
      if (index === chapterIndex) {
        if (chapter.sections.length === 1) {
          showMessage("At least one section is required per chapter", true);
          return chapter;
        }
        const updatedSections = chapter.sections.filter(
          (_, i) => i !== sectionIndex
        );
        return { ...chapter, sections: updatedSections };
      }
      return chapter;
    });
    setUnit({ ...unit, chapters: updatedChapters });
  };

  const handleSectionChange = (chapterIndex, sectionIndex, field, value) => {
    const updatedChapters = unit.chapters.map((chapter, cIndex) => {
      if (cIndex === chapterIndex) {
        const updatedSections = chapter.sections.map((section, sIndex) => {
          if (sIndex === sectionIndex) {
            return { ...section, [field]: value };
          }
          return section;
        });
        return { ...chapter, sections: updatedSections };
      }
      return chapter;
    });
    setUnit({ ...unit, chapters: updatedChapters });
  };

  const addQuizQuestion = () => {
    const newQuestion = {
      id: unit.quiz.questions.length + 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    setUnit({
      ...unit,
      quiz: {
        ...unit.quiz,
        questions: [...unit.quiz.questions, newQuestion],
      },
    });
  };

  const deleteQuizQuestion = (questionIndex) => {
    const updatedQuestions = unit.quiz.questions.filter(
      (_, index) => index !== questionIndex
    );
    setUnit({
      ...unit,
      quiz: {
        ...unit.quiz,
        questions: updatedQuestions,
      },
    });
  };

  const handleQuizQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = unit.quiz.questions.map((question, index) => {
      if (index === questionIndex) {
        return { ...question, [field]: value };
      }
      return question;
    });
    setUnit({
      ...unit,
      quiz: {
        ...unit.quiz,
        questions: updatedQuestions,
      },
    });
  };

  const handleQuizOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = unit.quiz.questions.map((question, qIndex) => {
      if (qIndex === questionIndex) {
        const updatedOptions = question.options.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            return value;
          }
          return option;
        });
        return { ...question, options: updatedOptions };
      }
      return question;
    });
    setUnit({
      ...unit,
      quiz: {
        ...unit.quiz,
        questions: updatedQuestions,
      },
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="create-unit-container">
      <div className="create-unit-header">
        <h1 className="page-title">
          <FontAwesomeIcon icon={faEdit} className="title-icon" />
          Edit Unit
        </h1>
      </div>

      <div className="unit-form">
        <div className="form-section">
          <h2 className="section-title">
            <FontAwesomeIcon icon={faLayerGroup} />
            Unit Information
          </h2>
          <div className="form-group">
            <label htmlFor="unitTitle">Unit Title</label>
            <input
              id="unitTitle"
              type="text"
              value={unit.title}
              onChange={handleTitleChange}
              placeholder="Enter unit title..."
              className="form-input"
            />
          </div>
        </div>

        {/* Chapters Section */}
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faBook} />
              Chapters ({unit.chapters.length})
            </h2>
            <button onClick={addChapter} className="add-button">
              <FontAwesomeIcon icon={faPlus} />
              Add Chapter
            </button>
          </div>

          {unit.chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="chapter-card">
              <div className="chapter-header">
                <h3>Chapter {chapterIndex + 1}</h3>
                <button
                  onClick={() => deleteChapter(chapterIndex)}
                  className="delete-button"
                  disabled={unit.chapters.length === 1}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              <div className="form-group">
                <label>Chapter Title</label>
                <input
                  type="text"
                  value={chapter.title}
                  onChange={(e) =>
                    handleChapterChange(chapterIndex, "title", e.target.value)
                  }
                  placeholder="Enter chapter title..."
                  className="form-input"
                />
              </div>

              {/* Sections */}
              <div className="sections-container">
                <div className="subsection-header">
                  <h4>Sections ({chapter.sections.length})</h4>
                  <button
                    onClick={() => addSection(chapterIndex)}
                    className="add-button small"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Section
                  </button>
                </div>

                {chapter.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="section-card">
                    <div className="section-header">
                      <h5>Section {sectionIndex + 1}</h5>
                      <button
                        onClick={() =>
                          deleteSection(chapterIndex, sectionIndex)
                        }
                        className="delete-button small"
                        disabled={chapter.sections.length === 1}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Section Heading</label>
                      <input
                        type="text"
                        value={section.heading}
                        onChange={(e) =>
                          handleSectionChange(
                            chapterIndex,
                            sectionIndex,
                            "heading",
                            e.target.value
                          )
                        }
                        placeholder="Enter section heading..."
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Section Content</label>
                      <textarea
                        value={section.content}
                        onChange={(e) =>
                          handleSectionChange(
                            chapterIndex,
                            sectionIndex,
                            "content",
                            e.target.value
                          )
                        }
                        placeholder="Enter section content..."
                        className="form-textarea"
                        rows="4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Section */}
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faQuestionCircle} />
              Quiz Questions ({unit.quiz.questions.length})
            </h2>
            <button onClick={addQuizQuestion} className="add-button">
              <FontAwesomeIcon icon={faPlus} />
              Add Question
            </button>
          </div>

          {unit.quiz.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="question-card">
              <div className="question-header">
                <h3>Question {questionIndex + 1}</h3>
                <button
                  onClick={() => deleteQuizQuestion(questionIndex)}
                  className="delete-button"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              <div className="form-group">
                <label>Question</label>
                <textarea
                  value={question.question}
                  onChange={(e) =>
                    handleQuizQuestionChange(
                      questionIndex,
                      "question",
                      e.target.value
                    )
                  }
                  placeholder="Enter your question..."
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="options-container">
                <label>Answer Options</label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-group">
                    <div className="option-input-group">
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() =>
                          handleQuizQuestionChange(
                            questionIndex,
                            "correctAnswer",
                            optionIndex
                          )
                        }
                        className="radio-input"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleQuizOptionChange(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}...`}
                        className="form-input option-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="form-actions">
          <button
            onClick={handleUpdateUnit}
            disabled={saving}
            className="save-button"
          >
            <FontAwesomeIcon icon={faSave} />
            {saving ? "Updating..." : "Update Unit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUnit;
