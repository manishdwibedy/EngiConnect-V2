import React, { useState } from 'react';
import { Header } from './Header';
import { StudyRoom } from './StudyRoom';
import { AITutor } from './AITutor';

export const App = () => {
    const [activeView, setActiveView] = useState('aiTutor');

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
             <Header activeView={activeView} setActiveView={setActiveView} />

            <main className="flex-grow overflow-y-auto">
                {activeView === 'aiTutor' && <AITutor /> }
            </main>
        </div>
    );
};