const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

//ROUTES//
app.get("/api/quizprompts/random", async (req, res) => {
    try {
        const questionQuery = {
            text: 'SELECT * FROM quizprompts ORDER BY RANDOM() LIMIT 1'
        };
        const questionResult = await pool.query(questionQuery);
        if (questionResult.rows.length === 0) {
            res.status(404).send('No questions available');
        } else {
            res.json(questionResult.rows[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.get("/api/weakestSkills", async (req, res) => {
    try {
      const { username } = req.query;
      const userQuery = {
        text: 'SELECT * FROM users WHERE username = $1',
        values: [username]
      };
      const userResult = await pool.query(userQuery);
      if (userResult.rows.length === 0) {
        res.status(404).send('User not found');
      } else {
        const userId = userResult.rows[0].id;
        const skillsQuery = {
          text: 'SELECT * FROM user_skills WHERE user_id = $1',
          values: [userId]
        };
        const skillsResult = await pool.query(skillsQuery);
        let skillData = skillsResult.rows[0];
        delete skillData.id;
        delete skillData.user_id;
        delete skillData.timestamp;

        // Turn the skills into an array and sort them
        let skillArray = Object.entries(skillData);
        skillArray.sort((a, b) => a[1] - b[1]);

        // Return the five weakest skills
        let weakestSkills = skillArray.slice(0, 5);
        res.json(weakestSkills);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

app.get("/api/skills", async (req, res) => {
    try {
      const { username } = req.query;
      const userQuery = {
        text: 'SELECT * FROM users WHERE username = $1',
        values: [username]
      };
      const userResult = await pool.query(userQuery);
      if (userResult.rows.length === 0) {
        res.status(404).send('User not found');
      } else {
        const userId = userResult.rows[0].id;
        const skillsQuery = {
          text: 'SELECT * FROM user_skills WHERE user_id = $1',
          values: [userId]
        };
        const skillsResult = await pool.query(skillsQuery);
        const skillData = skillsResult.rows[0];
        delete skillData.id;
        delete skillData.user_id;
        delete skillData.timestamp;
        res.json(skillData);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  


app.post("/register", async (req, res) => {
    const {username, email, password} = req.body;
    const checkQuery = {
        text: 'SELECT * FROM users WHERE username = $1 OR email = $2',
        values: [username, email]
    };
    try {
        const checkResult = await pool.query(checkQuery);
        if (checkResult.rows.length > 0) {
            res.status(400).send('Username or email already exists');
        } else {
            const insertQuery = {
                text: 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
                values: [username, email, password]
            };
            const result = await pool.query(insertQuery);
            const userId = result.rows[0].id;
            const insertSkillsQuery = {
                text: 'INSERT INTO user_skills (user_id) VALUES ($1)',
                values: [userId]
            };
            await pool.query(insertSkillsQuery);
            res.status(201).json(result.rows[0]);
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const query = {
        text: 'SELECT * FROM users WHERE username = $1 AND password = $2',
        values: [username, password]
    };
    try {
        const result = await pool.query(query);
        if (result.rows.length > 0) {
            const token = jwt.sign({ username }, process.env.JWT_SECRET);
            res.cookie('session', token, { httpOnly: true });
            res.sendStatus(200);
        } else {
            res.status(401).send('Invalid credentials');
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie('session');
    res.send({message: 'Logout successful'});
});


app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
