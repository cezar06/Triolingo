import React, { useState, useEffect } from "react";
import "./ProfilePage.css";

function ProfilePage() {
  const [username, setUsername] = useState("");
  const [skillLevels, setSkillLevels] = useState({});
  const skillNames = [
    "vocabulary",
    "grammar",
    "sentence_structure",
    "tenses",
    "articles",
    "pronouns",
    "plural_nouns",
    "negation",
    "listening_comprehension",
    "reading_comprehension",
    "writing",
    "idiomatic_expressions",
];




async function fetchSkillLevels() {
  const response = await fetch(`http://localhost:5000/api/skills?username=${username}`);
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  } else {
      const data = await response.json();
      const transformedData = Object.entries(data).reduce((acc, [key, value]) => {
          const skillName = key.replace("_level", "");
          acc[skillName] = value;
          return acc;
      }, {});
      setSkillLevels(transformedData);
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
      fetchSkillLevels();
    }
  }, [username]);

  return (
    <div>
      <h1>{username}'s stats</h1>
      {skillNames.map((skillName) => (
  <div className="skill-container" key={skillName}>
    <div className="skill-bar">
      {skillLevels[skillName] < 0 && (
        <div
          className="skill-bar-negative"
          style={{ width: `${Math.abs(skillLevels[skillName])}%` }}
        ></div>
      )}
      <div
        className="skill-bar-fill"
        style={{ width: `${Math.max(skillLevels[skillName], 0)}%` }}
      ></div>
    </div>
    <div className="skill-bar-label">{skillName.replace(/_/g, " ")}</div>
  </div>
))}



    </div>
  );
}

export default ProfilePage;
