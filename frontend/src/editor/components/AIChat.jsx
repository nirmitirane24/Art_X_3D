// AIChat.jsx
import React, { useState } from 'react';
import "../styles/AIChat.css";
import axios from 'axios'; //install using npm install axios

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const sendMessage = async () => {
        if (!input.trim()) return; // Prevent sending empty messages

        const userMessage = { text: input, sender: 'user' };
        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/ask', { query: input }); // Replace with your backend API endpoint
            const aiResponse = { text: response.data.response, sender: 'ai' };
            setMessages([...messages, userMessage, aiResponse]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = { text: "Sorry, I couldn't process your request. Please try again.", sender: 'ai', error: true };
            setMessages([...messages, userMessage, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
            <div className="chat-icon" onClick={toggleChat}>
                <span role="img" aria-label="AI Chat"> ֎</span>
            </div>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header" >
                        <p style={{ marginLeft: "10px "}}>ArtX3D AI Assistant</p>
                        <button className="close-button" onClick={toggleChat}>x</button>
                    </div>
                    <div className="message-list">
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender} ${message.error ? 'error' : ''}`}>
                                {message.text}
                            </div>
                        ))}
                        {loading && <div className="message ai">Thinking...</div>}
                    </div>
                    <div className="input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                        />
                        <button onClick={sendMessage} disabled={loading}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;