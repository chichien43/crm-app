import React, { useEffect, useState } from 'react';
import { userProfile } from '../data';

export default function SettingsView({ 
  onClose, 
  theme, 
  setTheme 
}: { 
  onClose: () => void, 
  theme: string, 
  setTheme: (t: string) => void 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const themes = [
    { id: 'nuskin', name: 'NUSKIN 藍', color: '#0085CA' },
    { id: 'muji', name: 'Muji 植萃', color: '#7A1F1F' }, // Muji red/brown
    { id: 'coke', name: 'CocaCola 經典', color: '#F40009' },
    { id: 'hermes', name: 'Hermes 橘', color: '#F37021' },
  ];

  const [themeExpanded, setThemeExpanded] = useState(false);

  return (
    <div className="absolute inset-0 z-[200] overflow-hidden flex flex-col pointer-events-none">
      <div 
        className={`absolute inset-0 bg-black/40 pointer-events-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      ></div>
      
      <div 
        className={`absolute top-0 right-0 bottom-0 w-[85%] bg-gray-50 pointer-events-auto flex flex-col transition-transform duration-300 ease-out shadow-2xl ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="px-5 py-6 bg-white border-b border-border flex items-center justify-between shrink-0">
          <div className="text-[20px] font-bold text-foreground">設定</div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-muted rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <section>
            <div className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">外觀設定</div>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <button 
                onClick={() => setThemeExpanded(!themeExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <span className="text-[15px] font-medium text-foreground">品牌配色</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: themes.find(t => t.id === theme)?.color }}></div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-muted-foreground transition-transform duration-300 ${themeExpanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </button>
              
              {themeExpanded && (
                <div className="border-t border-border bg-gray-50/50">
                  {themes.map((t, i) => (
                    <button 
                      key={t.id}
                      onClick={() => { setTheme(t.id); setThemeExpanded(false); }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white transition-colors ${i !== themes.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }}></div>
                        <span className={`text-[14px] ${theme === t.id ? 'font-medium text-primary' : 'text-muted-foreground'}`}>{t.name}</span>
                      </div>
                      {theme === t.id && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">使用者設定</div>
            <div className="bg-white rounded-2xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0">
                  {userProfile.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-muted-foreground mb-1">顯示名稱</div>
                  <input 
                    type="text" 
                    defaultValue={userProfile.name}
                    onChange={(e) => { userProfile.name = e.target.value; window.dispatchEvent(new Event('data-updated')); }}
                    className="w-full bg-muted border border-border px-3 py-2 rounded-lg text-[15px] text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="text-[12px] text-muted-foreground bg-muted/50 p-3 rounded-lg flex gap-2 items-start leading-relaxed">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>目前的架構為「手機地端版」，所有資料皆安全地儲存於您的設備上，不需網路即可快速運作。未來若有團隊協作需求，可升級至雲端版進行多人同步。</span>
              </div>
            </div>
          </section>

          <section>
            <div className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">個人與團隊</div>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <button onClick={() => window.dispatchEvent(new CustomEvent('open-badges'))} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15l-2 5l9-5l-9-5l2 5Z"/><circle cx="12" cy="8" r="6"/></svg>
                  </div>
                  <div className="text-left">
                    <div className="text-[15px] font-medium text-foreground">成就勳章</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">查看已獲得的表揚與活動勳章</div>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground opacity-50"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </section>

          <section>
            <div className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">通知與提醒</div>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="w-full flex items-center justify-between p-4 border-b border-border">
                <span className="text-[15px] font-medium text-foreground">每日早報推播</span>
                <div className="w-11 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="w-full flex items-center justify-between p-4">
                <span className="text-[15px] font-medium text-foreground">預設提醒時間</span>
                <span className="text-[15px] text-muted-foreground">上午 09:00</span>
              </div>
            </div>
          </section>

          <div className="pt-8">
            <button onClick={() => { window.dispatchEvent(new Event('logout')); onClose(); }} className="w-full py-3.5 bg-white text-destructive border border-border rounded-xl font-medium shadow-sm">
              登出帳號
            </button>
            <div className="text-center mt-6 text-xs text-muted-foreground">
              直銷團隊專屬 CRM v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
