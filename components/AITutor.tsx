import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from './ChatMessage';
import { SharedFiles } from './SharedFiles';

const SYSTEM_INSTRUCTION = `You are an expert engineering tutor. Your goal is to help students understand complex engineering concepts. Provide clear, accurate, and grounded explanations. When possible, include code examples, formulas, and diagrams using markdown. If the user provides file contents, use that information as the primary context for your answer.`;

const LOCAL_STORAGE_KEY = 'engiConnect-sharedFiles';
const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_STORAGE_MB = 10; // Local storage is typically limited to 5-10MB

// Helper to safely decode text-based file content from a data URL
const getTextContentFromDataUrl = (file: { name: string; type: string; dataUrl: string }): string | null => {
    // Only attempt to decode common text-based file types
    if (!file.type.startsWith('text/') &&
        !file.type.includes('javascript') &&
        !file.type.includes('json') &&
        !file.type.includes('xml') &&
        !file.type.includes('markdown')) {
        return null;
    }

    try {
        const parts = file.dataUrl.split(',');
        if (parts.length < 2) return null;

        const base64Data = parts[1];
        const decodedString = atob(base64Data);
        // Handle UTF-8 characters correctly
        const textContent = decodeURIComponent(escape(decodedString));

        return `--- START OF FILE: ${file.name} ---\n${textContent}\n--- END OF FILE: ${file.name} ---`;
    } catch (e) {
        console.error(`Could not decode file ${file.name}:`, e);
        // Inform the model that the file exists but couldn't be read
        return `--- INFO: A file named ${file.name} was uploaded but its content could not be read. ---`;
    }
};


export const AITutor = () => {
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am your AI engineering tutor. How can I help you today? Ask me anything from thermodynamics to software design patterns.', sources: [] }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sharedFiles, setSharedFiles] = useState<any[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load files from localStorage on initial render
    useEffect(() => {
        try {
            const storedFiles = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedFiles) {
                setSharedFiles(JSON.parse(storedFiles));
            }
        } catch (err) {
            console.error("Failed to load files from local storage:", err);
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
        }
    }, []);

    // Save files to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sharedFiles));
        } catch (err) {
            console.error("Failed to save files to local storage:", err);
            setError("Could not save file list. Your browser's local storage might be full.");
        }
    }, [sharedFiles]);

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
            // Read content from shared files to provide context to the AI
            const fileContext = sharedFiles
                .map(getTextContentFromDataUrl)
                .filter(Boolean) // Filter out null values for non-text files
                .join('\n\n');
            
            const finalPrompt = fileContext
                ? `Please use the following file contents as context to answer the user's question.\n\n${fileContext}\n\nUser Question: "${input}"`
                : input;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: finalPrompt,
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
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = ''; // Reset input to allow re-uploading the same file

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        if (sharedFiles.some(f => f.name === file.name)) {
            setError(`A file named "${file.name}" already exists.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            
            const currentTotalSize = sharedFiles.reduce((acc, f) => acc + f.dataUrl.length, 0);
            const newFileSize = dataUrl.length;

            if (currentTotalSize + newFileSize > MAX_TOTAL_STORAGE_MB * 1024 * 1024) {
                setError(`Cannot add file. Total storage limit of ${MAX_TOTAL_STORAGE_MB}MB would be exceeded.`);
                return;
            }

            const newFile = { name: file.name, size: file.size, type: file.type, dataUrl };
            setSharedFiles(prev => [...prev, newFile]);
            setError(null);
        };
        reader.onerror = () => {
            setError("Failed to read the file.");
        }
        reader.readAsDataURL(file);
    };

    const handleFileDelete = (fileName: string) => {
        setSharedFiles(prev => prev.filter(f => f.name !== fileName));
    };


    return (
        <div className="flex h-full bg-gray-900 text-gray-200">
            {/* Main Chat Section */}
            <div className="flex flex-col h-full w-2/3 flex-grow p-4">
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
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        aria-hidden="true"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mr-2 p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                        aria-label="Attach file"
                        title="Attach file"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a3 3 0 006 0V7a1 1 0 112 0v4a5 5 0 01-10 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                    </button>
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

            {/* Shared Files Section */}
            <div className="w-1/3 border-l border-gray-700 bg-gray-800 p-4 overflow-y-auto">
                <SharedFiles files={sharedFiles} onDelete={handleFileDelete} />
            </div>
        </div>
    );
};