import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import { SessionFlow } from './components/SessionFlow';
import { StorageBanner } from './components/StorageBanner';
import { HomeScreen } from './screens/HomeScreen';
import { BodyMap } from './screens/BodyMap';
import { IntensityScale } from './screens/IntensityScale';
import { NameIt } from './screens/NameIt';
import { Share } from './screens/Share';
import { CalmToolbox } from './screens/CalmToolbox';
import { CalmToolActivity } from './screens/CalmToolActivity';
import { Reflection } from './screens/Reflection';
import { ProblemSolving } from './screens/ProblemSolving';
import { BadgeScreen } from './screens/BadgeScreen';
import { BadgeCollection } from './screens/BadgeCollection';
import { ParentSafetySection } from './screens/ParentSafetySection';

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function App() {
  return (
    <AppProvider>
      <HashRouter>
        <StorageBanner />
        <Routes>
          {/* Top-level screens */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/badge-collection" element={<BadgeCollection />} />
          <Route path="/parent-safety" element={<ParentSafetySection />} />

          {/* Session screens — guarded by SessionFlow */}
          <Route element={<SessionFlow />}>
            <Route path="/body-map" element={<BodyMap />} />
            <Route path="/intensity" element={<IntensityScale />} />
            <Route path="/name-it" element={<NameIt />} />
            <Route path="/share" element={<Share />} />
            <Route path="/calm-toolbox" element={<CalmToolbox />} />
            <Route path="/calm-activity/:toolId" element={<CalmToolActivity />} />
            <Route path="/reflection" element={<Reflection />} />
            <Route path="/problem-solving" element={<ProblemSolving />} />
            <Route path="/badge-screen" element={<BadgeScreen />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
