import React, { useState, useEffect } from "react";
import "./Flashcards.css";

function Flashcard() {
  const [flashcard, setFlashcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [showImageButton, setShowImageButton] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    fetchFlashcard();
  }, []);

  const updateStatistics = async (flashcardId, difficulty, rating) => {
    // Replace 'http://localhost:5000/api/flashcards/statistics' with your actual endpoint
    try {
      const response = await fetch(
        "http://localhost:5000/api/flashcards/statistics_update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include authentication headers if necessary
          },
          body: JSON.stringify({
            flashcardId: flashcardId,
            difficulty: difficulty,
            rating: rating, // Include the calculated rating here
            // Include any other statistics data you want to send
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Statistics update failed");
      }

      // Optionally handle the response data if needed
    } catch (error) {
      console.error("Error updating flashcard statistics:", error);
    }
  };

  const handleToggleTranslation = async () => {
    if (!showTranslation) {
      const translatedText = await translateSentence(
        flashcard.example_sentence
      );
      setFlashcard({ ...flashcard, translated_text: translatedText });
    }
    setShowTranslation(!showTranslation);
  };

  const renderExampleSentence = (sentence, boldedWords) => {
    if (!sentence || !boldedWords) return "";

    // Split the sentence to insert <strong> tag around the bolded words
    const parts = sentence.split(new RegExp(`(${boldedWords})`, "i"));
    return parts.map((part, index) =>
      part.toLowerCase() === boldedWords.toLowerCase() ? (
        <strong key={index}>{part}</strong>
      ) : (
        part
      )
    );
  };

  const speak = (text) => {
    // Create a new instance of SpeechSynthesisUtterance.
    const utterance = new SpeechSynthesisUtterance(text);

    // Optionally set some properties here, such as the voice, pitch, rate, etc.
    // utterance.voice = speechSynthesis.getVoices().filter(voice => voice.lang === "en-US")[0];
    // utterance.pitch = 1; // Range between 0 and 2
    // utterance.rate = 1; // Range between 0.1 (slow) and 10 (fast)

    // Speak the text.
    window.speechSynthesis.speak(utterance);
  };

  const fetchImage = async (word) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${word}&client_id=NOKuwnFTTLGHM62omPLe5zLVIcf9xbEfujJiuZZYuXQ`
      );
      if (!response.ok) {
        throw new Error("Image fetch failed");
      }
      const data = await response.json();
      if (data.results.length > 0) {
        setImage(data.results[0].urls.small);
      } else {
        setImage(null);
      }
    } catch (error) {
      console.error("Failed to fetch image:", error);
    }
  };

  const translateSentence = async (
    sentence,
    sourceLang = "EN",
    targetLang = "RO"
  ) => {
    try {
      const response = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `auth_key=2352096d-566c-ba42-5de2-5e9842a25a9f:fx&text=${encodeURIComponent(
          sentence
        )}&source_lang=${sourceLang}&target_lang=${targetLang}`,
      });

      const data = await response.json();

      if (data.translations && data.translations.length > 0) {
        return data.translations[0].text;
      } else {
        throw new Error("Translation failed");
      }
    } catch (error) {
      console.error("Error translating sentence:", error);
      return "";
    }
  };

  const handleResetProgress = async () => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      alert("Username not found");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/flashcards/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include authentication headers if necessary
          },
          body: JSON.stringify({ username: storedUsername }),
        }
      );

      if (response.ok) {
        alert("Progress reset successfully");
        fetchFlashcard(); // Refresh the flashcard data
      } else {
        alert("Failed to reset progress");
      }
    } catch (error) {
      console.error("Error resetting progress:", error);
    }
  };

  const fetchFlashcard = async () => {
    setLoading(true);
    setError(null); // Reset error state at the beginning
    try {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) {
        throw new Error("Username not found");
      }

      const response = await fetch(
        `http://localhost:5000/api/flashcards/random?username=${encodeURIComponent(
          storedUsername
        )}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.message) {
        // If the response contains a 'message' field, display it, but do not treat it as an error
        setFlashcard(null);
        setMessage(data.message);
      } else {
        setFlashcard(data);
        setMessage(null); // Clear any existing message
      }
    } catch (error) {
      setError(error.message); // Set error state only on actual errors
    } finally {
      setLoading(false);
      setIsFlipped(false);
      setImage(null);
      setShowImageButton(true); // Reset image button state
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSubmit = async (difficulty) => {
    const storedUsername = localStorage.getItem("username");
    setMessage(`Marked "${flashcard?.english_word}" as ${difficulty}`);
    setTimeout(() => setMessage(""), 3000); // Message will disappear after 3 seconds

    try {
      // Calculate the rating based on the selected difficulty
      const rating = calculateRating(difficulty);

      // Send a POST request to your backend endpoint
      const response = await fetch(
        "http://localhost:5000/api/flashcards/user_update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: storedUsername,
            flashcardId: flashcard.id,
            difficulty: difficulty,
            rating: rating, // Include the rating
            // Include any other data needed for the new columns
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      // Update global statistics
      await updateStatistics(flashcard.id, difficulty, rating);

      // Fetch the next flashcard after updating
      fetchFlashcard();
    } catch (error) {
      console.error("Error updating flashcard:", error);
    }
  };

  // Function to calculate the rating based on difficulty
  const calculateRating = (difficulty) => {
    switch (difficulty) {
      case "Again":
        return 1; // For example, rating 1 for Again
      case "Easy":
        return 4; // Rating 4 for Easy
      case "Good":
        return 3; // Rating 3 for Good
      case "Hard":
        return 2; // Rating 2 for Hard
      default:
        return 0; // Default rating
    }
  };

  const handleShowImage = () => {
    if (flashcard?.english_word) {
      fetchImage(flashcard.english_word);
      setShowImageButton(false); // Hide the button after it's clicked
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <div className="flashcard-container">
      {flashcard ? (
        <div className={`flashcard ${isFlipped ? "flipped" : ""}`}>
          {!isFlipped ? (
            // Front of the card
            <div className="card-front">
              <div className="word-section">
                <h2>{flashcard?.english_word}</h2>
              </div>
              {/* Conditionally render the image if it's available */}
              {image && (
                <div className="image-container">
                  <img
                    src={image}
                    alt="Visual representation"
                    className="card-image"
                  />
                </div>
              )}
              <div className="button-section">
                {showImageButton && (
                  <button
                    className="btn image-button"
                    onClick={handleShowImage}
                  >
                    Show Image
                  </button>
                )}
                <button className="btn flip-button" onClick={handleFlip}>
                  Flip
                </button>
              </div>
            </div>
          ) : (
            // Back of the card
            <div className="card-back">
              {/* Romanian word at the top */}
              <div className="word-section">
                <h2>{flashcard?.english_word}</h2>
              </div>
              {/* Divider */}
              <hr />
              {/* English word */}
              <div className="translation-section">
                <h3>{flashcard?.romanian_word}</h3>
              </div>
              {/* Example sentence */}
              <div className="example-section">
                <div className="sentence-and-play">
                  <p className="example-sentence">
                    {renderExampleSentence(
                      flashcard?.example_sentence,
                      flashcard?.bolded_words
                    )}
                  </p>
                  <button
                    className="btn play-button"
                    onClick={() => speak(flashcard.example_sentence)}
                  >
                    Play
                  </button>
                </div>
                {!showTranslation ? (
                  <span
                    className="translate-text"
                    onClick={handleToggleTranslation}
                  >
                    Translate via DeepL
                  </span>
                ) : (
                  <p className="translation-text">
                    {flashcard?.translated_text}
                  </p>
                )}
              </div>
              <div className="difficulty-buttons">
                <button
                  className="btn difficulty-btn"
                  onClick={() => handleSubmit("Again")}
                >
                  Again
                </button>
                <button
                  className="btn difficulty-btn"
                  onClick={() => handleSubmit("Easy")}
                >
                  Easy
                </button>
                <button
                  className="btn difficulty-btn"
                  onClick={() => handleSubmit("Good")}
                >
                  Good
                </button>
                <button
                  className="btn difficulty-btn"
                  onClick={() => handleSubmit("Hard")}
                >
                  Hard
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-flashcards-message">
          <h2>{message}</h2>
        </div>
      )}
      {/* Reset progress button, if needed */}
    </div>
  );
}

export default Flashcard;
