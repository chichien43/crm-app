import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AddMenuView({ onClose, context }: { onClose: () => void, context?: 'customer' | 'global' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const allItems = [
    { id: 'svc', title: '紀錄服務', subtitle: '為客戶設定提醒', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    { id: 'newc', title: '新增客戶', subtitle: '從通訊錄匯入', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg> },
    { id: 'sch', title: '新增行程', subtitle: '會議、活動', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id: 'buy', title: '新增消費', subtitle: '新購 / 特惠活動 / 享回購', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg> },
    { id: 'sub', title: '享回購排程', subtitle: '提醒 + 設定', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg> },
    { id: 'newp', title: '新增產品', subtitle: '新品、活動、享回購', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
  ];

  const items = context === 'customer' 
    ? allItems.filter(x => ['svc', 'sch', 'buy', 'sub'].includes(x.id))
    : allItems;

  const content = (
    <div className="absolute inset-x-0 top-0 bottom-[74px] z-[40] overflow-hidden flex flex-col justify-end pointer-events-none">
      <div 
        className={`absolute inset-0 bg-black/40 pointer-events-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      ></div>
      
      <div 
        className={`w-full bg-gray-50 rounded-t-[24px] pointer-events-auto flex flex-col transition-transform duration-300 ease-out shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="p-4 flex flex-col shrink-0 relative bg-white rounded-t-[24px]">
          <div className="w-12 h-1.5 rounded-full mx-auto mb-4 bg-muted"></div>
          <div className="flex items-center justify-center relative">
            <div className="text-[17px] font-semibold text-foreground">新增</div>
            <button onClick={handleClose} className="absolute right-0 text-muted-foreground p-1 bg-muted/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        
        <div className="p-5 pb-8 bg-gray-50 grid grid-cols-2 gap-3">
          {items.map(x => (
            <button key={x.id} onClick={() => {
              window.dispatchEvent(new CustomEvent('open-plus', { detail: x.id }));
              handleClose();
            }} className="bg-white p-4 text-left rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all active:scale-95">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                {x.icon}
              </div>
              <div className="font-semibold text-foreground text-[15px]">{x.title}</div>
              <div className="text-[12px] text-muted-foreground mt-1">{x.subtitle}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return content;
  
  return createPortal(content, modalRoot);
}
