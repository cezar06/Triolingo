const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//middleware
app.use(cors({origin: "https://triolingo-front.onrender.com"}));
app.use(express.json());

//ROUTES//
app.put("/api/edit_deck/:id", async (req, res) => {
  try {
    const deckId = req.params.id;
    const {
      deck_name,
      deck_description,
      is_public,
      source_language,
      target_language,
      tags,
    } = req.body;
    // Get user ID from username
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [req.body.username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;
    // Check if deck belongs to user
    const deckResult = await pool.query(
      "SELECT * FROM custom_decks WHERE id = $1 AND user_id = $2",
      [deckId, userId]
    );
    if (deckResult.rows.length === 0) {
      return res.status(404).json({ message: "Deck not found" });
    }
    // Update deck
    const updateResult = await pool.query(
      "UPDATE custom_decks SET deck_name = $1, deck_description = $2, is_public = $3, source_language = $4, target_language = $5, tags = $6 WHERE id = $7",
      [
        deck_name,
        deck_description,
        is_public,
        source_language,
        target_language,
        tags,
        deckId,
      ]
    );
    res.json({ message: "Deck updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/deck_details/:id-:username", async (req, res) => {
  const username = req.params.username;
  const deckId = req.params.id;
  try {
    // Get user ID from username
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;
    // Get deck details
    const deckResult = await pool.query(
      "SELECT * FROM custom_decks WHERE id = $1 AND user_id = $2",
      [deckId, userId]
    );
    if (deckResult.rows.length === 0) {
      return res.status(404).json({ message: "Deck not found" });
    }
    res.json(deckResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/api/delete_deck/:id", async (req, res) => {
  try {
    const deckId = req.params.id;
    const username = req.body.username;
    // Get user ID from username
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;
    // Check if deck belongs to user
    const deckResult = await pool.query(
      "SELECT * FROM custom_decks WHERE id = $1 AND user_id = $2",
      [deckId, userId]
    );
    if (deckResult.rows.length === 0) {
      return res.status(404).json({ message: "Deck not found" });
    }
    // Delete deck
    await pool.query("DELETE FROM custom_decks WHERE id = $1", [deckId]);
    res.json({ message: "Deck deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/your_decks", async (req, res) => {
  try {
    const username = req.headers.username;
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;
    const decksResult = await pool.query(
      "SELECT * FROM custom_decks WHERE user_id = $1",
      [userId]
    );
    res.json(decksResult.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/custom_decks/create", async (req, res) => {
  try {
    const {
      username,
      deck_name,
      deck_description,
      is_public,
      source_language,
      target_language,
      tags,
    } = req.body;

    // Get user ID from username
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;
    //check if deck name already exists
    const deckNameResult = await pool.query(
      "SELECT deck_name FROM custom_decks WHERE deck_name = $1",
      [deck_name]
    );
    if (deckNameResult.rows.length > 0) {
      return res.status(400).json({ message: "Deck name already exists" });
    }

    // insert into decks table along with user id, deck name, deck description, is_public, source_language, target_language and tags
    const deckResult = await pool.query(
      "INSERT INTO custom_decks (user_id, deck_name, deck_description, is_public, source_language, target_language, tags) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        userId,
        deck_name,
        deck_description,
        is_public,
        source_language,
        target_language,
        tags,
      ]
    );

    res.json(deckResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/user/:username/flashcard-stats", async (req, res) => {
  const username = req.params.username;

  // Fetch the user ID based on the username
  const userResult = await pool.query(
    "SELECT id FROM users WHERE username = $1",
    [username]
  );
  if (userResult.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  const userId = userResult.rows[0].id;

  // SQL query to join user_flashcards and flashcards tables
  const statsQuery = `
    SELECT 
      uf.flashcard_id,
      f.english_word,
      f.romanian_word,
      uf.times_reviewed,
      uf.times_recalled_successfully,
      uf.average_difficulty,
      uf.next_review_date,
      uf.last_review_date
    FROM 
      user_flashcards uf
    JOIN 
      flashcards f ON uf.flashcard_id = f.id
    WHERE 
      uf.user_id = $1;
  `;

  try {
    const statsResult = await pool.query(statsQuery, [userId]);
    res.json(statsResult.rows);
  } catch (err) {
    console.error("Error fetching flashcard statistics:", err);
    res.status(500).send("Error fetching statistics");
  }
});

app.post("/api/flashcards/statistics_update", async (req, res) => {
  const { flashcardId, difficulty, rating } = req.body;

  if (!flashcardId || !difficulty || rating == null) {
    return res
      .status(400)
      .send("Flashcard ID, difficulty level, and rating are required.");
  }

  try {
    // Start a transaction
    await pool.query("BEGIN");

    // Declare variables outside the if/else scope
    let newTimesEncountered;
    let newTimesFailed;
    let newTimesSucceeded;
    let newAverageRating;

    // Check if a statistics record already exists for this flashcard
    const statsResult = await pool.query(
      "SELECT * FROM flashcard_statistics WHERE flashcard_id = $1;",
      [flashcardId]
    );

    if (statsResult.rows.length === 0) {
      // Initialize variables for a new record
      newTimesEncountered = 1;
      newTimesFailed = difficulty === "Again" ? 1 : 0;
      newTimesSucceeded = difficulty !== "Again" ? 1 : 0;
      newAverageRating = rating; // Since this is the first rating
    } else {
      // Update variables based on existing record
      const stats = statsResult.rows[0];
      newTimesEncountered = stats.times_encountered + 1;
      newTimesFailed = stats.times_failed + (difficulty === "Again" ? 1 : 0);
      newTimesSucceeded =
        stats.times_succeeded + (difficulty !== "Again" ? 1 : 0);
      newAverageRating =
        (stats.average_rating * stats.times_encountered + rating) /
        newTimesEncountered;
    }

    // Decide whether to update or insert new statistics based on whether they exist
    const updateStatsQuery =
      statsResult.rows.length === 0
        ? `INSERT INTO flashcard_statistics (flashcard_id, times_encountered, times_failed, times_succeeded, average_rating)
       VALUES ($1, $2, $3, $4, $5);`
        : `UPDATE flashcard_statistics
       SET times_encountered = $2, times_failed = $3, times_succeeded = $4, average_rating = $5
       WHERE flashcard_id = $1;`;

    // Execute the update or insert query
    await pool.query(updateStatsQuery, [
      flashcardId,
      newTimesEncountered,
      newTimesFailed,
      newTimesSucceeded,
      newAverageRating,
    ]);

    // Commit the transaction
    await pool.query("COMMIT");
    res.status(200).send("Statistics updated successfully");
  } catch (err) {
    // Rollback the transaction in case of an error
    await pool.query("ROLLBACK");
    console.error("Error updating flashcard statistics:", err);
    res.status(500).send("Error updating statistics");
  }
});

app.post("/api/flashcards/reset", async (req, res) => {
  try {
    const { username } = req.body;

    // Get user ID from username
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Delete all user_flashcards entries for this user
    await pool.query("DELETE FROM user_flashcards WHERE user_id = $1", [
      userId,
    ]);

    res.json({ message: "Progress reset successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/flashcards/user_update", async (req, res) => {
  try {
    const { username, flashcardId, difficulty } = req.body;

    // Get user ID from username
    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Check if there's an existing record for this user and flashcard
    const flashcardResult = await pool.query(
      "SELECT * FROM user_flashcards WHERE user_id = $1 AND flashcard_id = $2",
      [userId, flashcardId]
    );

    if (flashcardResult.rows.length === 0) {
      // No existing record, create a new one
      const nextReviewDate = calculateNextReviewDate(new Date(), 1, difficulty);
      await pool.query(
        "INSERT INTO user_flashcards (user_id, flashcard_id, next_review_date, last_review_date, review_interval, times_reviewed, times_recalled_successfully, average_difficulty) VALUES ($1, $2, $3, CURRENT_DATE, 1, 1, $4, $5)",
        [
          userId,
          flashcardId,
          nextReviewDate,
          difficulty !== "Again" ? 1 : 0,
          calculateDifficultyRating(difficulty),
        ] // Adjust values as necessary
      );
    } else {
      // Existing record found, update it
      const lastReviewDate = new Date(flashcardResult.rows[0].last_review_date);
      const reviewInterval = flashcardResult.rows[0].review_interval;
      const timesReviewed = flashcardResult.rows[0].times_reviewed + 1;
      const timesRecalledSuccessfully =
        flashcardResult.rows[0].times_recalled_successfully +
        (difficulty !== "Again" ? 1 : 0);
      const totalDifficultyRating =
        flashcardResult.rows[0].average_difficulty * (timesReviewed - 1) +
        calculateDifficultyRating(difficulty);
      const averageDifficulty = totalDifficultyRating / timesReviewed;
      const nextReviewDate = calculateNextReviewDate(
        lastReviewDate,
        reviewInterval,
        difficulty
      );

      await pool.query(
        "UPDATE user_flashcards SET next_review_date = $1, last_review_date = CURRENT_DATE, review_interval = $2, times_reviewed = $3, times_recalled_successfully = $4, average_difficulty = $5 WHERE user_id = $6 AND flashcard_id = $7",
        [
          nextReviewDate,
          reviewInterval,
          timesReviewed,
          timesRecalledSuccessfully,
          averageDifficulty,
          userId,
          flashcardId,
        ]
      );
    }

    res.json({ message: "Flashcard review updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Function to calculate a numerical rating for difficulty
function calculateDifficultyRating(difficulty) {
  switch (difficulty) {
    case "Again":
      return 1; // Lowest rating for 'Again'
    case "Hard":
      return 2; // Slightly higher rating for 'Hard'
    case "Good":
      return 3; // Higher rating for 'Good'
    case "Easy":
      return 4; // Highest rating for 'Easy'
    default:
      return 0; // Default rating
  }
}

function calculateNextReviewDate(lastReviewDate, currentInterval, difficulty) {
  let newInterval;

  if (difficulty === "Again") {
    return new Date(); // Set to today's date for immediate review
  } else {
    if (difficulty === "Hard") {
      newInterval = currentInterval * 1.2; // 20% increase
    } else if (difficulty === "Good") {
      newInterval = currentInterval * 1.5; // 50% increase
    } else if (difficulty === "Easy") {
      newInterval = currentInterval * 2.5; // 150% increase
    }

    newInterval = Math.max(1, newInterval); // Ensure at least 1 day interval
    const nextReviewDate = new Date(lastReviewDate);
    nextReviewDate.setDate(nextReviewDate.getDate() + Math.round(newInterval));
    return nextReviewDate;
  }
}

app.get("/api/flashcards/random", async (req, res) => {
  try {
    const username = req.query.username;

    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = userResult.rows[0].id;

    // Query to find a flashcard for review today
    const reviewFlashcardQuery = `
      SELECT f.id, f.english_word, f.romanian_word, f.example_sentence, f.bolded_words
      FROM flashcards f
      JOIN user_flashcards uf ON f.id = uf.flashcard_id
      WHERE uf.user_id = $1 AND uf.next_review_date <= CURRENT_DATE
      ORDER BY RANDOM()
      LIMIT 1
    `;
    const reviewFlashcardResult = await pool.query(reviewFlashcardQuery, [
      userId,
    ]);

    if (reviewFlashcardResult.rows.length > 0) {
      res.json(reviewFlashcardResult.rows[0]);
    } else {
      // Find new flashcards that the user hasn't seen yet
      const newFlashcardQuery = `
        SELECT f.id, f.english_word, f.romanian_word, f.example_sentence, f.bolded_words
        FROM flashcards f
        WHERE NOT EXISTS (
          SELECT 1 FROM user_flashcards uf WHERE uf.flashcard_id = f.id AND uf.user_id = $1
        )
        ORDER BY RANDOM()
        LIMIT 1
      `;
      const newFlashcardResult = await pool.query(newFlashcardQuery, [userId]);

      if (newFlashcardResult.rows.length > 0) {
        res.json(newFlashcardResult.rows[0]);
      } else {
        res.status(200).json({ message: "No new flashcards available" });
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/api/submit", async (req, res) => {
  try {
    const { username, answers } = req.body;

    if (!username || !Array.isArray(answers)) {
      return res.status(400).send("Invalid request data");
    }

    console.log("Received answers:", answers);

    const userResult = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    const userId = userResult.rows[0].id;

    // Extracting questionIds from the answers
    const questionIds = answers.map((answer) => answer.questionId);

    // Fetch skill names and correct answers for the questions answered
    const questionsQuery = `
      SELECT question_id, skill_name, correct_answer
      FROM multiple_choice
      WHERE question_id = ANY($1)
    `;
    const questionsResult = await pool.query(questionsQuery, [questionIds]);

    const questionsData = questionsResult.rows.reduce((acc, row) => {
      acc[row.question_id] = {
        skillName: row.skill_name,
        correctAnswer: row.correct_answer,
      };
      return acc;
    }, {});

    let correctCount = 0;
    let results = [];

    for (const answer of answers) {
      const questionInfo = questionsData[answer.questionId];
      if (!questionInfo) {
        console.log(
          `Question info not found for question ID: ${answer.questionId}`
        );
        continue; // Skip if question info is not found
      }

      // Treat blank answers as incorrect
      const isAnswerBlank = answer.answer.trim() === "";
      const correct =
        !isAnswerBlank && questionInfo.correctAnswer === answer.answer;
      const scoreChange = correct ? 1 : -1;

      // Update user's skill score based on skill name only if score is greater than 0
      if (scoreChange === -1) {
        const updateResult = await pool.query(
          `UPDATE user_skills
           SET score = score + $1
           WHERE user_id = $2 AND skill_name = $3 AND score > 0`,
          [scoreChange, userId, questionInfo.skillName]
        );

        console.log(
          `Updated skill score for user ${userId}, skill ${questionInfo.skillName}, rows affected: ${updateResult.rowCount}`
        );
      }

      correctCount += correct ? 1 : 0;
      results.push({
        questionId: answer.questionId,
        correct: correct,
        correctAnswer: questionInfo.correctAnswer || "N/A", // Provide 'N/A' if there is no correct answer
      });
    }

    console.log(`Number of correct answers: ${correctCount}`);
    res
      .status(200)
      .json({ message: "Your skills have been updated accordingly.", results });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/api/questions/weak-skills", async (req, res) => {
  const { username } = req.query;

  try {
    const randomQuestionsQuery = `
      SELECT mc.question_id, mc.skill_name, mc.difficulty_level, mc.translation, mc.choices, mc.correct_answer, mc.sentence
      FROM multiple_choice mc
      ORDER BY RANDOM()
      LIMIT 10
    `;
    const randomQuestionsResult = await pool.query(randomQuestionsQuery);
    const questions = randomQuestionsResult.rows;

    if (!questions || questions.length === 0) {
      return res.status(404).send("No questions found");
    }

    res.json(questions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/api/skills", async (req, res) => {
  try {
    const { username } = req.query;
    const userQuery = {
      text: "SELECT id FROM users WHERE username = $1",
      values: [username],
    };
    const userResult = await pool.query(userQuery);

    if (userResult.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const userId = userResult.rows[0].id;

    const skillsQuery = {
      text: `SELECT skill_name, score
             FROM user_skills
             WHERE user_id = $1
             ORDER BY score DESC`, // Order by score in descending order
      values: [userId],
    };
    const skillsResult = await pool.query(skillsQuery);
    const skillScores = skillsResult.rows.map((row) => ({
      skill: row.skill_name,
      score: row.score,
    }));

    res.json(skillScores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const checkQuery = {
    text: "SELECT * FROM users WHERE username = $1 OR email = $2",
    values: [username, email],
  };
  try {
    const checkResult = await pool.query(checkQuery);
    if (checkResult.rows.length > 0) {
      res.status(400).send("Username or email already exists");
    } else {
      const insertQuery = {
        text: "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
        values: [username, email, password],
      };
      const result = await pool.query(insertQuery);
      const userId = result.rows[0].id;
      const insertSkillsQuery = {
        text: "INSERT INTO user_skills (user_id) VALUES ($1)",
        values: [userId],
      };
      await pool.query(insertSkillsQuery);
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const query = {
    text: "SELECT * FROM users WHERE username = $1 AND password = $2",
    values: [username, password],
  };
  try {
    const result = await pool.query(query);
    if (result.rows.length > 0) {
      const token = jwt.sign({ username }, process.env.JWT_SECRET);
      res.cookie("session", token, { httpOnly: true });
      res.sendStatus(200);
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("session");
  res.send({ message: "Logout successful" });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
