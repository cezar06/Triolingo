import React, { useState, useEffect } from "react";
import MiniFlashcardStats from "./MiniFlashcardStats";
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; // Assuming you've installed react-icons
import "./Collection.css";
function Collection() {
  const [flashcardStats, setFlashcardStats] = useState([]);
  const [filteredFlashcardStats, setFilteredFlashcardStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortStatusEn, setSortStatusEn] = useState(""); // 'asc', 'desc', 'none'
  const [sortStatusRo, setSortStatusRo] = useState(""); // 'asc', 'desc', or '' (no sorting)
  const [sortNextReview, setSortNextReview] = useState("");
  const [sortLastReview, setSortLastReview] = useState("");
  const [sortAverageDifficulty, setSortAverageDifficulty] = useState("");
  const [sortTimesReviewed, setSortTimesReviewed] = useState("");
  const [sortTimesRecalledSuccessfully, setSortTimesRecalledSuccessfully] =
    useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const username = localStorage.getItem("username");
        const response = await fetch(
          `http://localhost:5000/api/user/${username}/flashcard-stats`
        );
        if (!response.ok) throw new Error("Failed to fetch statistics.");

        const data = await response.json();
        setFlashcardStats(data);
        setFilteredFlashcardStats(data); // Initialize filtered stats
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  useEffect(() => {
    function sortFlashcards() {
      let sorted = [...flashcardStats];

      // Sorting by English word
      if (sortStatusEn !== "none") {
        sorted.sort((a, b) => {
          let fieldA = a.english_word.toLowerCase();
          let fieldB = b.english_word.toLowerCase();
          if (sortStatusEn === "asc") {
            return fieldA.localeCompare(fieldB);
          }
          return fieldB.localeCompare(fieldA);
        });
      }

      // Sorting by Romanian word
      if (sortStatusRo !== "") {
        sorted.sort((a, b) => {
          let fieldA = a.romanian_word.toLowerCase();
          let fieldB = b.romanian_word.toLowerCase();
          if (sortStatusRo === "asc") {
            return fieldA.localeCompare(fieldB);
          }
          return fieldB.localeCompare(fieldA);
        });
      }

      // Sorting by next review date
      if (sortNextReview !== "") {
        sorted.sort((a, b) => {
          let fieldA = a.next_review_date.toLowerCase();
          let fieldB = b.next_review_date.toLowerCase();
          if (sortNextReview === "asc") {
            return fieldA.localeCompare(fieldB);
          }
          return fieldB.localeCompare(fieldA);
        });
      }

      // Sorting by last review date
      if (sortLastReview !== "") {
        sorted.sort((a, b) => {
          let fieldA = a.last_review_date.toLowerCase();
          let fieldB = b.last_review_date.toLowerCase();
          if (sortLastReview === "asc") {
            return fieldA.localeCompare(fieldB);
          }
          return fieldB.localeCompare(fieldA);
        });
      }

      // Sorting by average difficulty
      if (sortAverageDifficulty !== "") {
        sorted.sort((a, b) => {
          let fieldA = Number(a.average_difficulty);
          let fieldB = Number(b.average_difficulty);
          if (sortAverageDifficulty === "asc") {
            return fieldA - fieldB;
          }
          return fieldB - fieldA;
        });
      }

      // Sorting by times reviewed
      if (sortTimesReviewed !== "") {
        sorted.sort((a, b) => {
          let fieldA = Number(a.times_reviewed);
          let fieldB = Number(b.times_reviewed);
          if (sortTimesReviewed === "asc") {
            return fieldA - fieldB;
          }
          return fieldB - fieldA;
        });
      }

      // Sorting by times recalled successfully
      if (sortTimesRecalledSuccessfully !== "") {
        sorted.sort((a, b) => {
          let fieldA = Number(a.times_recalled_successfully);
          let fieldB = Number(b.times_recalled_successfully);
          if (sortTimesRecalledSuccessfully === "asc") {
            return fieldA - fieldB;
          }
          return fieldB - fieldA;
        });
      }

      // Apply search term filter
      sorted = sorted.filter(
        (flashcard) =>
          flashcard.english_word
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          flashcard.romanian_word
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );

      setFilteredFlashcardStats(sorted);
    }

    sortFlashcards();
  }, [
    flashcardStats,
    searchTerm,
    sortStatusEn,
    sortStatusRo,
    sortNextReview,
    sortLastReview,
    sortAverageDifficulty,
    sortTimesReviewed,
    sortTimesRecalledSuccessfully,
  ]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleSortEn = () => {
    if (sortStatusEn === "") {
      setSortStatusEn("asc");
      setSortStatusRo("");
    } else if (sortStatusEn === "asc") {
      setSortStatusEn("desc");
    } else {
      setSortStatusEn("");
    }
  };

  const toggleSortRo = () => {
    if (sortStatusRo === "") {
      setSortStatusRo("asc");
      setSortStatusEn("");
    } else if (sortStatusRo === "asc") {
      setSortStatusRo("desc");
    } else {
      setSortStatusRo("");
    }
  };

  const toggleSortNextReview = () => {
    if (sortNextReview === "") {
      setSortNextReview("asc");
    } else if (sortNextReview === "asc") {
      setSortNextReview("desc");
    } else {
      setSortNextReview("");
    }
  };

  const toggleSortLastReview = () => {
    if (sortLastReview === "") {
      setSortLastReview("asc");
    } else if (sortLastReview === "asc") {
      setSortLastReview("desc");
    } else {
      setSortLastReview("");
    }
  };

  const toggleSortAverageDifficulty = () => {
    if (sortAverageDifficulty === "") {
      setSortAverageDifficulty("asc");
    } else if (sortAverageDifficulty === "asc") {
      setSortAverageDifficulty("desc");
    } else {
      setSortAverageDifficulty("");
    }
  };

  const toggleSortTimesReviewed = () => {
    if (sortTimesReviewed === "") {
      setSortTimesReviewed("asc");
    } else if (sortTimesReviewed === "asc") {
      setSortTimesReviewed("desc");
    } else {
      setSortTimesReviewed("");
    }
  };

  const toggleSortTimesRecalledSuccessfully = () => {
    if (sortTimesRecalledSuccessfully === "") {
      setSortTimesRecalledSuccessfully("asc");
    } else if (sortTimesRecalledSuccessfully === "asc") {
      setSortTimesRecalledSuccessfully("desc");
    } else {
      setSortTimesRecalledSuccessfully("");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your Flashcards</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search flashcards..."
        className="search-input"
      />
      <div className="sorting-buttons-container">
        {" "}
        {/* Add this container */}
        <button onClick={toggleSortEn} className="sort-button">
          A-Z (English)
          {sortStatusEn === "asc" ? (
            <FaArrowUp />
          ) : sortStatusEn === "desc" ? (
            <FaArrowDown />
          ) : null}
        </button>
        <button onClick={toggleSortRo} className="sort-button">
          A-Z (Romanian)
          {sortStatusRo === "asc" ? (
            <FaArrowUp />
          ) : sortStatusRo === "desc" ? (
            <FaArrowDown />
          ) : null}
        </button>
        <button onClick={toggleSortNextReview} className="sort-button">
          Next Review Date{" "}
          {/* Add icons and conditional rendering like previous buttons */}
          {sortNextReview === "asc" ? (
            <FaArrowUp />
          ) : sortNextReview === "desc" ? (
            <FaArrowDown />
          ) : null}
        </button>
        <button onClick={toggleSortLastReview} className="sort-button">
          Last Review Date{" "}
          {/* Add icons and conditional rendering like previous buttons */}
          {sortLastReview === "asc" ? (
            <FaArrowUp />
          ) : sortLastReview === "desc" ? (
            <FaArrowDown />
          ) : null}
        </button>
        <button onClick={toggleSortAverageDifficulty} className="sort-button">
          Average Difficulty{" "}
          {/* Add icons and conditional rendering like previous buttons */}
          {sortAverageDifficulty === "asc" ? (
            <FaArrowUp />
          ) : sortAverageDifficulty === "desc" ? (
            <FaArrowDown />
          ) : null}
        </button>
        <button onClick={toggleSortTimesReviewed} className="sort-button">
          Times Reviewed{" "}
          {/* Add icons and conditional rendering like previous buttons */}
          {sortTimesReviewed === "asc" ? (
            <FaArrowUp />
          ) : sortTimesReviewed === "desc" ? (
            <FaArrowDown />
          ) : null}
        </button>
        <button
          onClick={toggleSortTimesRecalledSuccessfully}
          className="sort-button"
        >
          Times Recalled Successfully{" "}
          {/* Add icons and conditional rendering like previous buttons */}
          {sortTimesRecalledSuccessfully === "asc" ? (
            <FaArrowUp />
          ) : sortTimesRecalledSuccessfully === "desc" ? (
            <FaArrowDown />
          ) : null}
        </button>
      </div>{" "}
      {/* End of sorting buttons container */}
      <div className="flashcard-stats-grid">
        {filteredFlashcardStats.map((flashcard) => (
          <MiniFlashcardStats key={flashcard.flashcard_id} data={flashcard} />
        ))}
      </div>
    </div>
  );
}

export default Collection;
