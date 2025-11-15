import React, { useEffect, useRef } from 'react';
// Fix: Import types from agora-rtc-sdk-ng to resolve namespace errors.
import type { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoPlayerProps {
    // Fix: Use imported types directly.
    videoTrack: ICameraVideoTrack | IRemoteVideoTrack | null | undefined;
    uid: string | number;
}

export const VideoPlayer = ({ videoTrack, uid }: VideoPlayerProps) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;
        
        // Ensure the video track is played in the container
        if (videoTrack) {
            videoTrack.play(container.current);
        }

        return () => {
            // Stop video playback when the component unmounts or videoTrack changes
            if (videoTrack) {
                videoTrack.stop();
            }
        };
    }, [videoTrack]);

    const isVideoEnabled = videoTrack && videoTrack.isPlaying;

    return (
        <div ref={container} className="w-full h-full bg-black rounded-lg relative overflow-hidden">
             {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">{uid === 'local' ? 'You' : `User ${uid}`}</span>
        </div>
    );
};
