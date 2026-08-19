import React, { useState } from 'react';
import { LandingContent } from './components/LandingContent';
import { ToolView } from './components/ToolView';
import { FeedbackButton } from './components/FeedbackButton';

function App() {
  const [showTool, setShowTool] = useState(false);

  return (
    <div className="min-h-screen bg-paper">
      {showTool ? (
        <ToolView onBack={() => setShowTool(false)} />
      ) : (
        <LandingContent onStart={() => setShowTool(true)} />
      )}

      {/* Botón flotante de feedback (reemplaza el sidebar de Información) */}
      <FeedbackButton />
    </div>
  );
}

export default App;
