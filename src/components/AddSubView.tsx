import React, { useState, useEffect } from 'react';
import { initialCustomers, initialSubscriptions, initialProducts, initialReminders, TODAY, saveAll } from '../data';
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

  // New Subscription Form State
  const [newProdName, setNewProdName] = useState('');
  const [newDate, setNewDate] = useState(TODAY);
  const [newQuantity, setNewQuantity] = useState(1);

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
      const selectedId = Number(subId);
      if (!selectedId) {
        setError('請選擇客戶的享回購');
        return;
      }
      const s = initialSubscriptions.find(x => x.id === selectedId);
      if (!s) {
        setError('找不到該筆享回購');
        return;
      }

      if (type === '更換品項') {
        const pName = val.trim();
        if (!pName) {
          setError('請輸入更換的產品名稱');
          return;
        }
        let targetProd = initialProducts.find(p => p.name.trim().toLowerCase() === pName.toLowerCase() || String(p.id) === pName);
        if (!targetProd) {
          targetProd = {
            id: Date.now(),
            name: pName,
            price: 1000,
            pv: 30,
            tags: ['享回購']
          };
          initialProducts.push(targetProd);
        }
        const oldProd = initialProducts.find(p => p.id === s.p);
        const oldName = oldProd ? oldProd.name : '原品項';
        s.p = targetProd.id;
        s.st = '進行中';
        s.m = '變更';
        s.diff = `更換品項：${oldName} → ${targetProd.name}`;
        s.h.unshift({
          d: TODAY,
          x: `更換品項：${oldName} → ${targetProd.name}${note ? `（${note}）` : ''}`
        });
      } else if (type === '改出貨日') {
        const numMatch = val.match(/\d+/);
        const newDay = numMatch ? parseInt(numMatch[0]) : s.day;
        const oldDay = s.day;
        s.day = newDay;
        s.st = '進行中';
        s.m = '變更';
        s.diff = `出貨日改為每月 ${newDay} 日`;
        s.h.unshift({
          d: TODAY,
          x: `改出貨日：每月 ${oldDay} 日 → ${newDay} 日${note ? `（${note}）` : ''}`
        });
      } else if (type === '變更數量') {
        const numMatch = val.match(/\d+/);
        const newQ = numMatch ? parseInt(numMatch[0]) : s.q;
        const oldQ = s.q;
        s.q = newQ;
        s.st = '進行中';
        s.m = '變更';
        s.diff = `數量 ${oldQ} 盒 → ${newQ} 盒`;
        s.h.unshift({
          d: TODAY,
          x: `變更數量：${oldQ} 盒 → ${newQ} 盒${note ? `（${note}）` : ''}`
        });
      } else if (type === '暫停') {
        s.st = '暫停';
        s.m = '暫停';
        s.diff = val ? `暫停：${val}` : '暫停訂閱';
        s.h.unshift({
          d: TODAY,
          x: `暫停訂閱${val ? `（${val}）` : ''}${note ? `（${note}）` : ''}`
        });
      } else if (type === '取消') {
        s.st = '取消';
        s.m = '取消';
        s.diff = '取消訂閱';
        s.h.unshift({
          d: TODAY,
          x: `取消訂閱${val ? `（${val}）` : ''}${note ? `（${note}）` : ''}`
        });
      } else if (type === '恢復') {
        s.st = '進行中';
        s.m = '恢復';
        s.diff = '恢復訂閱';
        s.h.unshift({
          d: TODAY,
          x: `恢復訂閱${note ? `（${note}）` : ''}`
        });
      } else {
        s.h.unshift({ d: TODAY, x: type + (val ? '：' + val : '') + (note ? ' (' + note + ')' : '') });
      }

      if (remType !== '不提醒') {
        initialReminders.unshift({
          id: Date.now(),
          cid: s.c,
          d: TODAY,
          t: '09:00',
          n: remText || '跟進享回購',
          k: '享回購'
        });
      }
      saveAll();
      window.dispatchEvent(new Event('data-updated'));
    } else {
      const cid = (document.getElementById('sub_c') as HTMLInputElement)?.value || '';
      if (!cid) {
        setError('請選擇客戶');
        return;
      }
      const prodInput = newProdName.trim() || (document.getElementById('sub_p') as HTMLInputElement)?.value?.trim() || '';
      if (!prodInput) {
        setError('請輸入產品名稱');
        return;
      }
      setError('');
      const date = newDate || (document.getElementById('sub_d') as HTMLInputElement)?.value || TODAY;

      let product = initialProducts.find(p => p.name.trim().toLowerCase() === prodInput.toLowerCase() || String(p.id) === prodInput);
      if (!product) {
        product = {
          id: Date.now(),
          name: prodInput,
          price: 1000,
          pv: 30,
          tags: ['享回購']
        };
        initialProducts.push(product);
      }

      const deliveryDay = parseInt(date.slice(-2)) || 15;
      const qNum = Number(newQuantity) || 1;

      initialSubscriptions.unshift({
        id: Date.now(),
        c: Number(cid),
        p: product.id,
        q: qNum,
        cy: '每月',
        day: deliveryDay,
        st: '進行中',
        m: '新加入',
        diff: `新加入・每月 ${qNum} 盒`,
        ok: true,
        h: [{ d: date || TODAY, x: `新加入享回購：${product.name}` }]
      });
      saveAll();
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
                        onClick={() => {
                          setType(t);
                          setVal('');
                        }}
                        className={`px-4 py-2 rounded-full text-[14px] transition-colors border ${type === t ? 'bg-primary border-primary text-white' : 'bg-white border-border text-muted-foreground'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] text-muted-foreground">
                    {type === '更換品項' ? '更換為品項' : type === '改出貨日' ? '改為每月幾號出貨' : type === '變更數量' ? '改為數量' : type === '暫停' ? '暫停期間 / 說明' : type === '取消' ? '取消原因（選填）' : '改成'}
                  </label>
                  <input 
                    value={val} 
                    onChange={e => setVal(e.target.value)} 
                    type="text" 
                    list={type === '更換品項' ? 'edit-product-list' : undefined}
                    placeholder={type === '更換品項' ? '例如：益生菌 30包、11223' : type === '改出貨日' ? '例如：20（每月 20 日）' : type === '變更數量' ? '例如：2 盒' : type === '暫停' ? '例如：暫停 1 個月、暫停到 12 月' : type === '取消' ? '例如：暫不需要、吃不完' : '例如：2 盒'} 
                    className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary transition-all shadow-sm" 
                  />
                  {type === '更換品項' && (
                    <datalist id="edit-product-list">
                      {initialProducts.map(p => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[14px] text-muted-foreground">備註 / 原因</label>
                  <input value={note} onChange={e => setNote(e.target.value)} type="text" placeholder="例如：客戶說吃不完、由專員協助更新" className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary transition-all shadow-sm" />
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
                  <input 
                    id="sub_p" 
                    type="text" 
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    list="new-prod-options"
                    placeholder="輸入或選擇產品，例如：益生菌 30包、11223" 
                    className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                  <datalist id="new-prod-options">
                    {initialProducts.map(p => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground ml-1">數量</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newQuantity}
                    onChange={e => setNewQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground ml-1">下次扣款 / 出貨日 <span className="text-destructive">*</span></label>
                  <input 
                    id="sub_d" 
                    type="date" 
                    value={newDate} 
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  />
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
