import React from 'react';

export const Header = ({ activeView, setActiveView }) => (
    <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 shadow-md">
        <nav className="flex items-center justify-center p-2 space-x-2 md:space-x-4">
            <button
                onClick={() => setActiveView('studyRoom')}
                className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ease-in-out flex items-center space-x-2 ${
                    activeView === 'studyRoom'
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                <span>Study Room</span>
            </button>
            <button
                onClick={() => setActiveView('aiTutor')}
                className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ease-in-out flex items-center space-x-2 ${
                    activeView === 'aiTutor'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
            >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                <span>AI Tutor</span>
            </button>
        </nav>
    </header>
);
