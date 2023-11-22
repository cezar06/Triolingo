import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import RegistrationPage from "./components/RegistrationPage";
import LoginPage from "./components/LoginPage";
import Collection from "./components/Collection";
import Quiz from "./components/Quiz";
import Flashcards from "./components/Flashcards";
import CreateDeck from "./components/CreateCustomDeck";
import YourDecks from "./components/YourDecks";
import EditDeck from "./components/EditDeck";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <div>
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <div className="container">
          <Routes>
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/flashcards" element={<Flashcards/>} />
            <Route path="/collection/english-romanian" element={<Collection />} />
            <Route path="/create-deck" element={<CreateDeck />} />
            <Route path="/your-decks" element={<YourDecks />} />
            <Route path="/edit_deck/:deckId" element={<EditDeck />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;