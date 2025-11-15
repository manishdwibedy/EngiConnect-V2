import React from 'react';

const renderMarkdown = (text) => {
    const html = text
        .replace(/```([\s\S]*?)```/g, (_match, code) => `<pre class="bg-gray-800 p-3 rounded-md my-2 text-sm overflow-x-auto"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`)
        .replace(/\n/g, '<br />');
    return <div className="prose prose-invert max-w-none text-gray-200" dangerouslySetInnerHTML={{ __html: html }} />;
};

export const ChatMessage = ({ msg }) => (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`p-3 rounded-lg max-w-xl ${msg.role === 'user' ? 'bg-cyan-800' : 'bg-gray-700'}`}>
            {renderMarkdown(msg.text)}
            {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-600">
                    <h4 className="font-semibold text-xs text-gray-400 mb-1">Sources:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {msg.sources.map((source, i) => (
                            <li key={i} className="text-xs truncate">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{source.title || source.uri}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
);
