import React, { useState } from 'react';
import { initialReminders, initialDone, initialSubscriptions, initialSchedules, TODAY, initialCustomers, userProfile } from '../data';

export default function TodayView() {
  const [selectedDay, setSelectedDay] = useState(8); // Default to today 8th
  const [showDone, setShowDone] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selectedDateStr = `2026-10-${String(selectedDay).padStart(2, '0')}`;

  const over = initialReminders.filter(r => r.d < TODAY && r.k !== '享回購');
  const td = initialReminders.filter(r => r.d === selectedDateStr && r.k !== '享回購');
  const done = initialDone.filter(r => r.d === selectedDateStr);
  const sch = initialSchedules.filter(s => s.d === selectedDateStr);
  const subUnchecked = initialSubscriptions.filter(s => !s.ok);

  const getCustomer = (id: number) => initialCustomers.find(c => c.id === id);

  const markDone = (id: number) => {
    const idx = initialReminders.findIndex(r => r.id === id);
    if (idx >= 0) {
      const [r] = initialReminders.splice(idx, 1);
      initialDone.unshift({ ...r, d: TODAY, at: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) });
      window.dispatchEvent(new Event('data-updated'));
    }
  };

  const undoDone = (id: number) => {
    const idx = initialDone.findIndex(r => r.id === id);
    if (idx >= 0) {
      const [r] = initialDone.splice(idx, 1);
      initialReminders.unshift(r);
      window.dispatchEvent(new Event('data-updated'));
    }
  };

  const goToCustomer = (cid: number) => {
    window.dispatchEvent(new CustomEvent('nav-cust-detail', { detail: cid }));
  };

  const hour = new Date().getHours();
  let greeting = '早安';
  if (hour >= 12 && hour < 18) greeting = '午安';
  if (hour >= 18) greeting = '晚安';

  return (
    <div className="absolute inset-0 bg-background flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="pt-12 pb-3 px-5 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10 sticky top-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{greeting}，{userProfile.name}</h1>
          <div className="text-[13px] text-muted-foreground mt-0.5">今天有 {td.length} 件待辦，{sch.length} 個行程</div>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => window.dispatchEvent(new Event('open-search'))} className="w-8 h-8 rounded-full text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button onClick={() => window.dispatchEvent(new Event('open-settings'))} className="w-8 h-8 rounded-full text-muted-foreground flex items-center justify-center hover:bg-muted transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button onClick={() => window.dispatchEvent(new Event('open-badges'))} className="w-9 h-9 rounded-full border-2 border-primary/20 p-0.5 relative overflow-hidden flex items-center justify-center">
            <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold">LV.5</div>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Date Strip */}
        <div className="px-4 mt-2">
          <div className="bg-card rounded-xl border border-border px-1 py-1 flex shadow-sm">
            {[4,5,6,7,8,9,10].map(d => {
              const hasSch = initialSchedules.some(s => s.d === `2026-10-${String(d).padStart(2, '0')}`);
              const on = d === selectedDay;
              const wk = ['日','一','二','三','四','五','六'][new Date(2026, 9, d).getDay()];
              return (
                <button key={d} onClick={() => setSelectedDay(d)} className={`flex-1 py-2 rounded-xl text-center transition-colors ${on ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}`}>
                  <div className={`text-[12px] ${on ? 'opacity-90' : 'text-muted-foreground'}`}>{wk}</div>
                  <div className="font-semibold mt-0.5">{d}</div>
                  <div className="h-2 flex justify-center items-center mt-0.5">
                    {hasSch && <span className={`w-1 h-1 rounded-full ${on ? 'bg-white' : 'bg-accent'}`}></span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 grid grid-cols-5 gap-1.5 mt-3">
          <div onClick={() => {}} className="bg-card border border-border p-2.5 rounded-xl text-center shadow-sm cursor-pointer hover:bg-muted transition-all">
            <div className="text-[22px] font-light text-destructive leading-tight">{over.length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">逾期</div>
          </div>
          <div onClick={() => {}} className="bg-card border border-border p-2.5 rounded-xl text-center shadow-sm cursor-pointer hover:bg-muted transition-all">
            <div className="text-[22px] font-light text-accent leading-tight">{td.length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">今日<br/>待辦</div>
          </div>
          <div onClick={() => setShowDone(!showDone)} className="bg-card border border-border p-2.5 rounded-xl text-center shadow-sm cursor-pointer hover:bg-muted transition-all">
            <div className="text-[22px] font-light text-primary leading-tight">{initialDone.filter(r => r.d === TODAY).length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">今日<br/>完成</div>
          </div>
          <div onClick={() => window.dispatchEvent(new Event('nav-cal'))} className="bg-card border border-border p-2.5 rounded-xl text-center shadow-sm cursor-pointer hover:bg-muted transition-all">
            <div className="text-[22px] font-light text-indigo-500 leading-tight">{initialSchedules.filter(s => s.d === TODAY).length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">今日<br/>行程</div>
          </div>
          <div onClick={() => window.dispatchEvent(new Event('nav-sub'))} className="bg-card border border-border p-2.5 rounded-xl text-center shadow-sm cursor-pointer hover:bg-muted transition-all">
            <div className={`text-[22px] font-light leading-tight ${subUnchecked.length > 0 ? 'text-primary' : 'text-foreground'}`}>{subUnchecked.length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">享回購<br/>待核對</div>
          </div>
        </div>
        
        <div className="px-4 mt-3">
          <button onClick={() => window.dispatchEvent(new Event('nav-sub'))} className="w-full bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-muted transition-colors active:scale-[0.98]">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
              <span className="font-medium text-[15px] text-foreground">10月 享回購排程</span>
            </div>
            <div className="text-[12px] text-muted-foreground flex items-center gap-1">
              {subUnchecked.length > 0 ? `還有 ${subUnchecked.length} 筆未核對` : '已全數核對完成'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>
        </div>

        {over.length > 0 && (
          <>
            <div className="px-5 mt-6 mb-2 text-[13px] font-semibold text-destructive uppercase tracking-wider flex items-center">
              逾期未跟進
            </div>
            <div className="px-4 space-y-2 animate-fade-in">
              {over.map(r => {
                const c = getCustomer(r.cid);
                return (
                  <div key={r.id} onClick={() => goToCustomer(r.cid)} className="bg-destructive/5 p-3 rounded-xl flex items-center gap-3 border border-destructive/20 shadow-sm cursor-pointer hover:bg-destructive/10 transition-colors">
                    <div className="w-12 text-center">
                      <div className="text-[15px] font-semibold text-destructive">{r.d.slice(5).replace('-','/')}</div>
                      <div className="text-[12px] text-destructive/70 mt-0.5">{r.t}</div>
                    </div>
                    <div className="w-px h-10 bg-destructive/20"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[15px] flex items-center gap-2 text-destructive">
                        {c?.name}
                        {r.k !== '跟進' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{r.k}</span>}
                      </div>
                      <div className="text-[13px] text-destructive/70 truncate mt-0.5">{r.n}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); markDone(r.id); }} className="w-6 h-6 rounded-md border-2 border-destructive/40 flex items-center justify-center text-white hover:border-destructive shrink-0 transition-colors"></button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="px-5 mt-6 mb-2 text-[13px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
          {selectedDay === 8 ? '今日待辦' : `${selectedDay}日 待辦`}
        </div>
        <div className="px-4 space-y-2 animate-fade-in">
          {sch.map(s => {
            const uId = s.t + s.x;
            return (
              <div key={uId} className="bg-card p-3 rounded-xl flex items-center gap-3 border border-border shadow-sm">
                <div className="w-12 text-center text-[15px] font-semibold text-foreground">{s.t}</div>
                <div className="w-px h-10 bg-indigo-500"></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] text-foreground">{s.x}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">行程</div>
                </div>
                {!deleteConfirmId || deleteConfirmId !== uId ? (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setDeleteConfirmId(uId);
                    }} 
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-destructive/5 px-2 py-1 rounded-lg">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = initialSchedules.findIndex(x => x.t === s.t && x.x === s.x && x.d === s.d);
                        if (idx >= 0) initialSchedules.splice(idx, 1);
                        window.dispatchEvent(new Event('data-updated'));
                        setDeleteConfirmId(null);
                      }} 
                      className="text-[11px] bg-destructive text-white px-2 py-1 rounded"
                    >
                      刪除
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} 
                      className="text-[11px] bg-white text-muted-foreground border border-border px-2 py-1 rounded"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {td.map(r => {
            const c = getCustomer(r.cid);
            return (
              <div key={r.id} onClick={() => goToCustomer(r.cid)} className="bg-card p-3 rounded-xl flex items-center gap-3 border border-border shadow-sm cursor-pointer hover:bg-muted transition-colors">
                <div className="w-12 text-center">
                  <div className="text-[15px] font-semibold text-foreground">{r.t}</div>
                </div>
                <div className="w-px h-10 bg-accent"></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] text-foreground flex items-center gap-2">
                    {c?.name}
                    {r.k !== '跟進' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">{r.k}</span>}
                  </div>
                  <div className="text-[13px] text-muted-foreground truncate mt-0.5">{r.n}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); markDone(r.id); }} className="w-6 h-6 rounded-md border-2 border-border flex items-center justify-center text-white hover:border-primary shrink-0 transition-colors"></button>
              </div>
            );
          })}
          {td.length === 0 && sch.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">這天沒有待辦 🍵</div>
          )}
        </div>

        {showDone && done.length > 0 && (
          <>
            <div className="px-5 mt-6 mb-2 text-[13px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
              已完成 ({done.length})
            </div>
            <div className="px-4 space-y-2 animate-fade-in">
              {done.map(r => {
                const c = getCustomer(r.cid);
                return (
                  <div key={r.id} onClick={() => goToCustomer(r.cid)} className="bg-card p-3 rounded-xl flex items-center gap-3 border border-border shadow-sm opacity-60 cursor-pointer hover:opacity-100 transition-opacity">
                    <div className="w-12 text-center">
                      <div className="text-[15px] font-semibold text-foreground">{r.t}</div>
                    </div>
                    <div className="w-px h-10 bg-border"></div>
                    <div className="flex-1 min-w-0 line-through text-muted-foreground">
                      <div className="font-medium text-[15px] flex items-center gap-2">
                        {c?.name}
                      </div>
                      <div className="text-[13px] truncate mt-0.5">{r.n}</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground text-center">
                      <div>完成於</div>
                      <div>{r.at}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); undoDone(r.id); }} className="w-6 h-6 rounded-md border-2 border-primary bg-primary flex items-center justify-center text-white hover:bg-primary/90 shrink-0 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
