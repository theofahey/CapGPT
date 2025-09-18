import React from 'react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import userIcon from '../assets/user-icon.png';
// TODO: Consider replacing chatbotIcon with its own distinct icon.
import chatbotIcon from '../assets/user-icon.png'

const ChatArea = ({ data, streamdiv, answer }) => {
  // Custom renderer for code blocks
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && language) {
        return (
          <div className="code-block-container">
            <div className="code-block-header">
              <span className="code-language">{language}</span>
              <button
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                title="Copy code"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              showLineNumbers={true}
              wrapLines={true}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      return (
        <code className={`inline-code ${className || ''}`} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="chat-area">
      {data?.length <= 0 ? (
        <div className="welcome-area">
          <p className="welcome-1">Hi,</p>
          <p className="welcome-2">How can I help you today?</p>
        </div>
      ) : (
        <div className="welcome-area" style={{display: "none"}}></div>
      )}

      {data.map((element, index) => (
        <div key={index} className={`message ${element.role}`}>
          <div className="message-avatar">
            <img 
              src={element.role === "user" ? userIcon : chatbotIcon} 
              alt="Icon" 
            />
          </div>
          <div className="message-content">
            <Markdown 
              remarkPlugins={[remarkGfm]}
              components={components}
            >
              {element.parts[0].text}
            </Markdown>
          </div>
        </div>
      ))}

      {streamdiv && (
        <div className="message tempResponse">
          <div className="message-avatar">
            <img src={chatbotIcon} alt="Icon" />
          </div>
          <div className="message-content">
            {answer && (
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {answer}
              </Markdown>
            )}
          </div>
        </div>
      )}

      <span id="checkpoint"></span>
    </div>
  );
};

export default ChatArea;