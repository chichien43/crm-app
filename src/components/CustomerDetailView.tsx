import React, { useState } from 'react';
import { initialCustomers, initialProducts, initialSubscriptions, initialPurchases, initialReminders, TODAY } from '../data';
import { Customer } from '../types';
import AddCustomerView from './AddCustomerView';
import AddSvcView from './AddSvcView';
import AddBuyView from './AddBuyView';

interface Props {
  customerId: number;
  onBack: () => void;
  onOpenProduct: (id: number) => void;
}

export default function CustomerDetailView({ customerId, onBack, onOpenProduct }: Props) {
  const [tab, setTab] = useState<'tl' | 'pd' | 'sb' | 'ev' | 'if'>('tl');
  const [showPw, setShowPw] = useState(false);
  const [editSection, setEditSection] = useState<'basic' | 'member' | 'needs' | 'leads' | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editSvcData, setEditSvcData] = useState<any>(null);
  const [editBuyData, setEditBuyData] = useState<any>(null);
  const [timelineTagFilter, setTimelineTagFilter] = useState<string | null>(null);

  const c = initialCustomers.find(x => x.id === Number(customerId));
  if (!c) return <div>Customer not found: {customerId}</div>;

  const subs = initialSubscriptions.filter(s => s.c === c.id && s.st !== '取消');
  const nextRem = initialReminders.filter(r => r.cid === c.id).sort((a, b) => (a.d + a.t) > (b.d + b.t) ? 1 : -1)[0];
  const allSubs = initialSubscriptions.filter(s => s.c === c.id);
  const events = initialPurchases.filter(b => b.c === c.id && b.v === '活動');
  const products = initialPurchases.filter(b => b.c === c.id && b.v !== '活動');

  const customerPurchaseTags = Array.from(new Set(products.flatMap(b => b.tags || [])));

  // Timeline items
  const timelineItems = [
    ...c.sv.map(s => ({ ref: s, type: 'svc', d: s.d, k: '服務', col: 'accent', i: 'edit', tags: [] as string[], x: <><span className="text-muted-foreground">[{s.w}]</span> {s.x}</> })),
    ...events.map(b => ({ ref: b, type: 'event', d: b.d, k: '活動', col: 'accent', i: 'flag', tags: b.tags || [], x: initialProducts.find(p => p.id === b.p)?.name })),
    ...products.map(b => ({ 
      ref: b, type: 'buy', d: b.d, k: '購買', col: 'primary', i: 'cart', 
      tags: b.tags || [],
      x: (
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium">{initialProducts.find(p => p.id === b.p)?.name} × {b.q}</span>
            {b.price !== undefined && <span className="text-[12px] text-muted-foreground font-medium">NT${b.price.toLocaleString()}</span>}
            {b.v === '享回購' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">享回購</span>}
            {b.v === '特惠活動' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">特惠活動</span>}
          </div>
          {b.tags && b.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-1">
              {b.tags.map(t => (
                <span 
                  key={t} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimelineTagFilter(timelineTagFilter === t ? null : t);
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${timelineTagFilter === t ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    })),
    ...allSubs.flatMap(s => s.h.map(h => ({ ref: null, type: 'sub', d: h.d, k: '享回購異動', col: 'primary', i: 'repeat', tags: [] as string[], x: `${initialProducts.find(p => p.id === s.p)?.name}：${h.x}` })))
  ].sort((a, b) => a.d < b.d ? 1 : -1);

  const displayedTimeline = timelineTagFilter 
    ? timelineItems.filter(item => item.type === 'buy' && (item as any).tags?.includes(timelineTagFilter))
    : timelineItems;

  // Products grouping
  const prodGroups = products.reduce((acc, b) => {
    if (!acc[b.p]) acc[b.p] = { n: 0, last: '', v: new Set<string>() };
    acc[b.p].n++;
    acc[b.p].v.add(b.v);
    if (b.d > acc[b.p].last) acc[b.p].last = b.d;
    return acc;
  }, {} as Record<number, { n: number; last: string; v: Set<string> }>);

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex py-3 border-b border-border text-sm items-center">
      <div className="w-24 text-muted-foreground shrink-0">{label}</div>
      <div className="flex-1 min-w-0">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );

  return (
    <div className="animate-fade-in h-full overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-3 pt-7 pb-3 flex items-center gap-1">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="flex-1 min-w-0 px-1">
          <div className="text-[19px] font-semibold truncate">{c.name}</div>
        </div>
        <button onClick={() => setEditSection('basic')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-primary">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        </button>
      </div>

      {/* Profile Card */}
      <div className="px-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xl shrink-0">{c.ini}</div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-1 flex-wrap">
                {c.tags.map(t => (
                  <span 
                    key={t} 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('filter-tag', { detail: t }));
                      onBack();
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-foreground cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {t}
                  </span>
                ))}
                <button 
                  onClick={() => setIsAddingTag(true)} 
                  className="text-[10px] px-1.5 py-0.5 rounded-sm border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  ＋ 標籤
                </button>
              </div>
              
              {isAddingTag && (
                <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  <input
                    autoFocus
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="輸入新標籤..."
                    className="text-xs px-2 py-1 border border-border rounded-md outline-none focus:border-primary w-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (newTag.trim() && !c.tags.includes(newTag.trim())) {
                          c.tags.push(newTag.trim());
                          window.dispatchEvent(new Event('data-updated'));
                        }
                        setNewTag('');
                        setIsAddingTag(false);
                      } else if (e.key === 'Escape') {
                        setIsAddingTag(false);
                        setNewTag('');
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (newTag.trim() && !c.tags.includes(newTag.trim())) {
                        c.tags.push(newTag.trim());
                        window.dispatchEvent(new Event('data-updated'));
                      }
                      setNewTag('');
                      setIsAddingTag(false);
                    }}
                    className="text-[10px] bg-primary text-white px-2 py-1 rounded-md"
                  >
                    確定
                  </button>
                  <button onClick={() => { setIsAddingTag(false); setNewTag(''); }} className="text-[10px] text-muted-foreground px-1">取消</button>
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-1.5">
                {c.phone || '—'} {c.mno ? ' ・ ' + c.mno : ''}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="rounded-lg bg-muted p-2.5">
              <div className="text-xs text-muted-foreground">上次服務</div>
              <div className={`text-sm ${c.last && c.last >= 30 ? 'text-destructive' : ''}`}>
                {c.last === null ? '尚未服務' : c.last === 0 ? '今天' : `${c.last} 天前`}
              </div>
            </div>
            <div className="rounded-lg bg-muted p-2.5">
              <div className="text-xs text-muted-foreground">下次提醒</div>
              <div className={`text-sm ${nextRem && nextRem.d < TODAY ? 'text-destructive' : ''}`}>
                {nextRem ? `${nextRem.d.slice(5).replace('-','/')} ${nextRem.t}` : '未設定'}
              </div>
              {nextRem && <div className="text-[11px] text-muted-foreground truncate mt-0.5">{nextRem.n}</div>}
            </div>
          </div>

          {c.also && (
            <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              也有 {c.also} 在服務
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mt-4 border-t border-border pt-4">
            <ActionBtn icon={<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>} label="撥打" />
            <ActionBtn icon={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>} label="LINE" />
            <ActionBtn icon={<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>} label="紀錄" primary onClick={() => window.dispatchEvent(new CustomEvent('open-plus', { detail: 'svc' }))} />
            <ActionBtn icon={<><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></>} label="購買" onClick={() => window.dispatchEvent(new CustomEvent('open-plus', { detail: 'buy' }))} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 flex gap-1 border-b border-border">
        {[
          { id: 'tl', label: '時間軸' },
          { id: 'pd', label: '產品' },
          { id: 'sb', label: '享回購' },
          { id: 'ev', label: '活動' },
          { id: 'if', label: '資料' },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id as any)}
            className={`flex-1 pb-2 text-sm transition-colors ${tab === t.id ? 'font-medium border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4 animate-fade-in">
        
        {tab === 'tl' && (
          <div>
            {customerPurchaseTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 no-scrollbar">
                <span className="text-[12px] text-muted-foreground shrink-0 font-medium mr-0.5">標籤:</span>
                <button 
                  onClick={() => setTimelineTagFilter(null)}
                  className={`text-[12px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-colors ${
                    timelineTagFilter === null ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  全部
                </button>
                {customerPurchaseTags.map(t => (
                  <button 
                    key={t}
                    onClick={() => setTimelineTagFilter(timelineTagFilter === t ? null : t)}
                    className={`text-[12px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-colors ${
                      timelineTagFilter === t ? 'bg-primary text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}

            {displayedTimeline.length > 0 ? (
              <div className="relative">
                {displayedTimeline.map((item, i) => {
                  const isClickable = (item.type === 'svc' || item.type === 'buy') && item.ref;
                  return (
                    <div 
                      key={i} 
                      className={`flex gap-3 relative pb-5 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      onClick={() => {
                        if (isClickable) {
                          if (item.type === 'svc') setEditSvcData(item.ref);
                          if (item.type === 'buy') setEditBuyData(item.ref);
                        }
                      }}
                    >
                      {i < displayedTimeline.length - 1 && <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border"></div>}
                      <div className={`w-7 h-7 rounded-full bg-${item.col}/10 text-${item.col} flex items-center justify-center shrink-0 z-10`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {item.i === 'edit' && <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></>}
                          {item.i === 'flag' && <path d="M4 22V4s1-1 4-1 5 2 8 2 4-1 4-1v11s-1 1-4 1-5-2-8-2-4 1-4 1"/>}
                          {item.i === 'cart' && <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></>}
                          {item.i === 'repeat' && <><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></>}
                        </svg>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="text-[11px] text-muted-foreground flex justify-between">
                          <span>{item.d.replace(/-/g, '/')} ・ {item.k}</span>
                          {isClickable && <span className="text-primary text-[10px]">可修改</span>}
                        </div>
                        <div className="text-sm mt-0.5 text-foreground">{item.x}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="text-center text-sm text-muted-foreground py-6">還沒有符合的紀錄</div>}
          </div>
        )}

        {tab === 'pd' && (
          Object.keys(prodGroups).length > 0 ? (
            Object.entries(prodGroups).map(([pidStr, x]) => {
              const pid = Number(pidStr);
              return (
                <button key={pid} onClick={() => onOpenProduct(pid)} className="w-full flex items-center gap-3 py-3 border-b border-border text-left">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{initialProducts.find(p => p.id === pid)?.name}</div>
                    <div className="text-[11px] text-muted-foreground">最近 {x.last.replace(/-/g, '/')} ・ {Array.from(x.v).join('、')}</div>
                  </div>
                  <div className="text-sm">{x.n} 次</div>
                </button>
              )
            })
          ) : <div className="text-center text-sm text-muted-foreground py-6">尚未購買</div>
        )}

        {tab === 'sb' && (
          allSubs.length > 0 ? (
            allSubs.map(s => (
              <div key={s.id} className="bg-card border border-border p-4 rounded-xl mb-3 shadow-sm">
                <div className="flex items-center">
                  <div className="font-medium text-sm">{initialProducts.find(p => p.id === s.p)?.name} × {s.q}</div>
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${s.st === '進行中' ? 'bg-primary/10 text-primary' : s.st === '暫停' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                    {s.st}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{s.cy} ・ 每月 {s.day} 日出貨</div>
                
                <div className="text-[11px] font-semibold text-muted-foreground mt-4 mb-1 uppercase tracking-wider">異動紀錄</div>
                {s.h.map((h, i) => (
                  <div key={i} className="text-xs py-1 flex gap-2">
                    <span className="text-muted-foreground w-12 shrink-0">{h.d.slice(5).replace('-','/')}</span>
                    <span>{h.x}</span>
                  </div>
                ))}
                
                <button onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-edit-sub', { detail: s.id }));
                }} className="w-full py-2 mt-3 bg-muted text-foreground border border-border rounded-lg text-[13px] font-medium hover:bg-gray-100 transition-colors">
                  記錄異動 / 設定提醒
                </button>
              </div>
            ))
          ) : <div className="text-center text-sm text-muted-foreground py-6">沒有享回購</div>
        )}

        {tab === 'ev' && (
          events.length > 0 ? (
            events.map((b, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-border">
                <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 22V4s1-1 4-1 5 2 8 2 4-1 4-1v11s-1 1-4 1-5-2-8-2-4 1-4 1"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{initialProducts.find(p => p.id === b.p)?.name}</div>
                  <div className="text-xs text-muted-foreground">{b.d.replace(/-/g, '/')}</div>
                </div>
                <div className="text-xs" style={{ color: b.d > TODAY ? 'var(--accent)' : 'var(--primary)' }}>
                  {b.d > TODAY ? '已報名' : '已參加'}
                </div>
              </div>
            ))
          ) : <div className="text-center text-sm text-muted-foreground py-6">尚未參加活動</div>
        )}

        {tab === 'if' && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1 mt-2 uppercase tracking-wider flex items-center">
              基本資料
              <button className="ml-auto text-primary capitalize font-normal text-[11px] tracking-normal flex items-center gap-1" onClick={() => setEditSection('basic')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                編輯
              </button>
            </div>
            <InfoRow label="姓名" value={c.name} />
            <InfoRow label="電話" value={c.phone} />
            <InfoRow label="生日" value={c.bd} />
            <InfoRow label="婚姻" value={c.mar} />
            <InfoRow label="小孩狀況" value={c.kids} />

            <div className="text-xs font-semibold text-muted-foreground mb-1 mt-6 uppercase tracking-wider flex items-center">
              會員資料
              <button className="ml-auto text-primary capitalize font-normal text-[11px] tracking-normal flex items-center gap-1" onClick={() => setEditSection('member')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                編輯
              </button>
            </div>
            <InfoRow label="會員編號" value={c.mno} />
            <InfoRow label="會員密碼" value={
              c.pw ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono tracking-wider">{showPw ? c.pw : '••••••••'}</span>
                  <button onClick={() => setShowPw(!showPw)} className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground">
                    {showPw ? 
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              ) : <span className="text-muted-foreground">— (尚未設定)</span>
            } />

            <div className="text-xs font-semibold text-muted-foreground mb-1 mt-6 uppercase tracking-wider flex items-center">
              需求與備註
              <button className="ml-auto text-primary capitalize font-normal text-[11px] tracking-normal flex items-center gap-1" onClick={() => setEditSection('needs')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                編輯
              </button>
            </div>
            <InfoRow label="來源" value={c.src} />
            <InfoRow label="需求" value={c.need} />
            <InfoRow label="也有誰在服務" value={c.also} />
            <InfoRow label="備註" value={c.note} />

            <div className="text-xs font-semibold text-muted-foreground mb-3 mt-6 uppercase tracking-wider flex items-center">
              週邊潛在名單
              <button className="ml-auto text-primary capitalize font-normal text-[11px] tracking-normal" onClick={() => setEditSection('leads')}>＋ 新增</button>
            </div>
            {c.leads.length > 0 ? c.leads.map((l, i) => (
              <div key={i} className="bg-card border border-border p-3 rounded-xl mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{l.n} <span className="text-muted-foreground text-xs font-normal">{l.rel}</span></div>
                  <div className="text-xs text-muted-foreground truncate">需求：{l.need}</div>
                </div>
                <button 
                  onClick={() => {
                    const newId = Math.max(...initialCustomers.map((c: any) => c.id)) + 1;
                    initialCustomers.unshift({
                      id: newId,
                      name: l.n,
                      ini: l.n.charAt(0),
                      tags: ['新客', `來自${c.name}`],
                      last: 0,
                      phone: '',
                      bd: '',
                      mar: '',
                      kids: '',
                      mno: '',
                      pw: '',
                      src: `親友：${c.name}`,
                      need: l.need,
                      also: '',
                      note: `關係：${l.rel}`,
                      leads: [],
                      sv: []
                    });
                    
                    const lIdx = c.leads.findIndex(x => x === l);
                    if (lIdx !== -1) c.leads.splice(lIdx, 1);
                    window.dispatchEvent(new Event('data-updated'));
                  }} 
                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[11px] font-medium shrink-0 hover:bg-primary/20 transition-colors"
                >
                  轉為客戶
                </button>
              </div>
            )) : <div className="text-xs text-muted-foreground mb-4">記下這位客戶身邊有誰、有什麼需求</div>}
          </div>
        )}

      </div>
      
      {editSection && (
        <AddCustomerView mode="edit" editSection={editSection} initialData={c} onClose={() => setEditSection(null)} />
      )}

      {editSvcData && (
        <AddSvcView mode="edit" initialData={editSvcData} onClose={() => setEditSvcData(null)} />
      )}

      {editBuyData && (
        <AddBuyView mode="edit" initialData={editBuyData} onClose={() => setEditBuyData(null)} />
      )}
    </div>
  );
}

function ActionBtn({ icon, label, primary, onClick }: { icon: React.ReactNode, label: string, primary?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs transition-colors ${primary ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
      {label}
    </button>
  );
}
