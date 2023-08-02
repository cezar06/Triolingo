import React, { useState, useEffect } from 'react';

function Quiz() {
  const [username, setUsername] = useState("");
  const [weakestSkills, setWeakestSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 

  // async function fetchWeakestSkills() {
  //   const response = await fetch(`http://localhost:5000/api/weakestSkills?username=${username}`);
  //   const data = await response.json();
  //   setWeakestSkills(data);
  // }

  async function fetchQuestions() {
    const response = await fetch('http://localhost:5000/api/questions');
    const data = await response.json();
    setQuestions(data);
  }
  async function submitAnswers() {
    // Check if all questions have been answered
    if (Object.keys(selectedAnswers).length !== questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
  
    // Rest of your submit code...
    const response = await fetch('http://localhost:5000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedAnswers)
    });
  
    if (response.ok) {
      alert("Answers submitted successfully.");
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
      fetchQuestions();
    }
  }, [username]);

  function handleAnswerChange(questionId, answer) {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  }

  

  return (
    <div>
      {/* <h2>Your Weakest Skills</h2>
      {weakestSkills.map(([skill, level]) => (
        <div key={skill}>
          <p>Skill: {skill.replace(/_/g, " ")}</p>
          <p>Level: {level}</p>
        </div>
      ))} */}
      <h2>Questions</h2>
      {questions.map(question => {
        let choices = question.choices.split(',');
        return (
          <div key={question.id}>
            <p>
              Question: {question.sentence.split("___").map((part, index, array) => index < array.length - 1 ? (
                <span key={index}>
                  {part}
                  <select
                    value={selectedAnswers[question.id] || ''}
                    onChange={event => handleAnswerChange(question.id, event.target.value)}
                  >
                    <option value=''>___</option>
                    {choices.map((choice, index) => (
                      <option key={index} value={choice.trim()}>
                        {choice.trim()}
                      </option>
                    ))}
                  </select>
                </span>
              ) : part)} 
              ({question.translation})
            </p>
          </div>
        );
      })}
      <button onClick={submitAnswers}>Submit Answers</button>
    </div>
  );
}

export default Quiz;
