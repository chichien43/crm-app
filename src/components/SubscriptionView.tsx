import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { initialSubscriptions, initialCustomers, initialProducts, initialReminders, TODAY } from '../data';

export default function SubscriptionView() {
  const [subs, setSubs] = useState(initialSubscriptions);
  const [filter, setFilter] = useState('全部');
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [remId, setRemId] = useState<number | null>(null);
  const [remDate, setRemDate] = useState(TODAY);
  const [remTime, setRemTime] = useState('09:00');

  useEffect(() => {
    const handleUpdate = () => setSubs([...initialSubscriptions]);
    window.addEventListener('data-updated', handleUpdate);
    return () => window.removeEventListener('data-updated', handleUpdate);
  }, []);

  const filters = ['全部', '未核對', '有異動', '新加入', '變更', '暫停', '取消', '無異動'];

  const matchFilter = (s: typeof subs[0], f: string) => {
    if (f === '全部') return true;
    if (f === '未核對') return !s.ok;
    if (f === '有異動') return s.m !== '無異動';
    return s.m === f;
  };

  const list = subs.filter(s => matchFilter(s, filter));
  const count = (f: string) => subs.filter(s => matchFilter(s, f)).length;
  
  const okCount = subs.filter(s => s.ok).length;
  const activeCount = subs.filter(s => s.st === '進行中').length;

  const toggleOk = (id: number) => {
    const item = initialSubscriptions.find(s => s.id === id);
    if (item) {
      item.ok = !item.ok;
      setSubs([...initialSubscriptions]);
      window.dispatchEvent(new Event('data-updated'));
    }
  };

  const toggleOpen = (id: number) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (m: string) => {
    const map: Record<string, string> = { '新加入': 'ind', '暫停': 'accent', '取消': 'destructive', '無異動': 'muted' };
    return map[m] || 'accent';
  };

  const generateSummary = () => {
    const L = (f: (s: typeof subs[0]) => boolean) => {
      const items = subs.filter(f).map(s => {
        const c = initialCustomers.find(x => x.id === s.c);
        const p = initialProducts.find(x => x.id === s.p);
        const diffText = s.diff && s.m !== '新加入' ? `（${s.diff}）` : '';
        return `・${c?.name}　${p?.name} × ${s.q}${diffText}`;
      });
      return items.length > 0 ? items.join('\n') : '・無';
    };

    const txt = `【2026年10月 享回購月結】\n\n訂閱中 ${activeCount} 位 ・ 本月異動 ${count('有異動')} 位\n\n■ 新加入\n${L(s => s.m === '新加入')}\n■ 變更\n${L(s => !['新加入', '暫停', '取消', '無異動'].includes(s.m))}\n■ 暫停\n${L(s => s.m === '暫停')}\n■ 取消\n${L(s => s.m === '取消')}\n■ 無異動\n${L(s => s.m === '無異動')}\n\n未核對：${subs.filter(s => !s.ok).map(s => initialCustomers.find(c => c.id === s.c)?.name).join('、') || '無 ✓'}`;
    
    setSummaryText(txt);
  };

  const handleCopy = () => {
    if (summaryText && navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setToastMsg('已複製，可貼到 LINE 或記事本');
      setTimeout(() => setToastMsg(null), 2000);
    }
  };

  const modalRoot = document.getElementById('modal-root');

  return (
    <div className="animate-fade-in space-y-4 pb-8 relative">
      {/* Toast */}
      {toastMsg && modalRoot && createPortal(
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#25313A] text-white rounded-full px-4 py-2 text-sm z-[60] shadow-lg animate-fade-in whitespace-nowrap pointer-events-auto">
          {toastMsg}
        </div>,
        modalRoot
      )}

      {/* Summary Sheet */}
      {summaryText && modalRoot && createPortal(
        <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/30 pointer-events-auto transition-opacity" onClick={() => setSummaryText(null)}></div>
          <div className="w-full max-w-[400px] bg-card rounded-t-[24px] pointer-events-auto relative flex flex-col max-h-[90vh] animate-fade-in shadow-2xl">
            <div className="p-5 flex flex-col h-full">
              <div className="w-10 h-1 rounded-full mx-auto mb-4 bg-border"></div>
              <div className="flex items-center mb-3">
                <div className="font-semibold text-[17px]">月結摘要</div>
                <button onClick={() => setSummaryText(null)} className="ml-auto text-muted-foreground hover:text-foreground">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="overflow-y-auto no-scrollbar mb-4">
                <pre className="bg-muted p-4 rounded-xl text-[13px] whitespace-pre-wrap leading-6 text-foreground font-sans border border-border">
                  {summaryText}
                </pre>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-auto shrink-0">
                <button onClick={handleCopy} className="bg-card border border-border text-foreground font-medium py-3 rounded-xl text-sm hover:bg-muted transition-colors">
                  複製文字
                </button>
                <button onClick={() => { setToastMsg('分享到 LINE 功能即將上線'); setTimeout(() => setToastMsg(null), 2000); }} className="bg-[#06C755] text-white font-medium py-3 rounded-xl text-sm hover:bg-[#05B34C] transition-colors shadow-sm">
                  分享到 LINE
                </button>
              </div>
            </div>
          </div>
        </div>,
        modalRoot
      )}

      {/* Unified Top App Bar */}
      <div className="px-5 pt-8 pb-3 flex items-start gap-4 shrink-0">
        <button className="relative text-primary mt-1 w-6 h-6 flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
          <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-destructive rounded-full"></span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[22px] font-bold text-foreground tracking-wide">享回購月結</div>
          <div className="text-[13px] text-muted-foreground mt-0.5">截止日 10/25</div>
        </div>
        <div className="flex items-center gap-3 mt-1 shrink-0">
          <button onClick={() => window.dispatchEvent(new Event('open-search'))} className="text-primary w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button onClick={() => window.dispatchEvent(new Event('open-settings'))} className="text-primary w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      {/* Dashboard Card */}
      <div className="px-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center">
            <button className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="flex-1 text-center font-medium">2026 年 10 月</div>
            <button className="w-8 h-8 flex items-center justify-center opacity-30 cursor-not-allowed">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-4 text-center mt-5">
            <div>
              <div className="text-2xl font-light text-primary">{activeCount}</div>
              <div className="text-[11px] text-muted-foreground mt-1">訂閱中</div>
            </div>
            <div>
              <div className="text-2xl font-light text-[#4F6A86]">{count('新加入')}</div>
              <div className="text-[11px] text-muted-foreground mt-1">新加入</div>
            </div>
            <div>
              <div className="text-2xl font-light text-accent">{count('變更') + count('暫停')}</div>
              <div className="text-[11px] text-muted-foreground mt-1">變更/暫停</div>
            </div>
            <div>
              <div className="text-2xl font-light text-destructive">{count('取消')}</div>
              <div className="text-[11px] text-muted-foreground mt-1">取消</div>
            </div>
          </div>

          <div className="h-1.5 rounded-full mt-5 bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(okCount / subs.length) * 100}%` }}></div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2 flex justify-between">
            <span>已核對 {okCount} / {subs.length}</span>
            <span>{okCount === subs.length ? '✓ 本月已全部核對' : `還有 ${subs.length - okCount} 位未核對`}</span>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar py-1">
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`border rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground'}`}
          >
            {f} {count(f)}
          </button>
        ))}
      </div>

      {/* Subscription List */}
      <div className="px-4 space-y-2">
        {list.map(s => {
          const c = initialCustomers.find(x => x.id === s.c);
          const p = initialProducts.find(x => x.id === s.p);
          const isOpen = openItems[s.id];
          const mc = getStatusColor(s.m);
          const hasRem = initialReminders.some(r => r.cid === s.c && r.k === '享回購');

          if (!c || !p) return null;

          return (
            <div key={s.id} className="bg-card border border-border p-3 rounded-xl shadow-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0 mt-1">{c.ini}</div>
                <div className="flex-1 min-w-0" onClick={() => toggleOpen(s.id)}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap bg-${mc === 'muted' ? 'muted' : mc+'/10'} text-${mc === 'muted' ? 'muted-foreground' : mc}`}>{s.m}</span>
                    {hasRem && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {p.name} × {s.q} ・ {s.cy} ・ {s.day} 日
                  </div>
                </div>
                <button 
                  onClick={() => toggleOk(s.id)} 
                  className={`w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors ${s.ok ? 'bg-primary border-primary text-white' : 'border-border'}`}
                >
                  {s.ok && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>}
                </button>
              </div>

              {s.diff && (
                <div className={`mt-2 mx-12 text-xs rounded-lg px-3 py-2 bg-${mc === 'muted' ? 'muted' : mc+'/10'} text-${mc === 'muted' ? 'muted-foreground' : mc}`}>
                  {s.diff}
                </div>
              )}

              {isOpen && (
                <div className="mt-3 ml-12 border-t border-border pt-3 animate-fade-in">
                  {s.h.map((h, i) => (
                    <div key={i} className="text-xs py-1 flex gap-2">
                      <span className="text-muted-foreground w-10 shrink-0">{h.d.slice(5).replace('-','/')}</span>
                      <span>{h.x}</span>
                    </div>
                  ))}
                  {remId === s.id ? (
                    <div className="mt-3 bg-white border border-border p-3 rounded-xl shadow-sm">
                      <div className="text-[13px] font-medium mb-2">設定提醒</div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <input type="date" value={remDate} onChange={e => setRemDate(e.target.value)} className="w-full bg-gray-50 border border-border p-2 rounded-lg outline-none text-sm" />
                        <input type="time" value={remTime} onChange={e => setRemTime(e.target.value)} className="w-full bg-gray-50 border border-border p-2 rounded-lg outline-none text-sm" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setRemId(null)} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-muted-foreground">取消</button>
                        <button onClick={() => {
                          initialReminders.unshift({
                            id: Date.now(),
                            cid: s.c,
                            d: remDate,
                            t: remTime,
                            n: `跟進享回購：${p.name}`,
                            k: '享回購'
                          });
                          window.dispatchEvent(new Event('data-updated'));
                          setRemId(null);
                        }} className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium">儲存</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-edit-sub', { detail: s.id }));
                      }} className="flex-1 text-[13px] bg-white border border-border py-2 rounded-lg font-medium hover:bg-muted text-foreground shadow-sm">
                        記錄異動
                      </button>
                      <button onClick={() => {
                        setRemDate(TODAY);
                        setRemTime('09:00');
                        setRemId(s.id);
                      }} className="flex-1 text-[13px] bg-white border border-border py-2 rounded-lg font-medium hover:bg-muted text-foreground shadow-sm">
                        設定提醒
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && <div className="text-center text-sm text-muted-foreground py-6">沒有符合的項目</div>}
      </div>

      <div className="px-4 mt-2 grid grid-cols-2 gap-2">
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-sub', { detail: null }))} className="bg-card border border-border text-foreground font-medium py-3 rounded-xl text-sm hover:bg-muted transition-colors">
          ＋ 記錄異動
        </button>
        <button onClick={generateSummary} className="bg-primary text-primary-foreground font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-primaryHover transition-colors shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          產生月結摘要
        </button>
      </div>
    </div>
  );
}
