import React from 'react';

const FileIcon = ({ fileType }: { fileType: string }) => {
    if (fileType.startsWith('image/')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        );
    }
    if (fileType === 'application/pdf') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    );
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface SharedFile {
    name: string;
    size: number;
    type: string;
    dataUrl: string;
}

interface SharedFilesProps {
    files: SharedFile[];
    onDelete: (fileName: string) => void;
}

export const SharedFiles = ({ files, onDelete }: SharedFilesProps) => {

    const handleDownload = (file: SharedFile) => {
        try {
            const link = document.createElement('a');
            link.href = file.dataUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download file:", error);
            alert("Could not download the file.");
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center space-x-2 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>Shared Documents</span>
            </h2>
            {files.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-center text-gray-500 rounded-lg border-2 border-dashed border-gray-700">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        <p className="mt-2">No files shared yet.</p>
                        <p className="text-sm">Upload a file using the paperclip icon in the chat.</p>
                    </div>
                </div>
            ) : (
                <ul className="space-y-3 overflow-y-auto flex-grow pr-1">
                    {files.map(file => (
                        <li key={file.name} className="bg-gray-700 p-3 rounded-md flex items-center justify-between transition-all hover:bg-gray-600 group">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="flex-shrink-0">
                                    <FileIcon fileType={file.type} />
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-medium text-gray-200 truncate" title={file.name}>{file.name}</p>
                                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDownload(file)} title="Download" className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-500 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </button>
                                <button onClick={() => onDelete(file.name)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-900/50 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
