import React, { useState, useEffect, useRef } from 'react';
import { initialSchedules, initialReminders, initialCustomers, initialSubscriptions, initialProducts, initialDone, TODAY, checkHasUnreadNews } from '../data';

let cachedCalendarDate = TODAY;

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(cachedCalendarDate);
  const [view, setView] = useState<'月' | '清單'>('月');
  const [openId, setOpenId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [remId, setRemId] = useState<string | null>(null);
  const [hasUnreadNews, setHasUnreadNews] = useState(checkHasUnreadNews);

  useEffect(() => {
    const handleNews = () => setHasUnreadNews(checkHasUnreadNews());
    window.addEventListener('news-read-updated', handleNews);
    return () => window.removeEventListener('news-read-updated', handleNews);
  }, []);

  // Edit states
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  
  // Rem states
  const [remDate, setRemDate] = useState('');
  const [remTime, setRemTime] = useState('');

  useEffect(() => {
    cachedCalendarDate = selectedDate;
  }, [selectedDate]);

  // Year & Month state
  const [currentYear, setCurrentYear] = useState(() => {
    const d = new Date(cachedCalendarDate || TODAY);
    return isNaN(d.getTime()) ? 2026 : d.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(cachedCalendarDate || TODAY);
    return isNaN(d.getTime()) ? 9 : d.getMonth();
  });

  const changeMonth = (delta: number) => {
    let newYear = currentYear;
    let newMonth = currentMonth + delta;
    if (newMonth < 0) {
      newYear -= 1;
      newMonth = 11;
    } else if (newMonth > 11) {
      newYear += 1;
      newMonth = 0;
    }
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);

    // Keep same day if possible, or clamp to new month's days
    const currDay = parseInt(selectedDate.slice(-2), 10) || 1;
    const daysInNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    const newDay = Math.min(currDay, daysInNewMonth);
    const newDateStr = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
    setSelectedDate(newDateStr);
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(TODAY);
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDay = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const getDayStr = (d: number) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${currentYear}-${mStr}-${dStr}`;
  };

  const isToday = (d: number) => getDayStr(d) === TODAY;

  // Touch gesture handlers for vertical swipe (上下滑) and horizontal swipe
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;

    // Vertical swipe (上下滑)
    if (Math.abs(diffY) > 35 && Math.abs(diffY) > Math.abs(diffX)) {
      if (diffY < 0) {
        // Swiped UP -> Next month (往上滑看下個月)
        changeMonth(1);
      } else {
        // Swiped DOWN -> Previous month (往下滑看上個月)
        changeMonth(-1);
      }
    } 
    // Horizontal swipe (左右滑也支援)
    else if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        changeMonth(1);
      } else {
        changeMonth(-1);
      }
    }

    touchStartY.current = null;
    touchStartX.current = null;
  };
  
  const getDots = (date: string) => {
    const hasRem = initialReminders.some(r => r.d === date && r.k !== '享回購');
    const hasSch = initialSchedules.some(s => s.d === date);
    const hasSub = initialReminders.some(r => r.d === date && r.k === '享回購') || 
                   initialSubscriptions.some(s => s.st === '進行中' && s.day === parseInt(date.slice(-2)));
    return { hasRem, hasSch, hasSub };
  };

  const selectedSchedules = initialSchedules.filter(s => s.d === selectedDate);
  const selectedReminders = initialReminders.filter(r => r.d === selectedDate);
  const selectedSubs = initialSubscriptions
    .filter(s => s.st === '進行中' && s.day === parseInt(selectedDate.slice(-2)))
    .map(s => ({
      t: '10:00', x: `${initialProducts?.find(p => p.id === s.p)?.name} * ${s.q}`, type: 'sub' as const, uid: `sub-${s.id}`, n: '享回購出貨', cid: s.c, subId: s.id, d: selectedDate
    }));

  const allItems = [
    ...selectedSchedules.map(s => ({ ...s, type: 'sch' as const, uid: `sch-${s.t}-${s.x}-${s.d}`, n: '一般行程', cid: null, col: '#64748B' })),
    ...selectedReminders.map(r => ({ 
      ...r, type: 'rem' as const, uid: `rem-${r.id}`, 
      x: `${initialCustomers.find(c => c.id === r.cid)?.name}：${r.n}`,
      n: r.k,
      col: r.k === '享回購' ? 'var(--primary)' : '#F59E0B'
    })),
    ...selectedSubs.map(s => ({ ...s, col: 'var(--primary)', k: '享回購' }))
  ].sort((a, b) => a.t > b.t ? 1 : -1);

  const startEdit = (item: any) => {
    setEditTitle(item.x);
    setEditDate(item.d);
    setEditTime(item.t);
    setEditId(item.uid);
    setRemId(null);
  };

  const startRem = (item: any) => {
    setRemDate(item.d);
    setRemTime(item.t);
    setRemId(item.uid);
    setEditId(null);
  };

  const saveEdit = (item: any) => {
    if (item.type === 'sch') {
      const idx = initialSchedules.findIndex(s => s.t === item.t && s.x === item.x && s.d === item.d);
      if (idx >= 0) {
        initialSchedules[idx].x = editTitle;
        initialSchedules[idx].d = editDate;
        initialSchedules[idx].t = editTime;
      }
    } else if (item.type === 'rem') {
      const idx = initialReminders.findIndex(r => r.id === parseInt(item.uid.split('-')[1]));
      if (idx >= 0) {
        initialReminders[idx].n = editTitle.includes('：') ? editTitle.split('：').slice(1).join('：') : editTitle;
        initialReminders[idx].d = editDate;
        initialReminders[idx].t = editTime;
      }
    }
    window.dispatchEvent(new Event('data-updated'));
    setEditId(null);
  };

  const saveRem = (item: any) => {
    initialReminders.unshift({
      id: Date.now(),
      cid: item.cid || 1,
      d: remDate,
      t: remTime,
      n: `提醒：${item.x}`,
      k: '跟進'
    });
    window.dispatchEvent(new Event('data-updated'));
    setRemId(null);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const deleteItem = (item: any) => {
    if (item.type === 'sch') {
      const idx = initialSchedules.findIndex(s => s.t === item.t && s.x === item.x && s.d === item.d);
      if (idx >= 0) initialSchedules.splice(idx, 1);
    } else if (item.type === 'rem') {
      const idx = initialReminders.findIndex(r => r.id === parseInt(item.uid.split('-')[1]));
      if (idx >= 0) initialReminders.splice(idx, 1);
    }
    window.dispatchEvent(new Event('data-updated'));
    setDeleteConfirmId(null);
  };

  const handleComplete = (item: any) => {
    if (item.type === 'rem') {
      const idx = initialReminders.findIndex(r => r.id === parseInt(item.uid.split('-')[1]));
      if (idx >= 0) {
        const [r] = initialReminders.splice(idx, 1);
        initialDone.unshift({ ...r, d: TODAY, at: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) });
      }
    } else if (item.type === 'sch') {
      const idx = initialSchedules.findIndex(s => s.t === item.t && s.x === item.x && s.d === item.d);
      if (idx >= 0) {
        initialSchedules.splice(idx, 1);
      }
    }
    window.dispatchEvent(new Event('data-updated'));
  };

  return (
    <div className="animate-fade-in pb-8 h-full flex flex-col relative bg-gray-50">
      
      {/* Unified Top App Bar */}
      <div className="px-5 pt-8 pb-3 flex items-start gap-4 shrink-0">
        <button onClick={() => window.dispatchEvent(new Event('open-news'))} className="relative text-primary mt-1 w-6 h-6 flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
          {hasUnreadNews && (
            <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-destructive rounded-full"></span>
          )}
        </button>
        <div className="flex-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {currentYear}年 {currentMonth + 1}月
          </h1>
          {(currentYear !== new Date().getFullYear() || currentMonth !== new Date().getMonth()) && (
            <button 
              onClick={goToToday}
              className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
            >
              回本月
            </button>
          )}
        </div>
        <button onClick={() => window.dispatchEvent(new Event('open-settings'))} className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center shrink-0 text-foreground hover:bg-muted transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {view === '月' ? (
          <div className="px-4">
            <div 
              className="bg-white rounded-2xl border border-border p-3 shadow-sm mb-6 select-none cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Calendar Month Navigation Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                <button 
                  onClick={() => changeMonth(-1)} 
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 px-2.5 rounded-lg hover:bg-muted active:scale-95 transition-all"
                  title="上個月"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                  <span>上個月</span>
                </button>
                <div className="text-center">
                  <span className="font-bold text-foreground text-[15px]">{currentYear}年 {currentMonth + 1}月</span>
                  <div className="text-[10px] text-muted-foreground">可上下滑動切換月份</div>
                </div>
                <button 
                  onClick={() => changeMonth(1)} 
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 px-2.5 rounded-lg hover:bg-muted active:scale-95 transition-all"
                  title="下個月"
                >
                  <span>下個月</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <div key={d} className="text-center text-[11px] font-medium text-muted-foreground">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-y-2">
                {blanks.map(i => <div key={`b-${i}`} className="h-11"></div>)}
                {days.map(d => {
                  const dateStr = getDayStr(d);
                  const isSelected = selectedDate === dateStr;
                  const todayFlag = isToday(d);
                  const dots = getDots(dateStr);
                  
                  return (
                    <button 
                      key={d}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-11 flex flex-col items-center justify-start pt-1 relative rounded-xl transition-all ${isSelected ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted'}`}
                    >
                      <span className={`text-[14px] ${todayFlag && !isSelected ? 'font-bold text-primary underline underline-offset-4 decoration-2' : ''}`}>{d}</span>
                      <div className="flex gap-0.5 mt-0.5">
                        {dots.hasSch && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#64748B]'}`}></span>}
                        {dots.hasRem && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#F59E0B]'}`}></span>}
                        {dots.hasSub && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4">
            <div className="h-40 bg-white rounded-2xl border border-border flex items-center justify-center text-muted-foreground shadow-sm mb-6">
              清單視圖開發中
            </div>
          </div>
        )}

        <div className="px-5 mb-3 flex items-center justify-between">
          <div className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            {selectedDate.replace(/-/g, ' / ')}
            <span className="text-muted-foreground font-normal text-xs">
              星期{['日','一','二','三','四','五','六'][new Date(selectedDate).getDay()]}
            </span>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-add-schedule', { detail: selectedDate }))} className="text-primary text-[13px] font-medium flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full active:bg-primary/20 transition-colors">
            ＋ 行程
          </button>
        </div>

        <div className="px-4 space-y-2.5 pb-20">
          {allItems.length === 0 ? (
            <div className="text-center text-muted-foreground text-[13px] py-10 bg-white border border-border rounded-xl border-dashed">
              這天沒有安排行程
            </div>
          ) : (
            allItems.map(item => {
              const isOpen = openId === item.uid;
              const isEdit = editId === item.uid;
              const isRem = remId === item.uid;
              return (
                <div key={item.uid} className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in transition-all">
                  <div 
                    onClick={() => {
                      setOpenId(openId === item.uid ? null : item.uid);
                      setEditId(null);
                      setRemId(null);
                    }}
                    className={`flex items-stretch cursor-pointer hover:bg-gray-50/80 active:bg-gray-100 transition-colors ${isOpen ? 'bg-gray-50' : ''}`}
                  >
                    <div className="w-1.5 shrink-0" style={{ backgroundColor: item.col }}></div>
                    <div className="p-3.5 flex items-center gap-4 flex-1">
                      <div className="text-[17px] font-medium text-foreground w-12 shrink-0">
                        {item.t}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] text-foreground">{item.x}</div>
                        <div 
                          className="text-[13px] mt-0.5 inline-block cursor-pointer hover:underline" 
                          style={{ color: item.col }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.cid) {
                              window.dispatchEvent(new CustomEvent('nav-cust-detail', { detail: item.cid }));
                            }
                          }}
                        >
                          {item.n}
                        </div>
                      </div>
                      <div className="shrink-0 text-muted-foreground opacity-50">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 animate-fade-in bg-gray-50 border-t border-border/50">
                      {isEdit ? (
                        <div className="space-y-3 mt-3">
                          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full text-sm font-medium bg-white border border-border p-2 rounded-lg outline-none" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full bg-white border border-border p-2 rounded-lg outline-none text-sm" />
                            <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} className="w-full bg-white border border-border p-2 rounded-lg outline-none text-sm" />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditId(null)} className="px-4 py-2 bg-white border border-border rounded-lg text-sm">取消</button>
                            <button onClick={() => saveEdit(item)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">儲存</button>
                          </div>
                        </div>
                      ) : isRem ? (
                        <div className="space-y-3 mt-3">
                          <div className="text-sm font-medium text-foreground mb-1">設定提前提醒</div>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="date" value={remDate} onChange={e => setRemDate(e.target.value)} className="w-full bg-white border border-border p-2 rounded-lg outline-none text-sm" />
                            <input type="time" value={remTime} onChange={e => setRemTime(e.target.value)} className="w-full bg-white border border-border p-2 rounded-lg outline-none text-sm" />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setRemId(null)} className="px-4 py-2 bg-white border border-border rounded-lg text-sm">取消</button>
                            <button onClick={() => saveRem(item)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">確認設定</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.type === 'sub' ? (
                            <button onClick={(e) => { 
                              e.stopPropagation(); 
                              window.dispatchEvent(new CustomEvent('open-edit-sub', { detail: item.subId }));
                            }} className="text-[13px] bg-white border border-border px-4 py-2 rounded-lg font-medium hover:bg-muted text-foreground shadow-sm">
                              記錄異動
                            </button>
                          ) : (
                            <>
                              <button onClick={() => startEdit(item)} className="text-[13px] bg-white border border-border px-4 py-2 rounded-lg font-medium hover:bg-muted text-foreground shadow-sm">
                                修改內容
                              </button>
                              <button onClick={() => startRem(item)} className="text-[13px] bg-white border border-border px-4 py-2 rounded-lg font-medium hover:bg-muted text-foreground shadow-sm">
                                設定提醒
                              </button>
                              <button onClick={() => handleComplete(item)} className="text-[13px] bg-primary text-white border border-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 shadow-sm flex items-center gap-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                                設定已完成
                              </button>
                              {!deleteConfirmId || deleteConfirmId !== item.uid ? (
                                <button onClick={() => setDeleteConfirmId(item.uid)} className="text-[13px] bg-white border border-destructive/20 text-destructive px-3 py-2 rounded-lg font-medium hover:bg-destructive/5 shadow-sm ml-auto flex items-center justify-center">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                              ) : (
                                <div className="ml-auto flex items-center gap-2 bg-destructive/5 px-3 py-1.5 rounded-lg border border-destructive/10">
                                  <span className="text-[12px] text-destructive font-medium">確定刪除？</span>
                                  <button onClick={() => deleteItem(item)} className="text-[12px] bg-destructive text-white px-2.5 py-1 rounded-md">確定</button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="text-[12px] bg-white border border-border text-foreground px-2.5 py-1 rounded-md">取消</button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
