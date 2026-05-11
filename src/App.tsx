import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { MonthSelector } from './components/MonthSelector';
import { MarketListWithSections } from './components/MarketListWithSections';
import { SimpleMarketList } from './components/SimpleMarketList';
import { InventoryList } from './components/InventoryList';
import { HomeList } from './components/HomeList';
import { ShoppingCart, LogOut, User, Package, Home, Tag, List } from 'lucide-react';

function App() {
  const { user, loading, authLoading, error, signIn, signUp, signOut } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeTab, setActiveTab] = useState<'market' | 'inventory' | 'home'>('market');
  const [marketSubTab, setMarketSubTab] = useState<'with-price' | 'simple'>('with-price');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={signIn} onSignUp={signUp} loading={authLoading} error={error} />;
  }

  const mainTabs = [
    { key: 'market' as const, label: 'Mercado', icon: <ShoppingCart className="w-4 h-4" />, color: 'blue' },
    { key: 'inventory' as const, label: 'Inventário', icon: <Package className="w-4 h-4" />, color: 'emerald' },
    { key: 'home' as const, label: 'Tarefas', icon: <Home className="w-4 h-4" />, color: 'violet' },
  ];

  const tabActiveClass: Record<string, string> = {
    market:    'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border-blue-400',
    inventory: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-emerald-400',
    home:      'bg-violet-500 text-white shadow-lg shadow-violet-500/30 border-violet-400',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/80">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base hidden sm:block">Minhas Listas</span>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-300 max-w-[160px] truncate">{user.email}</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg transition-all text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Month Selector */}
        <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />

        {/* Main Tab Bar */}
        <div className="flex gap-2 p-1.5 bg-gray-900 rounded-2xl border border-gray-800">
          {mainTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                activeTab === tab.key
                  ? tabActiveClass[tab.key]
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Market Sub-tabs */}
        {activeTab === 'market' && (
          <div className="flex gap-2 p-1 bg-gray-900/50 rounded-xl border border-gray-800/60">
            <button
              onClick={() => setMarketSubTab('with-price')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                marketSubTab === 'with-price'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Lista com Preços
            </button>
            <button
              onClick={() => setMarketSubTab('simple')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                marketSubTab === 'simple'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista Simples
            </button>
          </div>
        )}

        {/* Content */}
        <div>
          {activeTab === 'market' && marketSubTab === 'with-price' && <MarketListWithSections month={currentMonth} />}
          {activeTab === 'market' && marketSubTab === 'simple' && <SimpleMarketList month={currentMonth} />}
          {activeTab === 'inventory' && <InventoryList />}
          {activeTab === 'home' && <HomeList month={currentMonth} />}
        </div>

        {/* Footer */}
        <footer className="text-center pt-4 pb-6 border-t border-gray-800/60">
          <p className="text-xs text-gray-600">© 2025 Desenvolvido por KauhanHernandes</p>
        </footer>
      </div>
    </div>
  );
}

export default App;