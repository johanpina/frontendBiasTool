import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LandingContent } from './components/LandingContent';
import { Sidebar } from './components/Sidebar';
import { ToolView } from './components/ToolView';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTool, setShowTool] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-30`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 left-4 z-40 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors duration-200 ${
          isSidebarOpen ? 'transform translate-x-64' : ''
        }`}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-6 w-6 text-gray-600" />
        ) : (
          <ChevronRight className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-1">
        {showTool ? (
          <ToolView onBack={() => setShowTool(false)} />
        ) : (
          <LandingContent onStart={() => setShowTool(true)} />
        )}
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;