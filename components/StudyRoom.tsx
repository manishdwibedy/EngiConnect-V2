import React, { useState, useEffect, useRef } from 'react';
// Fix: Import types from agora-rtc-sdk-ng to resolve namespace errors.
// Fix: Split value and type imports to resolve module resolution error for IRemoteUser.
// Fix: Import IRemoteUser as a value since it seems to be a class, not an interface.
import AgoraRTC, { IRemoteUser } from 'agora-rtc-sdk-ng';
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';
import { AIBot } from './AIBot';

// Explicitly type AGORA_APP_ID as string to avoid TypeScript error on comparison.
const AGORA_APP_ID: string = 'c358dddff3444cc5842116b94be608b7'; // IMPORTANT: Replace with your Agora App ID
const AGORA_CHANNEL = 'engi-connect-study-room';
const AGORA_TOKEN = null; // Use null for testing or a token server for production
const BOT_UID = 'ai-tutor-bot';

type LocalTracks = {
    // Fix: Use imported type directly.
    videoTrack: ICameraVideoTrack | null;
    // Fix: Use imported type directly.
    audioTrack: IMicrophoneAudioTrack | null;
};

export const StudyRoom = () => {
    // Fix: Use imported type directly.
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const [isJoined, setIsJoined] = useState(false);
    const [localTracks, setLocalTracks] = useState<LocalTracks>({ videoTrack: null, audioTrack: null });
    // Fix: Use imported type directly.
    const [remoteUsers, setRemoteUsers] = useState<IRemoteUser[]>([]);
    const [isBotActive, setIsBotActive] = useState(false);
    const [botStatus, setBotStatus] = useState('Idle'); // Idle, Summoning, Active, Dismissing
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    
    // Initialize the Agora client
    useEffect(() => {
        if (!clientRef.current) {
            clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        }
        const client = clientRef.current;

        // Fix: Use imported type directly.
        const handleUserPublished = async (user: IRemoteUser, mediaType: 'video' | 'audio') => {
            await client.subscribe(user, mediaType);
            // After subscribing, update the remote users state to trigger a re-render.
            // The Agora SDK automatically handles adding the track to the user object.
            setRemoteUsers(prevUsers => [...prevUsers]);
        };

        // Fix: Use imported type directly.
        const handleUserUnpublished = (user: IRemoteUser) => {
             // No need to manually unsubscribe. SDK handles it.
             // We can trigger a re-render to update UI if necessary (e.g., to show a "camera off" icon).
             setRemoteUsers(prevUsers => [...prevUsers]);
        };
        
        // Fix: Use imported type directly.
        const handleUserJoined = (user: IRemoteUser) => {
            setRemoteUsers(prevUsers => [...prevUsers, user]);
        };

        // Fix: Use imported type directly.
        const handleUserLeft = (user: IRemoteUser) => {
            if (user.uid === BOT_UID) {
                setIsBotActive(false);
                setBotStatus('Idle');
            }
            setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
        };

        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-joined', handleUserJoined);
        client.on('user-left', handleUserLeft);

        return () => {
            client.off('user-published', handleUserPublished);
            client.off('user-unpublished', handleUserUnpublished);
            client.off('user-joined', handleUserJoined);
            client.off('user-left', handleUserLeft);
        };
    }, []);

    const join = async () => {
        if (!clientRef.current) return;
        if(AGORA_APP_ID === 'YOUR_AGORA_APP_ID') {
            alert('Please replace "YOUR_AGORA_APP_ID" in StudyRoom.tsx with your actual Agora App ID.');
            return;
        }
        await clientRef.current.join(AGORA_APP_ID, AGORA_CHANNEL, AGORA_TOKEN, null);
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks({ audioTrack, videoTrack });
        await clientRef.current.publish([audioTrack, videoTrack]);
        setIsJoined(true);
    };

    const leave = async () => {
        if (isBotActive) {
            await toggleBot();
        }
        localTracks.audioTrack?.close();
        localTracks.videoTrack?.close();
        setLocalTracks({ audioTrack: null, videoTrack: null });

        if (clientRef.current) {
            await clientRef.current.leave();
        }
        setIsJoined(false);
        setRemoteUsers([]);
    };

    const toggleMic = async () => {
        if (localTracks.audioTrack) {
            await localTracks.audioTrack.setEnabled(!micOn);
            setMicOn(!micOn);
        }
    };

    const toggleCam = async () => {
        if (localTracks.videoTrack) {
            await localTracks.videoTrack.setEnabled(!camOn);
            setCamOn(!camOn);
        }
    };
    
    const toggleBot = async () => {
        const endpoint = isBotActive ? '/api/agora-bot/stop' : '/api/agora-bot/start';
        const newStatus = isBotActive ? 'Dismissing' : 'Summoning';
        setBotStatus(newStatus);
        
        try {
            // In a real application, you would make a call to your backend server here.
            // The backend server would then securely call the Agora Bot Service REST API
            // with the necessary credentials to start or stop the bot.
            // We are simulating this call for the frontend demo.
            console.log(`Simulating call to backend: ${endpoint}`);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
            
            // This is a MOCK response. After the backend call, the bot would
            // join or leave the channel, which is handled by the 'user-left' event listener.
            // We'll simulate the bot joining for the demo if we're summoning it.
            if (!isBotActive) {
                setIsBotActive(true);
                setBotStatus('Active');
                // In a real scenario, the bot would join and trigger the user-published event.
                // For this demo, we can add a placeholder if needed, but it's better to rely on events.
            } else {
                // The 'user-left' event will handle state change on successful dismissal.
                // If the bot doesn't leave, we revert the state.
                setIsBotActive(false);
                setBotStatus('Idle');
            }

        } catch (error) {
            console.error(`Failed to ${isBotActive ? 'dismiss' : 'summon'} AI tutor`, error);
            setBotStatus(isBotActive ? 'Active' : 'Idle'); // Revert status on error
        }
    };


    const botUser = remoteUsers.find(u => u.uid === BOT_UID);

    const renderControls = () => (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 p-4 flex justify-center items-center space-x-4 z-10">
            <button onClick={toggleMic} className={`p-3 rounded-full transition-colors ${micOn ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {micOn ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v4m0 0l-4-4m4 4l4-4" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 11-14 0m7 10v4m0 0l-4-4m4 4l4-4m-6-4a7 7 0 011-3.714M12 4a7 7 0 00-1 3.714m-1 4.857A7.002 7.002 0 005 11" /><path  strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5l14 14" /></svg>}
            </button>
             <button onClick={leave} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2 2m-2-2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8" /></svg>
            </button>
            <button onClick={toggleCam} className={`p-3 rounded-full transition-colors ${camOn ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-red-600 hover:bg-red-700'}`}>
                 {camOn ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 2l20 20" /></svg>}
            </button>
            <button onClick={toggleBot} disabled={botStatus === 'Summoning' || botStatus === 'Dismissing'} className="px-4 py-2 rounded-md font-semibold transition-all duration-200 ease-in-out flex items-center space-x-2 bg-purple-600 text-white shadow-lg hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                <span>{botStatus === 'Active' ? 'Dismiss Tutor' : botStatus === 'Idle' ? 'Summon AI Tutor' : `${botStatus}...`}</span>
            </button>
        </div>
    );

    if (!isJoined) {
        return (
            <div className="flex flex-col h-full p-4 space-y-4 items-center justify-center">
                <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <h1 className="text-2xl font-bold text-cyan-400 mb-2">EngiConnect Study Room</h1>
                    <p className="text-gray-400 mb-6">Join the collaborative video session to study with your peers and interact with the AI tutor.</p>
                    <button onClick={join} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2">
                        <span>Join Study Room</span>
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="relative h-full w-full flex flex-col">
            <div className="flex-grow p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
                {/* Local User */}
                <div className="aspect-video">
                    <VideoPlayer videoTrack={localTracks.videoTrack} uid="local" />
                </div>
                {/* Remote Users */}
                {remoteUsers.filter(u => u.uid !== BOT_UID).map(user => (
                    <div className="aspect-video" key={user.uid}>
                        <VideoPlayer videoTrack={user.videoTrack} uid={user.uid} />
                    </div>
                ))}
                {/* AI Bot */}
                {isBotActive && (
                    <div className="aspect-video">
                        <AIBot audioTrack={botUser?.audioTrack} status={botStatus} />
                    </div>
                )}
            </div>
            {renderControls()}
        </div>
    );
};