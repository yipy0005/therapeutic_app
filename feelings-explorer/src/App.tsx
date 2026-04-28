import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { AppProvider } from './context/AppProvider';
import { SessionFlow } from './components/SessionFlow';
import { StorageBanner } from './components/StorageBanner';
import { ProfilePicker } from './screens/ProfilePicker';
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
// ProfileGate — redirects to profile picker if no active profile
// ---------------------------------------------------------------------------
function ProfileGate({ children }: { children: React.ReactNode }) {
  const { activeProfile } = useProfile();
  if (!activeProfile) return <Navigate to="/profiles" replace />;
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
function App() {
  return (
    <ProfileProvider>
      <HashRouter>
        <StorageBanner />
        <Routes>
          {/* Profile selection — always accessible */}
          <Route path="/profiles" element={<ProfilePicker />} />

          {/* Parent safety — accessible from profile picker (no active profile needed) */}
          <Route path="/parent-safety" element={<ParentSafetySection />} />

          {/* All other routes require an active profile */}
          <Route path="/*" element={
            <ProfileGate>
              <AppProvider>
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/badge-collection" element={<BadgeCollection />} />

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
              </AppProvider>
            </ProfileGate>
          } />
        </Routes>
      </HashRouter>
    </ProfileProvider>
  );
}

export default App;
