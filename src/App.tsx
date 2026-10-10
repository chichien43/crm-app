import React, { useState, useEffect } from 'react';
import TodayView from './components/TodayView';
import CustomerView from './components/CustomerView';
import CustomerDetailView from './components/CustomerDetailView';
import SubscriptionView from './components/SubscriptionView';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import AddCustomerView from './components/AddCustomerView';
import AddScheduleView from './components/AddScheduleView';
import AddProductView from './components/AddProductView';
import AddMenuView from './components/AddMenuView';
import AddSvcView from './components/AddSvcView';
import AddBuyView from './components/AddBuyView';
import AddSubView from './components/AddSubView';
import BadgesView from './components/BadgesView';
import { saveAll } from './data';
import LoginView from './components/LoginView';
import ProductDetailView from './components/ProductDetailView';
import SearchView from './components/SearchView';

export default function App() {
  const [_tick, setTick] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('nuskin');
  const [activeTab, setActiveTab] = useState('today');
  const [page, setPage] = useState<{ type: string, id: number } | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSvc, setShowAddSvc] = useState(false);
  const [showAddBuy, setShowAddBuy] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [editSubId, setEditSubId] = useState<number | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [addScheduleDate, setAddScheduleDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOpenSettings = () => setShowSettings(true);
    const handleOpenSearch = () => setShowSearch(true);
    const handleOpenBadges = () => setShowBadges(true);
    const handleLogout = () => {
      setIsAuthenticated(false);
      setActiveTab('today');
      setPage(null);
      setShowSettings(false);
    };
    const handleDataUpdate = () => { saveAll(); setTick(t => t + 1); };
    const handleGoBack = () => {
      setPage(null);
    };
    const handleOpenAddSchedule = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        setAddScheduleDate(e.detail);
      } else {
        setAddScheduleDate(undefined);
      }
      setShowAddSchedule(true);
    };
    const handleOpenPlus = (e: any) => {
      const id = e.detail;
      if (id === 'newc') setShowAddCustomer(true);
      if (id === 'sch') {
        setAddScheduleDate(undefined);
        setShowAddSchedule(true);
      }
      if (id === 'newp') setShowAddProduct(true);
      if (id === 'svc') setShowAddSvc(true);
      if (id === 'buy') setShowAddBuy(true);
      if (id === 'sub') {
        setEditSubId(null);
        setShowAddSub(true);
      }
    };
    const handleOpenEditSub = (e: any) => {
      setEditSubId(e.detail);
      setShowAddSub(true);
    };
    const handleNavCustDetail = (e: any) => {
      setActiveTab('cust');
      setPage({ type: 'customer', id: e.detail });
    };
    const handleNavProdDetail = (e: any) => {
      setActiveTab('cust');
      setPage({ type: 'product', id: e.detail });
    };
    
    const handleNavCal = () => { setActiveTab('cal'); setPage(null); };
    const handleNavSub = () => { setActiveTab('sub'); setPage(null); };
    
    window.addEventListener('open-settings', handleOpenSettings);
    window.addEventListener('open-search', handleOpenSearch);
    window.addEventListener('open-badges', handleOpenBadges);
    window.addEventListener('open-edit-sub', handleOpenEditSub);
    window.addEventListener('nav-cust-detail', handleNavCustDetail);
    window.addEventListener('nav-prod-detail', handleNavProdDetail);
    window.addEventListener('logout', handleLogout);
    window.addEventListener('data-updated', handleDataUpdate);
    window.addEventListener('go-back', handleGoBack);
    window.addEventListener('open-add-schedule', handleOpenAddSchedule);
    window.addEventListener('open-plus', handleOpenPlus);
    window.addEventListener('nav-cal', handleNavCal);
    window.addEventListener('nav-sub', handleNavSub);

    return () => {
      window.removeEventListener('open-settings', handleOpenSettings);
      window.removeEventListener('open-search', handleOpenSearch);
      window.removeEventListener('open-badges', handleOpenBadges);
      window.removeEventListener('open-edit-sub', handleOpenEditSub);
      window.removeEventListener('nav-cust-detail', handleNavCustDetail);
      window.removeEventListener('nav-prod-detail', handleNavProdDetail);
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('data-updated', handleDataUpdate);
      window.removeEventListener('go-back', handleGoBack);
      window.removeEventListener('open-add-schedule', handleOpenAddSchedule);
      window.removeEventListener('open-plus', handleOpenPlus);
      window.removeEventListener('nav-cal', handleNavCal);
      window.removeEventListener('nav-sub', handleNavSub);
    };
  }, []);

  const themes = ['nuskin', 'coke', 'muji', 'hermes'];
  
  const cycleTheme = () => {
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div data-theme={theme} className={`app-theme-${theme} font-sans h-screen flex justify-center bg-zinc-900 selection:bg-primary/20`}>
      <div className="w-full max-w-[480px] md:max-w-[768px] lg:max-w-[1024px] h-full bg-background relative overflow-hidden shadow-2xl flex flex-col mx-auto">
        <div className="flex-1 relative overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'today' && !page ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <TodayView />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'cal' && !page ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <CalendarView />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'sub' && !page ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <SubscriptionView />
          </div>
          <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'cust' && !page ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <CustomerView />
          </div>
          
          <div className={`absolute inset-0 transition-transform duration-300 ${page?.type === 'customer' ? 'translate-x-0 z-20' : 'translate-x-full z-0 pointer-events-none'}`}>
            {page?.type === 'customer' && <CustomerDetailView customerId={page.id as number} onBack={() => setPage(null)} onOpenProduct={(id) => setPage({ type: 'product', id })} />}
          </div>
          
          <div className={`absolute inset-0 transition-transform duration-300 ${page?.type === 'product' ? 'translate-x-0 z-20' : 'translate-x-full z-0 pointer-events-none'}`}>
            {page?.type === 'product' && <ProductDetailView productId={page.id as number} onBack={() => setPage(null)} />}
          </div>
        </div>

        <div className="h-[74px] bg-white border-t border-border flex items-center justify-between px-6 pb-2 shrink-0 relative z-30">
          <button onClick={() => { setActiveTab('today'); setPage(null); }} className={`flex flex-col items-center gap-1 w-12 ${activeTab === 'today' ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span className="text-[10px] font-medium">首頁</span>
          </button>
          
          <button onClick={() => { setActiveTab('cal'); setPage(null); }} className={`flex flex-col items-center gap-1 w-12 ${activeTab === 'cal' ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span className="text-[10px] font-medium">行程</span>
          </button>

          <div className="relative -top-5">
            <button onClick={() => setShowAddMenu(true)} className="w-[52px] h-[52px] rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          <button onClick={() => { setActiveTab('sub'); setPage(null); }} className={`flex flex-col items-center gap-1 w-12 ${activeTab === 'sub' ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span className="text-[10px] font-medium">享回購</span>
          </button>

          <button onClick={() => { setActiveTab('cust'); setPage(null); }} className={`flex flex-col items-center gap-1 w-12 ${activeTab === 'cust' ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span className="text-[10px] font-medium">客戶</span>
          </button>
        </div>
            
            {showAddMenu && (
              <AddMenuView onClose={() => setShowAddMenu(false)} context={page?.type === 'customer' ? 'customer' : 'global'} />
            )}

            {showAddMenu && (
              <div className="absolute inset-0 bg-black/20 z-30" onClick={() => setShowAddMenu(false)}></div>
            )}

            {showSettings && (
              <SettingsView onClose={() => setShowSettings(false)} theme={theme} setTheme={setTheme} />
            )}

            {showSearch && (
              <SearchView onClose={() => setShowSearch(false)} />
            )}

            {showBadges && (
              <BadgesView onClose={() => setShowBadges(false)} />
            )}

            {showAddCustomer && (
              <AddCustomerView onClose={() => setShowAddCustomer(false)} />
            )}

            {showAddSchedule && (
              <AddScheduleView onClose={() => setShowAddSchedule(false)} defaultDate={addScheduleDate} defaultCustomerId={page?.type === 'customer' ? page.id as number : undefined} />
            )}

            {showAddProduct && (
              <AddProductView onClose={() => setShowAddProduct(false)} />
            )}
            
            {showAddSvc && (
              <AddSvcView onClose={() => setShowAddSvc(false)} defaultCustomerId={page?.type === 'customer' ? page.id as number : undefined} />
            )}
            
            {showAddBuy && (
              <AddBuyView onClose={() => setShowAddBuy(false)} defaultCustomerId={page?.type === 'customer' ? page.id as number : undefined} />
            )}

            {showAddSub && (
              <AddSubView onClose={() => { setShowAddSub(false); setEditSubId(null); }} editId={editSubId} defaultCustomerId={page?.type === 'customer' ? page.id as number : undefined} />
            )}
      </div>
    </div>
  );
}
