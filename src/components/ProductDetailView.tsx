import React from 'react';
import { initialProducts, initialPurchases, initialSubscriptions, initialCustomers } from '../data';

interface Props {
  productId: number;
  onBack: () => void;
}

export default function ProductDetailView({ productId, onBack }: Props) {
  const p = initialProducts.find(x => x.id === productId);
  if (!p) return <div>Product not found</div>;

  const purchases = initialPurchases.filter(b => b.p === p.id);
  const buyers = Array.from(new Set(purchases.map(b => b.c)));
  const subs = initialSubscriptions.filter(s => s.p === p.id && s.st === '進行中');

  return (
    <div className="animate-fade-in h-full flex flex-col relative bg-gray-50 overflow-hidden">
      <div className="px-4 pt-10 pb-4 bg-white border-b border-border flex items-center gap-3 shrink-0 shadow-sm z-10">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[19px] font-bold text-foreground truncate">{p.name}</h2>
          <div className="text-[13px] text-muted-foreground flex gap-1.5 mt-0.5">
            {p.types.map(t => (
              <span key={t}>{t}</span>
            ))}
            <span>・ ${p.price}</span>
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-border rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-light text-foreground">{buyers.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1">購買客戶</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-light text-foreground">{purchases.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1">總次數</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-3 text-center shadow-sm">
            <div className="text-2xl font-light text-primary">{subs.length}</div>
            <div className="text-[11px] text-muted-foreground mt-1">享回購中</div>
          </div>
        </div>

        {/* Buyers List */}
        <div>
          <div className="text-[13px] font-medium text-muted-foreground mb-3 px-1">買過的客戶</div>
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            {buyers.map(cid => {
              const c = initialCustomers.find(x => x.id === cid);
              const cPur = purchases.filter(b => b.c === cid);
              const totalQty = cPur.reduce((sum, b) => sum + (b.q || 1), 0);
              const lastPur = cPur.sort((a, b) => a.d > b.d ? -1 : 1)[0];
              if (!c) return null;
              
              return (
                <div key={cid} onClick={() => window.dispatchEvent(new CustomEvent('nav-cust-detail', { detail: cid }))} className="flex items-center p-3 border-b border-border last:border-0 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium shrink-0">{c.ini}</div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="font-medium text-[15px]">{c.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">最近 {lastPur?.d.replace(/-/g, '/')}</div>
                  </div>
                  <div className="text-right text-[13px] text-foreground">
                    {cPur.length} 次 ・ {totalQty} 件
                  </div>
                </div>
              );
            })}
            {buyers.length === 0 && <div className="p-5 text-center text-sm text-muted-foreground">尚無購買記錄</div>}
          </div>
        </div>

        {/* Subs List */}
        {subs.length > 0 && (
          <div>
            <div className="text-[13px] font-medium text-muted-foreground mb-3 px-1">享回購名單</div>
            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
              {subs.map(s => {
                const c = initialCustomers.find(x => x.id === s.c);
                if (!c) return null;
                
                return (
                  <div key={s.id} onClick={() => window.dispatchEvent(new CustomEvent('nav-cust-detail', { detail: s.c }))} className="flex items-center p-3 border-b border-border last:border-0 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-medium shrink-0">{c.ini}</div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="font-medium text-[15px]">{c.name} × {s.q} ・ {s.cy}</div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">每月 {s.day} 日出貨</div>
                    </div>
                    <div className="text-right text-[11px] bg-primary/10 text-primary px-2 py-1 rounded-sm">
                      {s.st}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full mt-4 bg-primary text-white py-3.5 rounded-xl font-medium shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              對這些客戶一次設定提醒
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
