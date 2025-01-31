import React from 'react';

type HeaderProps = {
  path: string;
  lastModified: string;
  typingProgress: number;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
};

export function Header({
  path,
  lastModified,
  typingProgress,
  isEditing,
  setIsEditing,
  isSidebarOpen,
  setIsSidebarOpen,
}: HeaderProps) {
  return (
    <div className="bg-gray-800 px-4 py-2 flex items-center">
      <div className="w-24">
        {/* Width placeholder to balance with right side buttons */}
      </div>

      <div className="flex items-center gap-4 flex-1 justify-center">
        <p className="text-sm font-mono text-green-400 truncate">
          Editing: {path || "/"}
        </p>
        
        <div className="h-4 w-px bg-gray-600" />
        
        <p className="text-sm font-mono text-green-400">
          Last Modified: {lastModified.length > 0 ? new Date(lastModified).toLocaleString() : "Loading..."}
        </p>
        
        <div className="h-4 w-px bg-gray-600" />
        
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-100"
            style={{ width: `${typingProgress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 w-24 justify-end">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors ${isEditing ? 'text-yellow-500' : 'text-white'}`}
        >
          {isEditing ? 'PREVIEW' : 'EDIT'}
        </button>
        
        <div className="h-4 w-px bg-gray-600" />
        
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
} 