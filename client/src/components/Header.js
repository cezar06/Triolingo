import React from "react";
import { Link, useLocation } from "react-router-dom";
import RegistrationButton from "./RegistrationButton";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

function Header({ isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Triolingo
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/")}`}
                  aria-current="page"
                  to="/"
                >
                  Home
                </Link>
              </li>
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActive("/quiz")}`}
                      to="/quiz"
                    >
                      Multiple Choice
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActive("/flashcards")}`}
                      to="/flashcards"
                    >
                      Flashcards
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <Link
                      className={`nav-link dropdown-toggle ${isActive(
                        "/collection"
                      )}`}
                      to="#"
                      id="navbarDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Collection
                    </Link>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="navbarDropdown"
                    >
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/collection/english-romanian"
                        >
                          English-Romanian
                        </Link>
                      </li>
                      {/* You can add more dropdown items here */}
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActive("/create-deck")}`}
                      to="/create-deck"
                    >
                      Create Custom Deck
                    </Link>
                  </li>
                  <li className ="nav-item">
                    <Link className="nav-link" to="/your-decks">
                      Your Decks
                    </Link>{" "}
                    {/* Modify as needed */}
                  </li>
                </>
              )}
            </ul>
            <div className="d-flex">
              {isLoggedIn ? (
                <LogoutButton setIsLoggedIn={setIsLoggedIn} />
              ) : (
                <>
                  <RegistrationButton />
                  <div style={{ width: "10px" }} />
                  <LoginButton />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
