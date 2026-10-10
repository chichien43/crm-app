import React, { useState, useEffect } from 'react';
import { initialCustomers, initialProducts, initialPurchases, TODAY } from '../data';
import { createPortal } from 'react-dom';
import AddProductView from './AddProductView';
import CustomerSelect from './CustomerSelect';

export default function AddBuyView({ onClose, defaultCustomerId, mode = 'add', initialData }: { onClose: () => void, defaultCustomerId?: number, mode?: 'add'|'edit', initialData?: any }) {
  const [isVisible, setIsVisible] = useState(false);
  const [type, setType] = useState(initialData?.v || '新購');
  const [selectedProduct, setSelectedProduct] = useState(initialData?.p ? String(initialData.p) : '');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productKey, setProductKey] = useState(0);

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
    const cid = (document.getElementById('buy_c') as HTMLInputElement)?.value || '';
    if ((!cid && mode === 'add') || !selectedProduct) {
      setError('請選擇客戶與產品');
      return;
    }
    setError('');
    const c = initialCustomers.find((x: any) => x.id === (mode === 'edit' ? initialData.c : Number(cid)));
    const date = (document.getElementById('buy_d') as HTMLInputElement)?.value || TODAY;

    if (mode === 'add') {
      initialPurchases.unshift({
        c: Number(cid),
        p: Number(selectedProduct),
        d: date,
        q: 1,
        v: type
      });
      if (c) c.last = 0; // Reset cold days on purchase
    } else if (mode === 'edit' && initialData) {
      // initialData is the purchase object
      const idx = initialPurchases.indexOf(initialData);
      if (idx !== -1) {
        initialPurchases[idx].p = Number(selectedProduct);
        initialPurchases[idx].d = date;
        initialPurchases[idx].v = type;
      }
    }
    
    window.dispatchEvent(new Event('data-updated'));
    handleClose();
  };

  const confirmDelete = () => {
    const idx = initialPurchases.indexOf(initialData);
    if (idx !== -1) {
      initialPurchases.splice(idx, 1);
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
            <div className="text-[17px] font-semibold text-foreground">{mode === 'edit' ? '修改消費紀錄' : '新增消費'}</div>
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
                  <CustomerSelect id="buy_c" defaultValue={defaultCustomerId} />
                ) : (
                  <div className="w-full bg-muted border border-border rounded-xl px-4 py-3.5 text-[15px] text-muted-foreground cursor-not-allowed">
                    {initialCustomers.find(c => c.id === initialData?.c)?.name || ''}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">日期</label>
                <input id="buy_d" type="date" defaultValue={initialData?.d || TODAY} className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">消費類型</label>
              <div className="grid grid-cols-3 gap-2">
                {['新購', '續約', '享回購'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setType(t)}
                    className={`py-2.5 border rounded-xl text-[14px] font-medium ${type === t ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-muted-foreground hover:bg-gray-50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">產品 <span className="text-destructive">*</span></label>
              <div className="relative">
                <select 
                  id="buy_p" 
                  value={selectedProduct}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setShowAddProduct(true);
                      setProductKey(Date.now()); // force re-render option list later
                    } else {
                      setSelectedProduct(e.target.value);
                    }
                  }}
                  className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none text-foreground"
                >
                  <option value="">請選擇</option>
                  {initialProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="new" className="text-primary font-medium">＋ 新增產品</option>
                </select>
                <div className="absolute right-4 top-4 text-muted-foreground pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">日期 <span className="text-destructive">*</span></label>
              <input id="buy_d" type="date" defaultValue={TODAY} className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
          </div>
        </div>
      </div>
      {showAddProduct && (
        <AddProductView key={productKey} onClose={() => {
          setShowAddProduct(false);
          const latestProduct = initialProducts[0];
          if (latestProduct) {
            setSelectedProduct(latestProduct.id.toString());
          }
        }} />
      )}
    </div>
  );
  
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return content;
  
  return createPortal(content, modalRoot);
}
