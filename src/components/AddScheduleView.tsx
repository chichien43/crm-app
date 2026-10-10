import React, { useState, useEffect } from 'react';
import { initialCustomers, initialSchedules, initialReminders, TODAY } from '../data';
import { createPortal } from 'react-dom';
import CustomerSelect from './CustomerSelect';

export default function AddScheduleView({ onClose, defaultDate, defaultCustomerId }: { onClose: () => void, defaultDate?: string, defaultCustomerId?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [remType, setRemType] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    const title = (document.getElementById('s_title') as HTMLInputElement)?.value || '新行程';
    const date = (document.getElementById('s_date') as HTMLInputElement)?.value || TODAY;
    const time = (document.getElementById('s_time') as HTMLInputElement)?.value || '09:00';
    const cid = (document.getElementById('s_cid') as HTMLInputElement)?.value || '';

    initialSchedules.unshift({
      d: date,
      t: time,
      x: title,
      c: cid ? Number(cid) : undefined
    });

    if (remType) {
      let remDate = date;
      let remTime = time;
      
      if (remType === '15m') {
        const [h, m] = time.split(':').map(Number);
        const dateObj = new Date(2026, 9, parseInt(date.slice(-2)), h, m);
        dateObj.setMinutes(dateObj.getMinutes() - 15);
        remDate = `2026-10-${dateObj.getDate().toString().padStart(2, '0')}`;
        remTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
      } else if (remType === '1h') {
        const [h, m] = time.split(':').map(Number);
        const dateObj = new Date(2026, 9, parseInt(date.slice(-2)), h, m);
        dateObj.setHours(dateObj.getHours() - 1);
        remDate = `2026-10-${dateObj.getDate().toString().padStart(2, '0')}`;
        remTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
      } else if (remType === '1d') {
        const [h, m] = time.split(':').map(Number);
        const dateObj = new Date(2026, 9, parseInt(date.slice(-2)), h, m);
        dateObj.setDate(dateObj.getDate() - 1);
        remDate = `2026-10-${dateObj.getDate().toString().padStart(2, '0')}`;
        remTime = time;
      } else if (remType === 'custom') {
        const cVal = (document.getElementById('s_rem_custom') as HTMLInputElement)?.value;
        if (cVal) {
          remDate = cVal.substring(0, 10);
          remTime = cVal.substring(11, 16);
        }
      }

      initialReminders.unshift({
        id: Date.now(),
        cid: cid ? Number(cid) : 1,
        d: remDate,
        t: remTime,
        n: `即將到來：${title}`,
        k: '行程'
      });
    }

    window.dispatchEvent(new Event('data-updated'));
    handleClose();
  };

  const content = (
    <div className="absolute inset-x-0 top-0 bottom-[74px] z-[40] overflow-hidden flex flex-col justify-end pointer-events-none">
      <div 
        className={`absolute inset-0 bg-black/40 pointer-events-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      ></div>
      
      <div 
        className={`w-full bg-background rounded-t-[24px] pointer-events-auto flex flex-col max-h-full transition-transform duration-300 ease-out shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="p-4 flex flex-col shrink-0 border-b border-border relative bg-white rounded-t-[24px]">
          <div className="w-12 h-1.5 rounded-full mx-auto mb-4 bg-muted"></div>
          <div className="flex items-center justify-between">
            <button onClick={handleClose} className="text-[15px] text-muted-foreground px-2 py-1">取消</button>
            <div className="text-[17px] font-semibold text-foreground">新增行程</div>
            <button onClick={handleSave} className="text-[15px] text-primary font-medium px-2 py-1">儲存</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20 scroll-smooth">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">行程名稱 <span className="text-destructive">*</span></label>
              <input id="s_title" type="text" placeholder="例如：拜訪客戶" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">日期 <span className="text-destructive">*</span></label>
                <input id="s_date" type="date" defaultValue={defaultDate || TODAY} className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">時間 <span className="text-destructive">*</span></label>
                <input id="s_time" type="time" defaultValue="09:00" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">關聯客戶 (選填)</label>
              <CustomerSelect id="s_cid" defaultValue={defaultCustomerId} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">提前提醒</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select id="s_rem" value={remType} onChange={e => setRemType(e.target.value)} className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none text-foreground">
                    <option value="">不提醒</option>
                    <option value="15m">15 分鐘前</option>
                    <option value="1h">1 小時前</option>
                    <option value="1d">1 天前</option>
                    <option value="custom">自訂時間</option>
                  </select>
                  <div className="absolute right-4 top-4 text-muted-foreground pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              {remType === 'custom' && (
                <input id="s_rem_custom" type="datetime-local" className="w-full mt-2 bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return content;
  
  return createPortal(content, modalRoot);
}
