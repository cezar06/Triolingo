import React, { useState } from "react";
import {
  Button,
  Form,
  InputGroup,
  FormControl,
  Badge,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS in the entry file of your app
import "./CreateCustomDeck.css";
function CreateCustomDeck() {
  const [deckName, setDeckName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Romanian");
  const [responseMessage, setResponseMessage] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" }); // New state for alert

  const languages = ["English", "Romanian", "Spanish", "French", "German"]; // Add more languages as needed

  const handleCreateDeck = async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    // Construct the form data
    const deckData = {
      username: localStorage.getItem("username"),
      deck_name: deckName,
      deck_description: description,
      is_public: isPublic,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      tags: tags, // Assuming tags are comma-separated
    };

    try {
      // Send the POST request to your backend endpoint
      const response = await fetch(
        "http://localhost:5000/api/custom_decks/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include other headers as required, like authorization headers
          },
          body: JSON.stringify(deckData),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || "Network response was not ok.");
      }

      const result = await response.json();
      setAlert({ type: "success", message: "Deck created successfully!" });
      // Reset form or other states if necessary
    } catch (error) {
      setAlert({ type: "danger", message: error.message });
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = (e) => {
    const trimmedInput = tagInput.trim();
    if (e.key === "Enter" && trimmedInput && !tags.includes(trimmedInput)) {
      e.preventDefault();
      setTags((prevTags) => [...prevTags, trimmedInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handlers for other inputs and the form submission...

  return (
    <div className="create-custom-deck p-3">
      <Form onSubmit={handleCreateDeck}>
        <h2>Create Custom Deck</h2>
        <Form.Group className="mb-3">
          <Form.Label>Deck Name:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter deck name..."
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description:</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter deck description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Source Language:</Form.Label>
          <Form.Select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            {languages.map((language, index) => (
              <option key={index} value={language}>
                {language}
              </option>
            ))}
            required
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Target Language:</Form.Label>
          <Form.Select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            {languages.map((language, index) => (
              <option key={index} value={language}>
                {language}
              </option>
            ))}
            required
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Public Deck"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </Form.Group>

        {/* Select inputs for Source Language and Target Language */}
        {/* ... */}

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
            {tags.map((tag, index) => (
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
        {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}
        <Button variant="primary" type="submit">
          Create Deck
        </Button>
      </Form>
    </div>
  );
}

export default CreateCustomDeck;
