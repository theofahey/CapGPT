/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Import necessary modules. */
import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  /** Reference variable for message input. */
  const inputRef = useRef();
  /** Host URL */
  const host = "http://localhost:9000"
  /** URL for non-streaming chat. */
  const url = host + "/chat";
  /** State variable for user prompt. */
  const [prompt, setPrompt] = useState("");
  /** State variable for GPT response. */
  const [response, setResponse] = useState("");
  /** State variable for loading state. */
  const [loading, setLoading] = useState(false);
  /** State variable for username (for personalization). */
  const [username, setUsername] = useState("");

  /** Function to validate user input. */
  function validationCheck(str) {
    return str === null || str.match(/^\s*$/) !== null;
  }

  /** Handle form submission. */
  const handleSubmit = async () => {
    if (validationCheck(prompt)) {
      console.log("Empty or invalid entry");
      return;
    }

    setLoading(true);
    setResponse("");

    /** Prepare POST request data. */
    const chatData = {
      chat: prompt,
      history: []
    };

    /** Headers for the POST request. */
    let headerConfig = {
      headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          "Access-Control-Allow-Origin": "*",
      }
    };

    try {
      const result = await axios.post(url, chatData, headerConfig);
      setResponse(result.data.text);
    } catch (error) {
      setResponse("Error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  /** Handle key press events. */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="gpt-wrapper">
      <div className="header">
        <h1>GPT Assistant</h1>
        <div className="user-section">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
          />
          {username && <span className="welcome-text">Welcome, {username}!</span>}
        </div>
      </div>
      
      <div className="main-container">
        <div className="input-section">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your prompt here..."
            className="prompt-input"
            rows="4"
            disabled={loading}
          />
          <button 
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="submit-btn"
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </div>
        
        <div className="response-section">
          <h3>Response:</h3>
          <div 
            className="response-content" 
            dangerouslySetInnerHTML={{__html: response || 'Your response will appear here...'}}
          />
        </div>
      </div>
    </div>
  );
}

export default App;