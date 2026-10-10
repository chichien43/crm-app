import React, { useState } from 'react';
import { initialCustomers, initialSchedules, initialReminders, initialDone, TODAY } from '../data';

export default function ScheduleDetailView({ uid, onClose }: { uid: string, onClose: () => void }) {
  // uid format: "sch-HH:MM-title-date" or "rem-ID" or "sub-ID"
  const type = uid.split('-')[0];
  const idStr = uid.substring(4);

  let title = '';
  let date = '';
  let time = '';
  let cid: number | null = null;
  let subtitle = '';

  const [isEditing, setIsEditing] = useState(false);
  const [showRemPicker, setShowRemPicker] = useState(false);

  if (type === 'sch') {
    const [t, ...rest] = idStr.split('-');
    // the last item is date
    const d = rest.pop() as string;
    const x = rest.join('-');
    const sch = initialSchedules.find(s => s.t === t && s.x === x && s.d === d);
    if (sch) {
      title = sch.x;
      date = sch.d;
      time = sch.t;
      subtitle = '一般行程';
      cid = sch.c || null;
    }
  } else if (type === 'rem') {
    const rem = initialReminders.find(r => r.id === parseInt(idStr));
    if (rem) {
      title = rem.n;
      date = rem.d;
      time = rem.t;
      cid = rem.cid;
      subtitle = rem.k;
    }
  }

  const c = cid ? initialCustomers.find(cx => cx.id === cid) : null;

  const [editTitle, setEditTitle] = useState(title);
  const [editDate, setEditDate] = useState(date);
  const [editTime, setEditTime] = useState(time);
  const [remDate, setRemDate] = useState(date);
  const [remTime, setRemTime] = useState(time);

  const handleComplete = () => {
    if (type === 'rem') {
      const idx = initialReminders.findIndex(r => r.id === parseInt(idStr));
      if (idx >= 0) {
        const [r] = initialReminders.splice(idx, 1);
        initialDone.unshift({ ...r, d: TODAY, at: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) });
        window.dispatchEvent(new Event('data-updated'));
      }
    } else if (type === 'sch') {
      const idx = initialSchedules.findIndex(s => s.t === time && s.x === title && s.d === date);
      if (idx >= 0) {
        initialSchedules.splice(idx, 1);
        window.dispatchEvent(new Event('data-updated'));
      }
    }
    onClose();
  };

  const handleSaveEdit = () => {
    if (type === 'sch') {
      const idx = initialSchedules.findIndex(s => s.t === time && s.x === title && s.d === date);
      if (idx >= 0) {
        initialSchedules[idx].x = editTitle;
        initialSchedules[idx].d = editDate;
        initialSchedules[idx].t = editTime;
      }
    } else if (type === 'rem') {
      const idx = initialReminders.findIndex(r => r.id === parseInt(idStr));
      if (idx >= 0) {
        initialReminders[idx].n = editTitle;
        initialReminders[idx].d = editDate;
        initialReminders[idx].t = editTime;
      }
    }
    window.dispatchEvent(new Event('data-updated'));
    setIsEditing(false);
  };

  const handleSaveRem = () => {
    initialReminders.unshift({
      id: Date.now(),
      cid: cid || 1,
      d: remDate,
      t: remTime,
      n: `提醒：${editTitle || title}`,
      k: '跟進'
    });
    window.dispatchEvent(new Event('data-updated'));
    setShowRemPicker(false);
  };

  return (
    <div className="absolute inset-0 bg-background z-20 flex flex-col font-sans animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between px-2 pt-12 pb-2 border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <button onClick={onClose} className="p-3 text-muted-foreground hover:bg-muted rounded-full transition-colors active:scale-95">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="font-medium text-[17px] text-foreground">行程明細</div>
        <div className="w-12"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full text-lg font-medium bg-muted p-2 rounded-lg outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full bg-muted p-2 rounded-lg outline-none" />
                <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} className="w-full bg-muted p-2 rounded-lg outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-muted rounded-lg text-sm">取消</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">儲存</button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-[13px] font-medium text-primary mb-1">{subtitle}</div>
              <div className="text-2xl font-bold text-foreground mb-4">{title || '未知行程'}</div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[15px]">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>{date ? date.replace(/-/g, ' / ') : TODAY} {time}</div>
                </div>
                {c && (
                  <div className="flex items-center gap-3 text-[15px]">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>{c.name}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setIsEditing(true)} className="py-3.5 bg-white border border-border rounded-xl font-medium text-[15px] hover:bg-muted active:scale-[0.98] transition-all">
            修改內容
          </button>
          <button onClick={() => setShowRemPicker(true)} className="py-3.5 bg-white border border-border rounded-xl font-medium text-[15px] hover:bg-muted active:scale-[0.98] transition-all">
            設定提醒
          </button>
        </div>

        <button onClick={handleComplete} className="w-full py-4 bg-primary text-white rounded-xl font-medium text-[16px] shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
          設定已完成
        </button>

        {showRemPicker && (
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-xl animate-fade-in">
            <h3 className="font-medium text-sm mb-3">設定提前提醒</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input type="date" value={remDate} onChange={e => setRemDate(e.target.value)} className="w-full bg-white border border-border p-2 rounded-lg text-[15px] outline-none" />
              <input type="time" value={remTime} onChange={e => setRemTime(e.target.value)} className="w-full bg-white border border-border p-2 rounded-lg text-[15px] outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowRemPicker(false)} className="flex-1 py-2 bg-white border border-border rounded-lg text-sm">取消</button>
              <button onClick={handleSaveRem} className="flex-1 py-2 bg-primary text-white rounded-lg text-sm">確認設定</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
