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
                                <Link className={`nav-link ${isActive("/")}`} aria-current="page" to="/">
                                    Home
                                </Link>
                            </li>
                            {isLoggedIn && (
                                <>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${isActive("/quiz")}`} to="/quiz">
                                            Quiz
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${isActive("/profile")}`} to="/profile">
                                            Profile
                                        </Link>
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
