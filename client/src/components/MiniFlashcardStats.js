import React from 'react';
import './MiniFlashcardStats.css';
function MiniFlashcardStats({ data }) {
  return (
    <div className="mini-flashcard">
      <h3>{data.english_word} / {data.romanian_word}</h3>
      <ul>
        <li>Times Reviewed: {data.times_reviewed}</li>
        <li>Times Recalled Successfully: {data.times_recalled_successfully}</li>
        <li>Average Difficulty: {data.average_difficulty}</li>
        <li>Next Review: {new Date(data.next_review_date).toLocaleDateString()}</li>
        <li>Last Review: {new Date(data.last_review_date).toLocaleDateString()}</li>
      </ul>
    </div>
  );
}

export default MiniFlashcardStats;
