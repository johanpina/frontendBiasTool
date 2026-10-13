import React, { useState } from 'react';
import { LandingContent } from './components/LandingContent';
import { ToolView } from './components/ToolView';
import { FeedbackButton } from './components/FeedbackButton';
import { PrivacyPage } from './components/PrivacyPage';

function App() {
  const [showTool, setShowTool] = useState(false);

  // Única ruta adicional: la política de privacidad (sin router).
  if (window.location.pathname.replace(/\/+$/, '') === '/privacidad') {
    return <PrivacyPage />;
  }

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
