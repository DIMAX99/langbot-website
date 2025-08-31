import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import SoundVisualizer from "../components/SoundVisualizer";

// Add speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

const ChatPage = () => {
  const router = useRouter();
  const { lang } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isPersonSpeaking, setIsPersonSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceSpeed, setVoiceSpeed] = useState(0.9); // Default speed
  const [user, setUser] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
      loadUserConversations(token);
    } else {
      // Allow guest access but show login option
      setIsAuthenticated(false);
    }
  }, []);

  // Load user conversations
  const loadUserConversations = async (token: string) => {
    try {
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      const languageMap: { [key: string]: string } = {
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'German': 'de-DE',
        'Japanese': 'ja-JP',
        'Italian': 'it-IT',
        'English': 'en-US'
      };
      
      recognitionInstance.lang = languageMap[lang as string] || 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setIsPersonSpeaking(true);
      };
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        setIsPersonSpeaking(false);
        
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 500);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsPersonSpeaking(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        setIsPersonSpeaking(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [lang]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to make AI speak
  const speakText = (text: string, language: string) => {
    if (!speechSynthesis || !text.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Language mapping for speech synthesis
    const speechLanguageMap: { [key: string]: string } = {
      'Spanish': 'es-ES',
      'French': 'fr-FR', 
      'German': 'de-DE',
      'Japanese': 'ja-JP',
      'Italian': 'it-IT',
      'English': 'en-US'
    };

    utterance.lang = speechLanguageMap[language] || 'en-US';
    
    // Find the best voice for the language
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(speechLanguageMap[language]?.split('-')[0] || 'en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

  utterance.rate = voiceSpeed; // Use selected speed
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsAiSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsAiSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsAiSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  // Function to stop AI speech
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsAiSpeaking(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (textToSend === "") return;

    const userMessage: Message = { 
      sender: "user", 
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setConversationHistory((prevHistory) => [...prevHistory, { role: "user", parts: [{ text: textToSend }] }]);
    setInput("");
    setIsLoading(true);
    setIsAiSpeaking(true);

    try {
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          message: textToSend, 
          history: conversationHistory,
          language: lang,
          userLevel: 'beginner',
          conversationId: currentConversationId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: Message = { 
        sender: "ai", 
        text: data.response,
        timestamp: new Date()
      };
      
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setConversationHistory((prevHistory) => [...prevHistory, { role: "model", parts: [{ text: data.response }] }]);
      
      // Update conversation ID if new one was created
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }
      
      // Make AI speak the response
      setTimeout(() => {
        speakText(data.response, lang as string);
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = { 
        sender: "ai", 
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date()
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsAiSpeaking(false);
    }
  };

  const handleVoiceInput = () => {
    if (recognition && !isListening) {
      recognition.start();
    } else if (isListening && recognition) {
      recognition.stop();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <Head>
        <title>LangBot - AI Language Tutor</title>
      </Head>
      
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>LangBot 🤖</h1>
          <p>Learning {lang} with AI</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#ffffff' }}>Welcome, {user?.name || user?.email}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user');
                  router.push('/login');
                }}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => router.push('/login')}
                style={{
                  background: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Sign Up
              </button>
            </div>
          )}
          <div className={styles.profileCircle}>
            <span>👤</span>
          </div>
        </div>
      </header>

      <main className={styles.main} style={{ flexDirection: "row", alignItems: "stretch", padding: "0" }}>
        {/* AI Section */}
        <section style={{ flex: 1, borderRight: "1px solid #333", padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", background: "#1a1a1a" }}>
          <h2 style={{ color: '#ffffff' }}>AI Tutor</h2>
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "1rem" }}>
            <div style={{ 
              fontSize: "8rem", 
              color: isSpeaking ? "#22c55e" : isAiSpeaking ? "#f59e0b" : "#6366f1",
              transition: "all 0.3s ease",
              filter: isSpeaking ? "drop-shadow(0 0 20px #22c55e)" : isAiSpeaking ? "drop-shadow(0 0 20px #f59e0b)" : "none",
              animation: isSpeaking ? "pulse 1s infinite" : "none"
            }}>
              {isSpeaking ? "🗣️" : "🤖"}
            </div>
            
            {/* Voice Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {isSpeaking ? (
                <button 
                  onClick={stopSpeaking}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '8px', 
                    background: '#ef4444', 
                    color: '#fff', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🔇 Stop Speaking
                </button>
              ) : (
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  background: '#374151', 
                  borderRadius: '8px', 
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}>
                  {voices.length > 0 ? '🔊 Voice Ready' : '🔇 No Voice'}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: isSpeaking ? '#22c55e' : isAiSpeaking ? '#f59e0b' : isLoading ? '#6366f1' : '#374151', 
              borderRadius: '20px', 
              color: '#ffffff',
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}>
              {isSpeaking ? '🗣️ Speaking...' : 
               isAiSpeaking ? '🤔 Processing...' : 
               isLoading ? '💭 Thinking...' : 
               '👂 Listening'}
            </div>
          </div>
          
          <SoundVisualizer isPlaying={isSpeaking || isAiSpeaking} />
        </section>

        {/* Chat Section */}
        <section style={{ flex: 2, padding: "1rem", display: "flex", flexDirection: "column", background: "#0a0a0a" }}>
          <h2 style={{ color: '#ffffff', marginBottom: '1rem' }}>Chat - Learning {lang}</h2>
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            border: "1px solid #333", 
            borderRadius: "12px", 
            padding: "1rem", 
            background: "#111", 
            display: "flex", 
            flexDirection: "column", 
            gap: "0.8rem",
            minHeight: "400px"
          }}>
            {messages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: "#888", 
                padding: '2rem',
                fontSize: '1.1rem'
              }}>
                <p>🎯 Welcome to your {lang} learning session!</p>
                <p>💬 Start by typing or using voice input</p>
                <p>🎤 Click the microphone to speak</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    backgroundColor: msg.sender === "user" ? "#6366f1" : "#2d3748",
                    padding: "0.8rem 1rem",
                    borderRadius: "16px",
                    maxWidth: "75%",
                    wordBreak: "break-word",
                    color: "#fff",
                    position: 'relative',
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                  }}
                >
                  <div style={{ marginBottom: '0.3rem' }}>
                    {msg.text}
                  </div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    opacity: 0.7,
                    textAlign: msg.sender === "user" ? "right" : "left",
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{msg.sender === "user" ? "You" : "AI Tutor"} • {formatTime(msg.timestamp)}</span>
                    {msg.sender === "ai" && speechSynthesis && (
                      <button
                        onClick={() => speakText(msg.text, lang as string)}
                        disabled={isSpeaking}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          cursor: isSpeaking ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          opacity: isSpeaking ? 0.5 : 0.8,
                          padding: '2px 4px',
                          borderRadius: '4px',
                          marginLeft: '8px'
                        }}
                        title="Click to hear this message"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Section */}
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder={`Type your message in ${lang}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              style={{ 
                flex: 1, 
                padding: "0.8rem", 
                borderRadius: "8px", 
                border: "1px solid #555", 
                background: "#222", 
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || input.trim() === ""}
              style={{ 
                padding: "0.8rem 1.5rem", 
                borderRadius: "8px", 
                background: isLoading ? "#374151" : "#6366f1", 
                color: "#fff", 
                border: "none", 
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "1rem",
                minWidth: "80px"
              }}
            >
              {isLoading ? "..." : "Send"}
            </button>
            <button
              onClick={() => setVoiceSpeed(s => Math.max(s - 0.2, 0.5))}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
              title={`Slow down AI voice speed (current: ${voiceSpeed.toFixed(1)}x)`}
            >
              -
            </button>
            <button
              onClick={() => setVoiceSpeed(s => Math.min(s + 0.2, 2))}
              style={{
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
              title={`Speed up AI voice speed (current: ${voiceSpeed.toFixed(1)}x)`}
            >
              +
            </button>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Voice speed: {voiceSpeed.toFixed(1)}x
            </span>
          </div>
        </section>

        {/* Voice Input Section */}
        <section style={{ flex: 1, borderLeft: "1px solid #333", padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", background: "#1a1a1a" }}>
          <h2 style={{ color: '#ffffff' }}>Voice Input</h2>
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "1rem" }}>
            <div style={{ 
              fontSize: "6rem", 
              color: isListening ? "#ef4444" : "#6366f1",
              transition: "all 0.3s ease",
              filter: isListening ? "drop-shadow(0 0 20px #ef4444)" : "none",
              animation: isListening ? "pulse 1.5s infinite" : "none"
            }}>
              🎤
            </div>
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: isListening ? '#ef4444' : '#374151', 
              borderRadius: '20px', 
              color: '#ffffff',
              fontSize: '0.9rem',
              textAlign: 'center',
              minWidth: '120px'
            }}>
              {isListening ? '🎙️ Listening...' : '🎙️ Ready'}
            </div>
          </div>
          
          <SoundVisualizer isPlaying={isPersonSpeaking} />
          
          <button
            onClick={handleVoiceInput}
            disabled={!recognition}
            style={{ 
              marginTop: "1rem", 
              padding: "1rem 1.5rem", 
              borderRadius: "12px", 
              background: isListening ? "#ef4444" : "#22c55e", 
              color: "#fff", 
              border: "none", 
              cursor: recognition ? "pointer" : "not-allowed",
              fontSize: "1rem",
              fontWeight: "600",
              minWidth: "140px",
              opacity: recognition ? 1 : 0.5
            }}
          >
            {isListening ? "🛑 Stop" : "🎤 Start Voice"}
          </button>
          
          {!recognition && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#888", textAlign: "center" }}>
              Voice input not supported in this browser
            </p>
          )}
          
          <style jsx>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
        </section>
      </main>
    </div>
  );
};

export default ChatPage;