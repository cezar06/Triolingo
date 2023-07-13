import React, { useState, useEffect } from 'react';

function Quiz() {
  console.log('Quiz rendered');
  const [username, setUsername] = useState("");
  const [weakestSkills, setWeakestSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);  // Initialize as false
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);

  async function fetchWeakestSkills() {
    const response = await fetch(`http://localhost:5000/api/weakestSkills?username=${username}`);
    const data = await response.json();
    setWeakestSkills(data);
  }

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    fetchWeakestSkills();
  }, [username]);

  const fetchQuestion = async () => {
    if (!isFetchingQuestion) {
      setIsFetchingQuestion(true);
      const response = await fetch(`http://localhost:5000/api/quizprompts/random`);
      const data = await response.json();
      setQuestions(prevQuestions => [...prevQuestions, data]);
      setIsFetchingQuestion(false);
    }
  };

  useEffect(() => {
    console.log('Quiz mounted');
    fetchQuestion();
  }, []);
  

  return (
    <div>
      <h2>Your Weakest Skills</h2>
      {weakestSkills.map(([skill, level]) => (
        <div key={skill}>
          <p>Skill: {skill.replace(/_/g, " ")}</p>
          <p>Level: {level}</p>
        </div>
      ))}

      <h2>Quiz</h2>
      {questions.map(question => (
        <div key={question.id}>
          <p>{question.english_sentence}</p>
          {/* Render the question options here */}
        </div>
      ))}
    </div>
  );
}

export default Quiz;
