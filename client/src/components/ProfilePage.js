import React, { useState, useEffect } from "react";
import "./ProfilePage.css";

function ProfilePage() {
  const [username, setUsername] = useState("");
  const [skillLevels, setSkillLevels] = useState({});
  const skillNames = [
    "vocabulary",  // new: overall word knowledge
    "grammar",     // new: overall grammar knowledge
    "nouns",
    "verbs",
    "adjectives",
    "adverbs",
    "pronouns",
    "prepositions",
    "conjunctions",
    "sentence_structure",  // new: overall sentence structure understanding
    "simple_sentences",
    "compound_sentences",
    "complex_sentences",
    "tenses", // new: overall knowledge of tenses
    "present_tense",
    "past_tense",
    "future_tense",
    "articles", // new: general knowledge of articles
    "definite_articles",
    "indefinite_articles",
    "pronoun_types",  // new: general knowledge of pronoun types
    "subject_pronouns",
    "object_pronouns",
    "possessive_adjectives",
    "plural_nouns", // new: overall understanding of plural nouns
    "regular_plural_nouns",
    "irregular_plural_nouns",
    "negation",  // new: overall understanding of negation
    "negation_of_verbs",
    "negation_of_nouns",
    "listening_comprehension",  // new: understanding spoken language
    "reading_comprehension",  // new: understanding written language
    "writing",  // new: ability to write in the language
    "speaking",  // new: ability to speak in the language
    "pronunciation",  // new: accurate pronunciation of words
    "idiomatic_expressions",  // new: understanding language-specific idioms
    "cultural_context",  // new: understanding the culture(s) where the language is spoken
];


  async function fetchSkillLevels() {
    const response = await fetch(`http://localhost:5000/api/skills?username=${username}`);
    const data = await response.json();
    const transformedData = Object.entries(data).reduce((acc, [key, value]) => {
      const skillName = key.replace("_level", "");
      acc[skillName] = value;
      return acc;
    }, {});
    setSkillLevels(transformedData);
  }

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    fetchSkillLevels();
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
