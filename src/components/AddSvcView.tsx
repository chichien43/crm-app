import React, { useState, useEffect } from 'react';
import { initialCustomers, TODAY } from '../data';
import { createPortal } from 'react-dom';
import CustomerSelect from './CustomerSelect';

export default function AddSvcView({ onClose, defaultCustomerId, mode = 'add', initialData }: { onClose: () => void, defaultCustomerId?: number, mode?: 'add'|'edit', initialData?: any }) {
  const [isVisible, setIsVisible] = useState(false);
  const [way, setWay] = useState(initialData?.w || '電話');

  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    const cid = (document.getElementById('svc_c') as HTMLInputElement)?.value || '';
    if (!cid && mode === 'add') {
      setError('請選擇客戶');
      return;
    }
    setError('');
    const content = (document.getElementById('svc_x') as HTMLTextAreaElement)?.value || '';
    
    const c = initialCustomers.find((x: any) => x.id === (mode === 'edit' ? initialData.c : Number(cid)));
    if (c) {
      const d = (document.getElementById('svc_d') as HTMLInputElement)?.value || TODAY;
      if (mode === 'add') {
        c.sv.unshift({
          d: d,
          w: way,
          x: content
        });
        c.last = 0;
      } else if (mode === 'edit' && initialData) {
        const svc = c.sv.find((s: any) => s.id === initialData.id);
        if (svc) {
          svc.d = d;
          svc.w = way;
          svc.x = content;
        }
      }
    }
    window.dispatchEvent(new Event('data-updated'));
    handleClose();
  };

  const confirmDelete = () => {
    const c = initialCustomers.find(x => x.id === initialData.c);
    if (c) {
      const idx = c.sv.findIndex((s: any) => s.id === initialData.id);
      if (idx !== -1) c.sv.splice(idx, 1);
      window.dispatchEvent(new Event('data-updated'));
      handleClose();
    }
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
            <div className="text-[17px] font-semibold text-foreground">{mode === 'edit' ? '修改服務紀錄' : '紀錄服務'}</div>
            <button onClick={handleSave} className="text-[15px] text-primary font-medium px-2 py-1">儲存</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20 scroll-smooth">
          {error && (
            <div className="bg-destructive/10 text-destructive text-[13px] p-3 rounded-xl flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          <div className="space-y-4">
            {mode === 'edit' && (
              <div className="flex justify-end mb-2">
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} className="text-[13px] text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg font-medium">刪除紀錄</button>
                ) : (
                  <div className="flex items-center gap-2 bg-destructive/5 px-3 py-1.5 rounded-lg">
                    <span className="text-[12px] text-destructive font-medium">確定刪除？</span>
                    <button onClick={confirmDelete} className="text-[12px] bg-destructive text-white px-2.5 py-1 rounded-md">確定</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="text-[12px] bg-white border border-border text-foreground px-2.5 py-1 rounded-md">取消</button>
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">客戶 {mode === 'add' && <span className="text-destructive">*</span>}</label>
                {mode === 'add' ? (
                  <CustomerSelect id="svc_c" defaultValue={defaultCustomerId} />
                ) : (
                  <div className="w-full bg-muted border border-border rounded-xl px-4 py-3.5 text-[15px] text-muted-foreground cursor-not-allowed">
                    {initialCustomers.find(c => c.id === initialData?.c)?.name || ''}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">日期</label>
                <input id="svc_d" type="date" defaultValue={initialData?.d || TODAY} className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">服務方式</label>
              <div className="grid grid-cols-4 gap-2">
                {['電話', '訊息', '當面', '其他'].map(w => (
                  <button 
                    key={w}
                    onClick={() => setWay(w)}
                    className={`py-2 border rounded-xl text-[13px] font-medium ${way === w ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground hover:bg-gray-50'}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">服務內容</label>
              <textarea id="svc_x" defaultValue={initialData?.x || ''} placeholder="服務重點..." className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[100px] resize-none"></textarea>
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
