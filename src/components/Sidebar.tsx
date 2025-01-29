import React from 'react';

type SidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  fontColor: string;
  fontSize: string;
  handleFontColorChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFontSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  fontColor,
  fontSize,
  handleFontColorChange,
  handleFontSizeChange,
}: SidebarProps) {
  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem'
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-64 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Settings</h3>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 relative">
            <label htmlFor="fontColor" className="block text-sm font-medium">
              Font Color
            </label>
            <select
              id="fontColor"
              className="w-full bg-gray-700 rounded-md p-2 appearance-none cursor-pointer relative z-10"
              value={fontColor}
              onChange={handleFontColorChange}
              style={selectStyle}
            >
              <option value="text-white">White</option>
              <option value="text-green-400">Light Green</option>
              <option value="text-blue-400">Light Blue</option>
            </select>
          </div>

          <div className="space-y-2 relative">
            <label htmlFor="fontSize" className="block text-sm font-medium">
              Font Size
            </label>
            <select
              id="fontSize"
              className="w-full bg-gray-700 rounded-md p-2 appearance-none cursor-pointer relative z-10"
              value={fontSize}
              onChange={handleFontSizeChange}
              style={selectStyle}
            >
              <option value="text-xs">Extra Small</option>
              <option value="text-sm">Small</option>
              <option value="text-base">Base</option>
              <option value="text-lg">Large</option>
              <option value="text-xl">Extra Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
} 