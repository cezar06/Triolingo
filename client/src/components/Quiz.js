import React, { useState, useEffect } from "react";

function Quiz() {
  const [username, setUsername] = useState("");
  const [weakestSkills, setWeakestSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults] = useState(null);

  // async function fetchWeakestSkills() {
  //   const response = await fetch(`http://localhost:5000/api/weakestSkills?username=${username}`);
  //   const data = await response.json();
  //   setWeakestSkills(data);
  // }

  // async function fetchQuestions() {
  //   const response = await fetch("http://localhost:5000/api/questions/vocabulary");
  //   const data = await response.json();
  //   setQuestions(data);
  // }

  async function fetchQuestionsWeakest() {
    const response = await fetch(
      `http://localhost:5000/api/questions/weak-skills?username=${username}`
    );
    const data = await response.json();
    console.log("Fetched questions:", data);
    setQuestions(data);

    setQuestions(data);
  }

  async function submitAnswers() {
    const storedUsername = localStorage.getItem("username");

    // Ensure every question has an answer, even if it's an empty string
    const answersWithIds = questions.map((question) => ({
      questionId: question.question_id,
      answer: selectedAnswers[question.question_id] || "",
    }));

    const response = await fetch("http://localhost:5000/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: storedUsername,
        answers: answersWithIds,
      }),
    });
    console.log("Submitting answers:", answersWithIds);

    if (response.ok) {
      const data = await response.json();
      const newResults = data.results.reduce((acc, result) => {
        acc[result.questionId] = result;
        return acc;
      }, {});
      setResults(newResults);
      console.log(newResults); // Log the new results to the console
      alert(data.message);
    } else {
      alert("There was a problem submitting your answers.");
    }
  }

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (username) {
      //fetchWeakestSkills();
      fetchQuestionsWeakest();
    }
  }, [username]);

  function handleAnswerChange(questionId, answer) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  return (
    <div>
      <h2>Practice vocabulary, grammar</h2>
      {questions.map((question) => {
        let choices = question.choices.split(",");
        const result = results ? results[question.question_id] : null;
        const isCorrect = result ? result.correct : null;
        const textColor =
          isCorrect === null ? "black" : isCorrect ? "green" : "red";

        return (
          <div
            key={question.question_id}
            style={{ marginBottom: "20px", color: textColor }}
          >
            <span>
              <strong>{question.skill_name}</strong>:{" "}
            </span>
            <span style={{ color: textColor }}>
              {question.sentence.split("___").map((part, index, array) =>
                index < array.length - 1 ? (
                  <span key={`${question.question_id}-${index}`}>
                    {part}
                    <select
                      value={selectedAnswers[question.question_id] || ""}
                      onChange={(event) =>
                        handleAnswerChange(
                          question.question_id,
                          event.target.value
                        )
                      }
                      disabled={isCorrect !== null}
                    >
                      <option value="">___</option>
                      {choices.map((choice, index) => (
                        <option
                          key={`${question.question_id}-${index}`}
                          value={choice.trim()}
                        >
                          {choice.trim()}
                        </option>
                      ))}
                    </select>
                  </span>
                ) : (
                  part
                )
              )}
            </span>
            <span> ({question.translation})</span>
            {isCorrect === false && (
              <strong style={{ marginLeft: "10px" }}>
                Correct Answer: {result.correctAnswer}
              </strong>
            )}
          </div>
        );
      })}

      <button onClick={submitAnswers}>Submit Answers</button>
      {Array.isArray(results) && results.length > 0 && (
        <div>
          <h2>Results</h2>
          {results.map((result) => (
            <div key={result.questionId}>
              <p>
                Question {result.questionId}:{" "}
                {result.correct
                  ? "Correct"
                  : `Incorrect. Correct Answer: ${result.correctAnswer}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Quiz;
