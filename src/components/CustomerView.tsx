import React, { useState } from 'react';
import { initialCustomers, initialProducts, initialSubscriptions, initialPurchases, initialReminders, TODAY } from '../data';
import { Customer } from '../types';

export default function CustomerView() {
  const onOpenCustomer = (id: number) => {
    window.dispatchEvent(new CustomEvent('nav-cust-detail', { detail: id }));
  };
  const onOpenProduct = (id: number) => {
    window.dispatchEvent(new CustomEvent('nav-prod-detail', { detail: id }));
  };
  const [seg, setSeg] = useState<'客戶' | '產品'>('客戶');
  const [view, setView] = useState<'card' | 'list'>('card');
  const [selectedCustTags, setSelectedCustTags] = useState<string[]>([]);
  const [smartList, setSmartList] = useState('all');
  const [showDrawer, setShowDrawer] = useState(false);

  // Product tab filter state
  const [prodSearch, setProdSearch] = useState('');
  const [selectedProdTags, setSelectedProdTags] = useState<string[]>([]);
  const [prodTagMode, setProdTagMode] = useState<'and' | 'or'>('or');

  React.useEffect(() => {
    const handleFilterTag = (e: any) => {
      if (e.detail) {
        setSelectedCustTags([e.detail]);
      } else {
        setSelectedCustTags([]);
      }
      setSeg('客戶'); // Ensure we are on customer tab
    };
    window.addEventListener('filter-tag', handleFilterTag);
    return () => window.removeEventListener('filter-tag', handleFilterTag);
  }, []);

  const customerTags = initialCustomers.flatMap(c => c.tags);
  const purchaseTags = initialPurchases.flatMap(p => p.tags || []);
  const allTags = Array.from(new Set([...customerTags, ...purchaseTags]));

  const getProductTags = (p: any) => {
    const pPurchases = initialPurchases.filter(b => b.p === p.id);
    const pPurchaseTags = pPurchases.flatMap(b => b.tags || []);
    return Array.from(new Set([...p.types, ...(p.tags || []), ...pPurchaseTags]));
  };

  const allProductTags = Array.from(new Set(initialProducts.flatMap(p => getProductTags(p))));

  const toggleCustTag = (t: string) => {
    if (selectedCustTags.includes(t)) {
      setSelectedCustTags(selectedCustTags.filter(x => x !== t));
    } else {
      setSelectedCustTags([...selectedCustTags, t]);
    }
  };

  const toggleProdTag = (t: string) => {
    if (selectedProdTags.includes(t)) {
      setSelectedProdTags(selectedProdTags.filter(x => x !== t));
    } else {
      setSelectedProdTags([...selectedProdTags, t]);
    }
  };

  // Smart filters logic
  const hasRem = (c: Customer, filterFn: (r: any) => boolean) => initialReminders.some(r => r.cid === c.id && filterFn(r));
  const smartFilters = [
    { k: 'all', n: '全部客戶', f: () => true },
    { k: 'today', n: '今日要聯絡', f: (c: Customer) => hasRem(c, r => r.d === TODAY) },
    { k: 'over', n: '逾期未跟進', f: (c: Customer) => hasRem(c, r => r.d < TODAY) },
    { k: 'sub', n: '享回購中', f: (c: Customer) => initialSubscriptions.some(s => s.c === c.id && s.st !== '取消') },
    { k: 'cold', n: '久未聯絡（30 天以上）', f: (c: Customer) => c.last !== null && c.last >= 30 },
  ];
  
  const currentSmartFilter = smartFilters.find(s => s.k === smartList)!;

  let list = initialCustomers.filter(currentSmartFilter.f);
  if (selectedCustTags.length > 0) {
    list = list.filter(c => 
      selectedCustTags.some(t => 
        c.tags.includes(t) || initialPurchases.some(p => p.c === c.id && p.tags?.includes(t))
      )
    );
  }

  let filteredProducts = initialProducts;
  if (prodSearch.trim()) {
    const query = prodSearch.trim().toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      getProductTags(p).some((t: string) => t.toLowerCase().includes(query))
    );
  }
  if (selectedProdTags.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const pTags = getProductTags(p);
      return prodTagMode === 'and'
        ? selectedProdTags.every(t => pTags.includes(t))
        : selectedProdTags.some(t => pTags.includes(t));
    });
  }
  
  // Sort by last contact
  list.sort((a, b) => (b.last ?? -1) - (a.last ?? -1));

  const getNextRem = (c: Customer) => {
    return initialReminders.filter(r => r.cid === c.id).sort((a, b) => (a.d + a.t) > (b.d + b.t) ? 1 : -1)[0];
  };

  const tagColor = (t: string) => {
    if (['潛在','新客','回購','VIP'].includes(t)) return 'ind';
    if (['美容','腸胃','睡眠'].includes(t)) return 'primary';
    return 'accent';
  };

  const Tag = ({ t }: { t: string }) => (
    <span className={`text-[10px] px-2 py-0.5 rounded-sm whitespace-nowrap bg-${tagColor(t)}/10 text-${tagColor(t)}`}>
      {t}
    </span>
  );

  return (
    <div className="animate-fade-in h-full flex flex-col relative pb-8">
      {/* Drawer */}
      {showDrawer && (
        <div className="absolute inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDrawer(false)}></div>
          <div className="relative w-[82%] bg-white h-full shadow-2xl p-5 pt-8 animate-fade-in flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">明</div>
              <div>
                <div className="font-medium text-foreground">王小明</div>
                <div className="text-xs text-muted-foreground mt-0.5">資深品牌大使</div>
              </div>
            </div>
            
            <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">智慧分類</div>
            <div className="space-y-1">
              {smartFilters.map(s => (
                <button 
                  key={s.k}
                  onClick={() => { setSmartList(s.k); setSelectedCustTags([]); setShowDrawer(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-left transition-colors ${smartList === s.k ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  <span className="flex-1">{s.n}</span>
                  <span className="text-xs text-muted-foreground">{initialCustomers.filter(s.f).length}</span>
                </button>
              ))}
            </div>
            <button className="w-full text-left px-3 py-3 text-sm text-primary font-medium mt-2">＋ 新增智慧分類</button>
          </div>
        </div>
      )}

      {/* Unified Top App Bar */}
      <div className="px-5 pt-8 pb-3 flex items-start gap-4 shrink-0">
        <button className="relative text-primary mt-1 w-6 h-6 flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
          <span className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-destructive rounded-full"></span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[22px] font-bold text-foreground tracking-wide">{seg === '客戶' ? '我的客戶' : '產品'}</div>
          <div className="text-[13px] text-muted-foreground mt-0.5">{seg === '客戶' ? `共 ${initialCustomers.length} 位` : '點進去看「誰買過」'}</div>
        </div>
        <div className="flex items-center gap-3 mt-1 shrink-0">
          <button onClick={() => window.dispatchEvent(new Event('open-search'))} className="text-primary w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button onClick={() => window.dispatchEvent(new Event('open-settings'))} className="text-primary w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-0 shrink-0">
        {/* Segment Control */}
        <div className="px-4">
          <div className="bg-muted rounded-xl p-1 flex">
            {(['客戶', '產品'] as const).map(s => (
              <button 
                key={s} 
                onClick={() => setSeg(s)}
                className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${seg === s ? 'bg-white shadow-sm font-medium' : 'text-muted-foreground'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {seg === '客戶' && (
          <>
            <div className="px-4 flex items-center gap-2 mt-1">
              <button onClick={() => setShowDrawer(true)} className="bg-card border border-border rounded-xl h-10 px-3 flex items-center gap-2 flex-1 min-w-0 text-sm shadow-sm hover:bg-gray-50 transition-colors text-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
                <span className="truncate font-medium flex-1">{currentSmartFilter.n}</span>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">{list.length} 位</span>
              </button>
              <button onClick={() => setView(view === 'card' ? 'list' : 'card')} className="bg-card border border-border rounded-xl w-10 h-10 flex items-center justify-center shadow-sm">
                {view === 'card' ? 
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg> :
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                }
              </button>
            </div>

            <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
              <button 
                onClick={() => setSelectedCustTags([])}
                className={`border rounded-full px-3 py-1 text-[13px] whitespace-nowrap transition-colors ${selectedCustTags.length === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:bg-gray-50'}`}
              >
                全部
              </button>
              {allTags.map(t => {
                const selected = selectedCustTags.includes(t);
                return (
                  <button 
                    key={t}
                    onClick={() => toggleCustTag(t)}
                    className={`border rounded-full px-3 py-1 text-[13px] whitespace-nowrap transition-colors flex items-center gap-1 ${
                      selected ? 'bg-primary text-primary-foreground border-primary font-medium shadow-sm' : 'bg-card border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    <span>{t}</span>
                    {selected && (
                      <span className="text-[10px] ml-0.5">✕</span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {seg === '產品' && (
          <>
            <div className="px-4 flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-3 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input 
                  type="text" 
                  value={prodSearch} 
                  onChange={e => setProdSearch(e.target.value)} 
                  placeholder="搜尋產品或標籤..." 
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-primary shadow-sm text-foreground placeholder:text-muted-foreground"
                />
                {prodSearch && (
                  <button onClick={() => setProdSearch('')} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
              <div className="bg-card border border-border rounded-xl h-10 px-3 flex items-center gap-1.5 text-xs text-muted-foreground shadow-sm shrink-0 font-medium">
                <span className="text-foreground font-semibold">{filteredProducts.length}</span> 項
              </div>
            </div>

            <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar py-1 shrink-0 items-center">
              <button 
                onClick={() => setSelectedProdTags([])}
                className={`border rounded-full px-3 py-1 text-[13px] whitespace-nowrap transition-colors ${selectedProdTags.length === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:bg-gray-50'}`}
              >
                全部
              </button>
              {allProductTags.map(t => {
                const selected = selectedProdTags.includes(t);
                return (
                  <button 
                    key={t}
                    onClick={() => toggleProdTag(t)}
                    className={`border rounded-full px-3 py-1 text-[13px] whitespace-nowrap transition-colors flex items-center gap-1 ${
                      selected ? 'bg-primary text-primary-foreground border-primary font-medium shadow-sm' : 'bg-card border-border text-foreground hover:bg-gray-50'
                    }`}
                  >
                    <span>#{t}</span>
                    {selected && (
                      <span className="text-[10px] ml-0.5">✕</span>
                    )}
                  </button>
                );
              })}
              {selectedProdTags.length > 1 && (
                <button 
                  onClick={() => setProdTagMode(m => m === 'and' ? 'or' : 'and')} 
                  className="text-[11px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-medium whitespace-nowrap shrink-0 hover:bg-primary/20 transition-colors"
                >
                  {prodTagMode === 'or' ? '符合任一 (OR)' : '符合全部 (AND)'}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {seg === '客戶' && (

          <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2 pb-24 mt-2 min-h-0">
            {list.map(c => {
              const subs = initialSubscriptions.filter(s => s.c === c.id && s.st !== '取消');
              const nx = getNextRem(c);
              const prods = Array.from(new Set(initialPurchases.filter(b => b.c === c.id && b.v !== '活動').map(b => initialProducts.find(p => p.id === b.p)?.name)));
              
              if (view === 'card') {
                return (
                  <button key={c.id} onClick={() => onOpenCustomer(c.id)} className="bg-card border border-border p-4 rounded-xl w-full text-left shadow-sm block animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-lg">{c.ini}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base">{c.name}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">{c.tags.map(t => <Tag key={t} t={t} />)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 mt-3 pt-3 border-t border-border text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">上次服務</div>
                        <div className={`text-sm ${c.last && c.last >= 30 ? 'text-destructive' : ''}`}>{c.last === null ? '尚未服務' : c.last === 0 ? '今天' : `${c.last} 天前`}</div>
                      </div>
                      <div className="border-x border-border">
                        <div className="text-xs text-muted-foreground">下次提醒</div>
                        <div className={`text-sm ${nx && nx.d < TODAY ? 'text-destructive' : ''}`}>{nx ? (nx.d === TODAY ? '今天 ' + nx.t : nx.d.slice(5).replace('-','/')) : '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">享回購</div>
                        <div className="text-sm" style={{color: subs.length ? 'var(--primary)' : 'inherit'}}>{subs.length ? subs[0].st : '—'}</div>
                      </div>
                    </div>
                    {(prods.length > 0 || c.leads.length > 0) && (
                      <div className="text-xs text-muted-foreground mt-3 flex gap-3">
                        {prods.length > 0 && <span className="truncate flex-1">📦 {prods.join('、')}</span>}
                        {c.leads.length > 0 && <span className="shrink-0">👥 週邊 {c.leads.length} 位</span>}
                      </div>
                    )}
                  </button>
                );
              } else {
                return (
                  <button key={c.id} onClick={() => onOpenCustomer(c.id)} className="w-full flex items-center gap-3 py-3 border-b border-border text-left bg-card px-3 first:rounded-t-xl last:rounded-b-xl last:border-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">{c.ini}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{c.name} {subs.length > 0 && <span className="text-primary ml-1 text-xs">🔄</span>}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.tags.join(' ・ ')}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className={c.last && c.last >= 30 ? 'text-destructive' : 'text-muted-foreground'}>{c.last === null ? '尚未' : c.last === 0 ? '今天' : `${c.last}天前`}</div>
                      <div className="text-muted-foreground">{nx ? '→ ' + nx.d.slice(5).replace('-','/') : ''}</div>
                    </div>
                  </button>
                );
              }
            })}
            {list.length === 0 && <div className="text-center text-sm text-muted-foreground py-10">沒有符合的客戶</div>}
          </div>
      )}

      {seg === '產品' && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-2 pb-24 mt-2 min-h-0">
          {filteredProducts.map(p => {
            const buyers = new Set(initialPurchases.filter(b => b.p === p.id).map(b => b.c)).size;
            const subs = initialSubscriptions.filter(s => s.p === p.id && s.st === '進行中').length;
            const isEvent = p.types.includes('活動');
            const pExtraTags = getProductTags(p).filter((t: string) => !p.types.includes(t));
            return (
              <button key={p.id} onClick={() => onOpenProduct(p.id)} className="bg-card border border-border p-4 rounded-xl w-full text-left flex items-center gap-3 shadow-sm hover:border-primary/40 transition-all">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {isEvent ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 22V4s1-1 4-1 5 2 8 2 4-1 4-1v11s-1 1-4 1-5-2-8-2-4 1-4 1"/></svg> : 
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{p.name}</div>
                  <div className="flex gap-1 mt-1 flex-wrap items-center">
                    {p.types.map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                    ))}
                    {p.date && <span className="text-[10px] px-1.5 py-0.5 rounded text-muted-foreground">{p.date.slice(5).replace('-','/')}</span>}
                    {pExtraTags.map((t: string) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">#{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground shrink-0">
                  <div><b className="text-foreground text-[15px] font-medium">{buyers}</b> 位客戶</div>
                  {subs > 0 && <div className="text-primary mt-0.5">{subs} 位享回購</div>}
                </div>
              </button>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-12">
              沒有符合標籤或搜尋條件的產品
            </div>
          )}
        </div>
      )}
    </div>
  );
}
