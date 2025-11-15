import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from './ChatMessage';

const SYSTEM_INSTRUCTION = `You are an expert engineering tutor. Your goal is to help students understand complex engineering concepts. Provide clear, accurate, and grounded explanations. When possible, include code examples, formulas, and diagrams using markdown.`;

export const AITutor = () => {
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your AI engineering tutor. How can I help you today? Ask me anything from thermodynamics to software design patterns.', sources: [] }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', text: input, sources: [] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: input,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    tools: [{ googleSearch: {} }],
                },
            });

            const modelResponse = response.text;
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            const sources = groundingChunks?.flatMap(chunk => chunk.web ? [chunk.web] : []) ?? [];

            setMessages(prev => [...prev, { role: 'model', text: modelResponse, sources }]);

        } catch (err) {
            console.error("API Error:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Failed to get response from AI Tutor. ${errorMessage}`);
            setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again.", sources: [] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 bg-gray-900 text-gray-200">
            <h1 className="text-2xl font-bold text-purple-400 mb-4 text-center md:text-left">AI Engineering Tutor</h1>
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} msg={msg} />
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="p-3 rounded-lg max-w-xl bg-gray-700">
                           <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            <form onSubmit={handleSendMessage} className="mt-4 flex-shrink-0 flex items-center bg-gray-800 rounded-lg p-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about an engineering topic..."
                    disabled={isLoading}
                    className="flex-grow bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-500"
                    aria-label="Chat input"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="ml-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors">
                    {isLoading ? 'Thinking...' : 'Send'}
                </button>
            </form>
        </div>
    );
};