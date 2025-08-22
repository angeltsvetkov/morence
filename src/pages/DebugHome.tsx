import React from 'react';

const DebugHome: React.FC = () => {
    return (
        <div className="p-8 bg-red-100 min-h-screen">
            <h1 className="text-4xl font-bold text-red-800 mb-4">
                DEBUG: This is the React App
            </h1>
            <p className="text-lg text-red-700 mb-4">
                If you see this, the React app is working correctly.
            </p>
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Debug Info:</h2>
                <ul className="list-disc list-inside space-y-1">
                    <li>Current URL: {window.location.href}</li>
                    <li>Hostname: {window.location.hostname}</li>
                    <li>Pathname: {window.location.pathname}</li>
                    <li>Time: {new Date().toLocaleString()}</li>
                </ul>
            </div>
            <div className="mt-4">
                <button 
                    onClick={() => window.location.href = '/places'}
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                    Go to Places
                </button>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
};

export default DebugHome;
