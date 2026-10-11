import React, { useEffect, useState, useRef } from 'react';
import { userProfile, getExportPayload, importBackupPayload } from '../data';

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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleExportJson = () => {
    try {
      const data = getExportPayload();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const filename = `CRM_備份_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.json`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showFeedback('success', `✅ 已下載備份檔案：${filename}`);
    } catch (e: any) {
      showFeedback('error', `匯出失敗：${e.message || '未知錯誤'}`);
    }
  };

  const handleCopyJson = async () => {
    try {
      const data = getExportPayload();
      const jsonString = JSON.stringify(data, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonString);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = jsonString;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showFeedback('success', '📋 備份代碼已複製到剪貼簿！可貼至手機備忘錄或通訊軟體保存。');
    } catch (e: any) {
      showFeedback('error', '複製失敗，請使用「下載檔案」方式。');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const counts = importBackupPayload(parsed);
        showFeedback('success', `🎉 資料還原成功！已載入 ${counts.customers} 位客戶、${counts.purchases} 筆消費紀錄。`);
      } catch (err: any) {
        showFeedback('error', `還原失敗：${err.message || '無效的備份格式'}`);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const themes = [
    { id: 'nuskin', name: 'NUSKIN 藍', color: '#0085CA' },
    { id: 'muji', name: 'Muji 植萃', color: '#7A1F1F' },
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
            </div>
          </section>

          {/* 資料儲存與備份匯出 */}
          <section>
            <div className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">資料儲存與備份匯出</div>
            <div className="bg-white rounded-2xl border border-border p-4 space-y-4">
              
              {/* 儲存機制解說卡片 */}
              <div className="text-[12px] text-muted-foreground bg-primary/5 border border-primary/15 p-3.5 rounded-xl space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-2 font-semibold text-primary text-[13px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>100% 手機本機儲存・極致隱私安全</span>
                </div>
                <p>
                  您的所有客戶名單、購買紀錄、行程與享回購排程資料，皆直接保存在您目前的<span className="font-semibold text-foreground">手機瀏覽器內部空間 (Local Storage)</span>。
                </p>
                <p className="text-[11px] text-muted-foreground/90">
                  💡 系統不會將您的私密客戶資料上傳到外部伺服器。若需更換新手機或清理瀏覽紀錄，請善用下方「匯出備份檔案」隨時下載保存。
                </p>
              </div>

              {/* 操作反饋提示 */}
              {feedback && (
                <div className={`p-3 rounded-xl text-[13px] flex items-start justify-between gap-2 transition-all ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  <div className="flex-1 font-medium">{feedback.message}</div>
                  <button onClick={() => setFeedback(null)} className="text-xs opacity-60 hover:opacity-100 p-0.5">✕</button>
                </div>
              )}

              {/* 匯出按鈕群 */}
              <div className="space-y-2">
                <button 
                  onClick={handleExportJson}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>匯出備份檔案 (.json)</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">下載檔案</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleCopyJson}
                    className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-border bg-gray-50 hover:bg-white text-foreground text-[13px] font-medium transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    <span>複製備份文字</span>
                  </button>

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-border bg-gray-50 hover:bg-white text-foreground text-[13px] font-medium transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>還原備份檔案</span>
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".json,application/json" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
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

          <div className="pt-4 pb-8 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[12px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              本機離線模式運作中・無須登入
            </div>
            <div className="text-xs text-muted-foreground">
              直銷團隊專屬 CRM v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
