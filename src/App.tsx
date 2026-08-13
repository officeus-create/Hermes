import React, { useState, useEffect } from 'react';
import { useConnectStore } from './store/useStore';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { AIBrainWidget } from './components/AIBrainWidget';
import { AdaptiveOnboardingModal } from './components/AdaptiveOnboardingModal';
import { BrandLogoExplorerModal, LogoConceptId } from './components/BrandLogoExplorerV2';

import { HeroLandingView } from './views/HeroLandingView';
import { OSCommandCenterView } from './views/OSCommandCenterView';
import { CandidateResumeAuditorView } from './views/CandidateResumeAuditorView';
import { BeautyWorkspace } from './views/BeautyWorkspace';
import { AutoRepairWorkspace } from './views/AutoRepairWorkspace';
import { LoadBoardWorkspace } from './views/LoadBoardWorkspace';
import { FitnessWorkspace } from './views/FitnessWorkspace';
import { MarketingWorkspace } from './views/MarketingWorkspace';
import { GlobalIntentNetworkView } from './views/GlobalIntentNetworkView';
import { WebsiteIntegrationDemo } from './views/WebsiteIntegrationDemo';

export function App() {
  const {
    activeVertical,
    setActiveVertical,
    activeRole,
    setActiveRole,
    currentWorkspace,
    services,
    appointments,
    vehicleJobs,
    freightLoads,
    fitnessClients,
    aiMessages,
    addAppointment,
    updateAppointmentStatus,
    addVehicleJob,
    updateVehicleJobStatus,
    submitFreightBid,
    updateFreightLoadStatus,
    sendAIMessage
  } = useConnectStore();

  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedLogoConcept, setSelectedLogoConcept] = useState<LogoConceptId>('quantum_node');
  const [isLogoExplorerOpen, setIsLogoExplorerOpen] = useState(false);

  useEffect(() => {
    if (themeMode === 'light') {
      document.body.classList.add('theme-light-pearl');
    } else {
      document.body.classList.remove('theme-light-pearl');
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isFullWidthView = 
    activeVertical === 'hero_landing' || 
    activeVertical === 'os_command_center' ||
    activeVertical === 'candidate_auditor' ||
    activeVertical === 'global_network' || 
    activeVertical === 'website_demo';

  return (
    <div className="min-h-screen pb-20 transition-colors duration-300">
      {/* Top Navigation */}
      <Navigation
        activeVertical={activeVertical}
        setActiveVertical={setActiveVertical}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        themeMode={themeMode}
        onToggleThemeMode={toggleThemeMode}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        selectedLogoConcept={selectedLogoConcept}
        onOpenLogoExplorer={() => setIsLogoExplorerOpen(true)}
      />

      {/* Main Content Layout */}
      <main className="px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Area (Hidden on Full-Width Hero Landing, OS Command Center, Candidate Auditor, Global Network & Website Demo views) */}
          {!isFullWidthView && (
            <div className="lg:col-span-3">
              <Sidebar workspace={currentWorkspace} activeRole={activeRole} />
            </div>
          )}

          {/* Active Workspace View */}
          <div className={`${isFullWidthView ? 'lg:col-span-12' : 'lg:col-span-9'}`}>
            {activeVertical === 'hero_landing' && (
              <HeroLandingView
                onNavigateVertical={setActiveVertical}
                onOpenOnboarding={() => setIsOnboardingOpen(true)}
              />
            )}

            {activeVertical === 'os_command_center' && (
              <OSCommandCenterView />
            )}

            {activeVertical === 'candidate_auditor' && (
              <CandidateResumeAuditorView />
            )}

            {activeVertical === 'beauty' && (
              <BeautyWorkspace
                services={services}
                appointments={appointments}
                activeRole={activeRole}
                onAddAppointment={addAppointment}
                onUpdateStatus={updateAppointmentStatus}
              />
            )}

            {activeVertical === 'auto_repair' && (
              <AutoRepairWorkspace
                vehicleJobs={vehicleJobs}
                activeRole={activeRole}
                onAddJob={addVehicleJob}
                onUpdateJobStatus={updateVehicleJobStatus}
              />
            )}

            {activeVertical === 'logistics' && (
              <LoadBoardWorkspace
                loads={freightLoads}
                activeRole={activeRole}
                onSubmitBid={submitFreightBid}
                onUpdateLoadStatus={updateFreightLoadStatus}
              />
            )}

            {activeVertical === 'fitness' && (
              <FitnessWorkspace
                fitnessClients={fitnessClients}
                activeRole={activeRole}
              />
            )}

            {activeVertical === 'marketing' && (
              <MarketingWorkspace activeRole={activeRole} />
            )}

            {activeVertical === 'global_network' && (
              <GlobalIntentNetworkView onNavigateVertical={setActiveVertical} />
            )}

            {activeVertical === 'website_demo' && (
              <WebsiteIntegrationDemo />
            )}
          </div>
        </div>
      </main>

      {/* Brand Exploration V2 Logo Explorer Modal */}
      <BrandLogoExplorerModal
        isOpen={isLogoExplorerOpen}
        onClose={() => setIsLogoExplorerOpen(false)}
        selectedConcept={selectedLogoConcept}
        onSelectConcept={(concept) => setSelectedLogoConcept(concept)}
      />

      {/* 1-Click Adaptive Onboarding Modal */}
      <AdaptiveOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectVertical={setActiveVertical}
        activeVertical={activeVertical}
      />

      {/* Front-Door AI Brain Floating Widget */}
      <AIBrainWidget
        messages={aiMessages}
        onSendMessage={sendAIMessage}
        onNavigateVertical={setActiveVertical}
      />
    </div>
  );
}

export default App;
