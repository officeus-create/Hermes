import React from 'react';
import { useConnectStore } from './store/useStore';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { AIBrainWidget } from './components/AIBrainWidget';

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

  return (
    <div className="min-h-screen pb-20">
      {/* Top Navigation */}
      <Navigation
        activeVertical={activeVertical}
        setActiveVertical={setActiveVertical}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />

      {/* Main Content Layout */}
      <main className="px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Area (Hidden on Global Network & Website Demo views for full width) */}
          {activeVertical !== 'global_network' && activeVertical !== 'website_demo' && (
            <div className="lg:col-span-3">
              <Sidebar workspace={currentWorkspace} activeRole={activeRole} />
            </div>
          )}

          {/* Active Workspace View */}
          <div className={`${
            activeVertical === 'global_network' || activeVertical === 'website_demo' 
              ? 'lg:col-span-12' 
              : 'lg:col-span-9'
          }`}>
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
