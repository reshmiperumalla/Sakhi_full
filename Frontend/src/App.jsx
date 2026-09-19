import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { useOffline } from './context/OfflineContext';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { OfflineBanner } from './components/layout/OfflineBanner';

// Pages
import { LandingPage } from './pages/Landing/LandingPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { MoneyPage } from './pages/Money/MoneyPage';
import { BudgetPage } from './pages/Budget/BudgetPage';
import { GoalsPage } from './pages/Goals/GoalsPage';
import { IrregularIncomePage } from './pages/Irregular/IrregularIncomePage';
import { SimulatorPage } from './pages/Simulator/SimulatorPage';
import { AssistantPage } from './pages/Assistant/AssistantPage';
import { ScamDetectivePage } from './pages/ScamDetective/ScamDetectivePage';
import { LearnPage } from './pages/Learn/LearnPage';
import { GamesPage } from './pages/Games/GamesPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { FeaturesPage } from './pages/Features/FeaturesPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

// Modals
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { VoiceInputModal } from './components/assistant/VoiceInputModal';
import { Mic } from 'lucide-react';

export default function App() {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const { isOnline } = useOffline();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState('expense');

  const handleOpenAddModal = (type = 'expense') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const handleVoiceTranscript = (transcript) => {
    setActiveTab('transactions');
  };

  // If on Landing Page, render clean landing experience
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex flex-col antialiased text-[#263238] font-sans">
        <OfflineBanner />
        <LandingPage
          onGetStarted={() => setActiveTab('dashboard')}
          onExplore={() => setActiveTab('features')}
          onGoToDashboard={() => setActiveTab('dashboard')}
          hasSession={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col antialiased text-[#263238] font-sans pb-16 md:pb-0">
      {/* Offline Notification Banner */}
      <OfflineBanner />

      {/* Top Navbar */}
      <Navbar onNavigate={(tab) => setActiveTab(tab)} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Page Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {activeTab === 'transactions' && <MoneyPage />}

          {activeTab === 'budget' && <BudgetPage />}

          {activeTab === 'goals' && <GoalsPage />}

          {activeTab === 'irregular' && <IrregularIncomePage />}

          {activeTab === 'simulator' && <SimulatorPage />}

          {activeTab === 'assistant' && <AssistantPage />}

          {activeTab === 'scam' && <ScamDetectivePage />}

          {activeTab === 'learn' && <LearnPage />}

          {activeTab === 'games' && <GamesPage />}

          {activeTab === 'profile' && <ProfilePage />}

          {activeTab === 'features' && (
            <FeaturesPage onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAssistant={() => setActiveTab('assistant')}
      />

      {/* Global Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        initialType={addModalType}
        onClose={() => setIsAddModalOpen(false)}
        onTransactionAdded={() => {
          api.dispatchFinancialMutation();
        }}
      />

      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptReady={handleVoiceTranscript}
      />
    </div>
  );
}
