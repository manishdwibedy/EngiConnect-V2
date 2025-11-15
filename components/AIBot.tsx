import React, { useEffect, useRef, useState } from 'react';
// Fix: Import IRemoteAudioTrack type to resolve namespace error.
import type { IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

interface AIBotProps {
    // Fix: Use imported type directly.
    audioTrack?: IRemoteAudioTrack;
    status: string;
}

export const AIBot = ({ audioTrack, status }: AIBotProps) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    useEffect(() => {
        if (audioTrack) {
            audioTrack.play();
        }
    }, [audioTrack]);

    useEffect(() => {
        if (!audioTrack) return;
        
        // Use Agora's volume indicator to detect when the bot is speaking
        const interval = setInterval(() => {
            const level = audioTrack.getVolumeLevel();
            setIsSpeaking(level > 0.1);
        }, 200);

        return () => clearInterval(interval);

    }, [audioTrack]);

    return (
        <div className="w-full h-full bg-gray-800 rounded-lg flex flex-col items-center justify-center p-4 border-2 border-purple-500 shadow-lg relative overflow-hidden">
             <div className={`absolute top-0 left-0 right-0 h-1 bg-purple-500 transition-transform duration-200 ease-in-out ${isSpeaking ? 'scale-x-100' : 'scale-x-0'}`} style={{ transformOrigin: 'left' }}></div>
            <div className="relative">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-24 md:w-24 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isSpeaking && (
                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-purple-400 animate-ping"></div>
                )}
            </div>
            <h3 className="text-lg font-semibold mt-4 text-white">AI Tutor</h3>
            <p className="text-sm text-gray-400 mt-1 capitalize">{isSpeaking ? 'Speaking...' : status}</p>
        </div>
    );
};
