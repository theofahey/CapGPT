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
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ConversationDisplayArea from './components/ConversationDisplayArea';
import MessageInput from './components/MessageInput';
import Header from './components/Header';
import './App.css';

function App() {
  /** Reference variable for message input. */
  const inputRef = useRef();
  /** Host URL */
  const host = "http://localhost:9000"
  /** URL for non-streaming chat. */
  const url = host + "/chat";
  /** URL for streaming chat. */
  const streamUrl = host + "/stream";
  /** State variable for conversation history. */
  const [data, setData] = useState([]);
  /** State variable for loading state. */
  const [waiting, setWaiting] = useState(false);
  /** State variable for streaming toggle. */
  const [toggled, setToggled] = useState(false);
  /** State variables for streaming. */
  const [streamdiv, setStreamdiv] = useState(false);
  const [answer, setAnswer] = useState("");

  /** Function to validate user input. */
  function validationCheck(str) {
    return str === null || str.match(/^\s*$/) !== null;
  }

  /** Scroll to bottom of chat area. */
  useEffect(() => {
    const checkpoint = document.getElementById("checkpoint");
    if (checkpoint) {
      checkpoint.scrollIntoView({ behavior: "smooth" });
    }
  }, [data, answer]);

  /** Handle non-streaming chat submission. */
  const handleNonStreamingChat = async (userMessage) => {
    const chatData = {
      chat: userMessage,
      history: data
    };

    const headerConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
      }
    };

    try {
      const result = await axios.post(url, chatData, headerConfig);
      const newModelResponse = {
        role: "model",
        parts: [{ text: result.data.text }]
      };
      setData(prev => [...prev, newModelResponse]);
    } catch (error) {
      const errorResponse = {
        role: "model",
        parts: [{ text: "Error occurred while processing your request." }]
      };
      setData(prev => [...prev, errorResponse]);
    }
  };

  /** Handle streaming chat submission. */
  const handleStreamingChat = async (userMessage) => {
    const chatData = {
      chat: userMessage,
      history: data
    };

    const headerConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
      }
    };

    setStreamdiv(true);
    setAnswer("");

    try {
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: headerConfig.headers,
        body: JSON.stringify(chatData)
      });

      const reader = response.body.getReader();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedText += chunk;
        setAnswer(accumulatedText);
      }

      // Add the complete response to conversation history
      const newModelResponse = {
        role: "model",
        parts: [{ text: accumulatedText }]
      };
      setData(prev => [...prev, newModelResponse]);
      setStreamdiv(false);
      setAnswer("");
    } catch (error) {
      const errorResponse = {
        role: "model",
        parts: [{ text: "Error occurred while processing your request." }]
      };
      setData(prev => [...prev, errorResponse]);
      setStreamdiv(false);
      setAnswer("");
    }
  };

  /** Handle message submission. */
  const handleClick = async () => {
    const userMessage = inputRef.current.value.trim();
    
    if (validationCheck(userMessage)) {
      console.log("Empty or invalid entry");
      return;
    }

    // Add user message to conversation
    const newUserMessage = {
      role: "user",
      parts: [{ text: userMessage }]
    };
    setData(prev => [...prev, newUserMessage]);
    
    // Clear input
    inputRef.current.value = "";
    setWaiting(true);

    try {
      if (toggled) {
        await handleStreamingChat(userMessage);
      } else {
        await handleNonStreamingChat(userMessage);
      }
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div className="chat-app">
      <Header toggled={toggled} setToggled={setToggled} />
      <div className="chat-container">
        <ConversationDisplayArea 
          data={data} 
          streamdiv={streamdiv} 
          answer={answer} 
        />
        <MessageInput 
          inputRef={inputRef} 
          waiting={waiting} 
          handleClick={handleClick} 
        />
      </div>
    </div>
  );
}

export default App;