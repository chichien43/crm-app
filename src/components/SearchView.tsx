import React, { useState, useEffect, useRef } from 'react';
import { initialCustomers } from '../data';
import { createPortal } from 'react-dom';

export default function SearchView({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const results = q ? initialCustomers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)) : [];

  const content = (
    <div className="absolute inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-sm">
      <div className={`transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'} flex-1 flex flex-col`}>
        <div className="px-4 pt-12 pb-4 flex items-center gap-3 border-b border-border bg-white shadow-sm">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-3 text-muted-foreground" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              ref={inputRef}
              type="text" 
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="搜尋客戶姓名或電話..." 
              className="w-full bg-muted border-none rounded-xl pl-10 pr-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            {q && (
              <button onClick={() => setQ('')} className="absolute right-3 top-3 text-muted-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
          <button onClick={handleClose} className="text-primary font-medium text-[15px] whitespace-nowrap">取消</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {q && results.length === 0 && (
            <div className="text-center text-muted-foreground mt-10">找不到符合的客戶</div>
          )}
          {q && results.length > 0 && (
            <div className="space-y-2">
              {results.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('nav-cust-detail', { detail: c.id }));
                    handleClose();
                  }}
                  className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-border cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">{c.ini}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.phone}</div>
                  </div>
                  <div className="text-muted-foreground">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!q && (
            <div className="text-center text-muted-foreground mt-10 text-[13px]">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              輸入關鍵字開始搜尋
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return content;
  return createPortal(content, modalRoot);
}
