import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { initialProducts } from '../data';

export default function AddProductView({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [type, setType] = useState('零售');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    const title = (document.getElementById('p_name') as HTMLInputElement)?.value || '新產品';
    const priceStr = (document.getElementById('p_price') as HTMLInputElement)?.value;
    const price = priceStr ? Number(priceStr) : 0;
    const desc = (document.getElementById('p_desc') as HTMLTextAreaElement)?.value || '';

    const newId = Math.max(...initialProducts.map((p: any) => p.id)) + 1;
    initialProducts.unshift({
      id: newId,
      name: title,
      types: [type],
      price: price
    });
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
            <div className="text-[17px] font-semibold text-foreground">新增產品</div>
            <button onClick={handleSave} className="text-[15px] text-primary font-medium px-2 py-1">儲存</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20 scroll-smooth">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">產品名稱 <span className="text-destructive">*</span></label>
              <input id="p_name" type="text" placeholder="例如：保健食品" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">產品類型</label>
              <div className="grid grid-cols-3 gap-2">
                {['零售', '組合', '配件'].map(t => (
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
              <label className="text-[13px] font-medium text-muted-foreground ml-1">預設價格</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-muted-foreground">$</span>
                <input id="p_price" type="number" placeholder="0" className="w-full bg-white border border-border rounded-xl pl-8 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">產品說明</label>
              <textarea id="p_desc" placeholder="選填" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[80px] resize-none"></textarea>
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
