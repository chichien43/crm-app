import React, { useState, useEffect } from 'react';
import { initialCustomers, initialSubscriptions, initialProducts, initialReminders, TODAY } from '../data';
import { createPortal } from 'react-dom';
import CustomerSelect from './CustomerSelect';

export default function AddSubView({ onClose, editId, defaultCustomerId }: { onClose: () => void, editId?: number | null, defaultCustomerId?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const [subId, setSubId] = useState(editId || '');
  const [type, setType] = useState('變更數量');
  const [val, setVal] = useState('');
  const [note, setNote] = useState('');
  const [remType, setRemType] = useState('下次出貨前 3 天');
  const [remText, setRemText] = useState('確認異動後的出貨是否正確');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const isEdit = !!editId;

  const handleSave = () => {
    if (isEdit) {
      const s = initialSubscriptions.find(x => x.id === Number(subId));
      if (s) {
        s.h.unshift({ d: TODAY, x: type + (val ? '：' + val : '') + (note ? ' (' + note + ')' : '') });
        if (remType !== '不提醒') {
          initialReminders.unshift({
            id: Date.now(),
            cid: s.c,
            d: TODAY, // mock date logic for simplicity
            t: '09:00',
            n: remText || '跟進享回購',
            k: '享回購'
          });
        }
        window.dispatchEvent(new Event('data-updated'));
      }
    } else {
      const cid = (document.getElementById('sub_c') as HTMLInputElement)?.value || '';
      if (!cid) {
        setError('請選擇客戶');
        return;
      }
      setError('');
      const date = (document.getElementById('sub_d') as HTMLInputElement)?.value || TODAY;

      initialSubscriptions.unshift({
        id: Date.now(),
        c: Number(cid),
        p: 1, // mock product id
        q: 1,
        cy: '1 個月',
        day: parseInt(date.slice(-2)) || 15,
        st: '進行中',
        m: '100%',
        diff: '0',
        ok: true,
        h: []
      });
      window.dispatchEvent(new Event('data-updated'));
    }
    handleClose();
  };

  const content = (
    <div className="absolute inset-x-0 top-[70px] bottom-0 z-[50] overflow-hidden flex flex-col justify-end pointer-events-none">
      <div 
        className={`absolute inset-0 bg-black/40 pointer-events-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      ></div>
      
      <div 
        className={`w-full bg-white rounded-t-[24px] pointer-events-auto flex flex-col h-full transition-transform duration-300 ease-out shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="p-4 flex flex-col shrink-0 relative bg-white rounded-t-[24px]">
          <div className="w-10 h-1 rounded-full mx-auto mb-4 bg-gray-200"></div>
          <div className="flex items-center justify-between mb-2">
            <button onClick={handleClose} className="text-primary w-8 h-8 flex items-center justify-start">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="text-[19px] font-bold text-foreground">{isEdit ? '享回購異動' : '新增享回購排程'}</div>
            <button onClick={handleClose} className="text-primary w-8 h-8 flex items-center justify-end">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-24 scroll-smooth">
          {error && (
            <div className="bg-destructive/10 text-destructive text-[13px] p-3 rounded-xl flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          <div className="space-y-6">
            
            {isEdit ? (
              <>
                <div className="space-y-2">
                  <label className="text-[14px] text-muted-foreground">客戶的享回購</label>
                  <div className="relative">
                    <select value={subId} onChange={e => setSubId(e.target.value)} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-primary transition-all appearance-none text-foreground shadow-sm">
                      <option value="">請選擇享回購</option>
                      {initialSubscriptions.map(s => {
                        const c = initialCustomers.find(x => x.id === s.c);
                        const p = initialProducts.find(x => x.id === s.p);
                        return <option key={s.id} value={s.id}>{c?.name} ・ {p?.name} × {s.q} ({s.st})</option>;
                      })}
                    </select>
                    <div className="absolute right-4 top-[14px] text-foreground pointer-events-none">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] text-muted-foreground">異動類型</label>
                  <div className="flex flex-wrap gap-2">
                    {['變更數量', '更換品項', '改出貨日', '暫停', '恢復', '取消'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-4 py-2 rounded-full text-[14px] transition-colors border ${type === t ? 'bg-primary border-primary text-white' : 'bg-white border-border text-muted-foreground'}`}
                      >
                        {t}
                      </button>
                    ))}
                    <button className="w-10 h-[38px] rounded-full border border-primary text-primary flex items-center justify-center border-dashed">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] text-muted-foreground">改成</label>
                  <input value={val} onChange={e => setVal(e.target.value)} type="text" placeholder="例如：2 盒、暫停到 12 月" className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary transition-all shadow-sm" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[14px] text-muted-foreground">原因 / 備註</label>
                  <input value={note} onChange={e => setNote(e.target.value)} type="text" placeholder="例如：客戶說吃不完" className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary transition-all shadow-sm" />
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-4 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    提醒我
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['不提醒', '明天', '3 天後', '1 週後', '下次出貨前 3 天', '自訂'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setRemType(t)}
                        className={`px-3 py-1.5 rounded-full text-[13px] transition-colors border ${remType === t ? 'bg-primary border-primary text-white' : 'bg-white border-primary/20 text-foreground shadow-sm'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {remType !== '不提醒' && (
                    <input value={remText} onChange={e => setRemText(e.target.value)} type="text" className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary transition-all shadow-sm" />
                  )}
                </div>
                
                <div className="text-[12px] text-muted-foreground px-1 leading-relaxed">
                  系統會記下異動時間和前後差異，月結時自動列出，不必再抄到記事本。
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground ml-1">客戶 <span className="text-destructive">*</span></label>
                  <CustomerSelect id="sub_c" defaultValue={defaultCustomerId} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground ml-1">產品 <span className="text-destructive">*</span></label>
                  <input id="sub_p" type="text" placeholder="例如：保健食品" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground ml-1">下次扣款日 <span className="text-destructive">*</span></label>
                  <input id="sub_d" type="date" defaultValue={TODAY} className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-border absolute bottom-0 left-0 right-0">
          <button onClick={handleSave} className="w-full bg-primary text-white rounded-xl py-3.5 text-[16px] font-bold shadow-md hover:bg-primary/90 transition-colors">
            儲存
          </button>
        </div>
      </div>
    </div>
  );
  
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return content;
  
  return createPortal(content, modalRoot);
}
