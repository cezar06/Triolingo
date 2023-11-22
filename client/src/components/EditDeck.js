import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  InputGroup,
  FormControl,
  Badge,
  Alert,
} from "react-bootstrap";
import "./EditDeck.css";
// Import other necessary components and styles

function EditDeck() {
  const { deckId } = useParams(); // Assuming you're using URL parameters
  const navigate = useNavigate();
  const [deckDetails, setDeckDetails] = useState({
    deck_name: "",
    deck_description: "",
    is_public: true,
    source_language: "",
    target_language: "",
    tags: [],
    // other necessary fields
  });
  const [tagInput, setTagInput] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");

  const availableLanguages = [
    "English",
    "Romanian",
    "Spanish",
    "French",
    "German",
  ];
  // Add more languages as needed

  useEffect(() => {
    // Fetch the details of the deck to be edited from the database
    // and populate the state with those details.
    const fetchDeckDetails = async () => {
      // fetch logic here
      const username = localStorage.getItem("username");
      const response = await fetch(
        `http://localhost:5000/api/deck_details/${deckId}-${username}`,
        {
          headers: {
            // Include any necessary headers, like authentication tokens
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const deckDetails = await response.json();
      setDeckDetails(deckDetails);
    };

    fetchDeckDetails();
  }, [deckId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeckDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    setDeckDetails((prevDetails) => ({
      ...prevDetails,
      is_public: e.target.checked,
    }));
  };

  const handleTagsChange = (newTags) => {
    setDeckDetails((prevDetails) => ({
      ...prevDetails,
      tags: newTags,
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = (e) => {
    const trimmedInput = tagInput.trim();
    if (
      e.key === "Enter" &&
      trimmedInput &&
      !deckDetails.tags.includes(trimmedInput)
    ) {
      e.preventDefault();
      setDeckDetails((prevDetails) => ({
        ...prevDetails,
        tags: [...prevDetails.tags, trimmedInput],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setDeckDetails((prevDetails) => ({
      ...prevDetails,
      tags: prevDetails.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting the following data:", deckDetails);
    const username = localStorage.getItem("username");

    try {
      const response = await fetch(
        `http://localhost:5000/api/edit_deck/${deckId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deck_name: deckDetails.deck_name,
            deck_description: deckDetails.deck_description,
            is_public: deckDetails.is_public,
            source_language: deckDetails.source_language,
            target_language: deckDetails.target_language,
            tags: deckDetails.tags,
            username: username,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      // Success
      setAlertVariant("success");
      setAlertMessage("Deck edited successfully!");
      setShowAlert(true);

      // Optionally redirect or perform other actions after success
    } catch (error) {
      console.error("Error editing deck:", error);

      // Error handling
      setAlertVariant("danger");
      setAlertMessage("Failed to edit deck. Please try again.");
      setShowAlert(true);
    }
  };

  const handleCancel = () => {
    navigate(-1); // This will take the user back to the previous page
  };

  // Other handlers for tags, source/target language

  return (
    <Form onSubmit={handleSubmit} className="edit-deck-form">
      <h1>Editing Deck</h1>

      <Form.Group className="mb-3">
        <Form.Label>Deck Name</Form.Label>
        <Form.Control
          type="text"
          name="deck_name"
          value={deckDetails.deck_name}
          onChange={handleInputChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          name="deck_description"
          value={deckDetails.deck_description}
          onChange={handleInputChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Public Deck"
          name="is_public"
          checked={deckDetails.is_public}
          onChange={handleCheckboxChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Source Language</Form.Label>
        <Form.Select
          name="source_language"
          value={deckDetails.source_language}
          onChange={handleInputChange}
          required
        >
          {availableLanguages.map((language, index) => (
            <option key={index} value={language}>
              {language}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Target Language</Form.Label>
        <Form.Select
          name="target_language"
          value={deckDetails.target_language}
          onChange={handleInputChange}
          required
        >
          {availableLanguages.map((language, index) => (
            <option key={index} value={language}>
              {language}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Tags:</Form.Label>
        <InputGroup>
          <FormControl
            type="text"
            placeholder="Add tag..."
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyPress={handleAddTag}
          />
        </InputGroup>
        <div className="d-flex flex-wrap gap-2 mt-2">
          {deckDetails.tags.map((tag, index) => (
            <Badge bg="secondary" key={index} pill className="large-badge">
              {tag}
              <span
                className="ms-2 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              >
                &times;
              </span>
            </Badge>
          ))}
        </div>
      </Form.Group>

      <Button variant="primary" type="submit">
        Save Changes
      </Button>
      <Button variant="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      {showAlert && (
        <Alert
          variant={alertVariant}
          show={showAlert}
          onClose={() => setShowAlert(false)}
          dismissible
          style={{ marginTop: "1rem" }}
        >
          {alertMessage}
        </Alert>
      )}
    </Form>
  );
}

export default EditDeck;
