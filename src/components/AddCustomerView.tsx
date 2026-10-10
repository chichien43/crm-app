import React, { useState, useEffect } from 'react';
import { initialCustomers } from '../data';
import { createPortal } from 'react-dom';

export default function AddCustomerView({ onClose, mode = 'add', editSection, initialData }: { 
  onClose: () => void, 
  mode?: 'add' | 'edit',
  editSection?: string,
  initialData?: any 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [leads, setLeads] = useState(initialData?.leads || []);

  useEffect(() => {
    setIsVisible(true);
    if (mode === 'edit' && editSection && editSection !== 'all') {
      setTimeout(() => {
        const el = document.getElementById(`section-${editSection}`);
        const container = document.getElementById('add-customer-scroll-area');
        if (el && container) {
          container.scrollTo({ top: el.offsetTop - container.offsetTop - 16, behavior: 'smooth' });
        }
      }, 350);
    }
  }, [mode, editSection]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    const cName = (document.getElementById('c_name') as HTMLInputElement)?.value || '';
    const cPhone = (document.getElementById('c_phone') as HTMLInputElement)?.value || '';
    const cBd = (document.getElementById('c_bd') as HTMLInputElement)?.value || '';
    const cKids = (document.getElementById('c_kids') as HTMLInputElement)?.value || '';
    const cMno = (document.getElementById('c_mno') as HTMLInputElement)?.value || '';
    const cPw = (document.getElementById('c_pw') as HTMLInputElement)?.value || '';
    const cSrc = (document.getElementById('c_src') as HTMLInputElement)?.value || '';
    const cNeed = (document.getElementById('c_need') as HTMLInputElement)?.value || '';
    const cAlso = (document.getElementById('c_also') as HTMLInputElement)?.value || '';
    const cNote = (document.getElementById('c_note') as HTMLTextAreaElement)?.value || '';
    const cMar = (document.getElementById('c_mar') as HTMLSelectElement)?.value || '';

    if (mode === 'add') {
      const newId = Math.max(...initialCustomers.map((c: any) => c.id)) + 1;
      initialCustomers.unshift({
        id: newId,
        name: cName || '新客戶',
        ini: cName ? cName.charAt(0) : '新',
        tags: ['新客'],
        last: 0,
        phone: cPhone,
        bd: cBd,
        mar: cMar,
        kids: cKids,
        mno: cMno,
        pw: cPw,
        src: cSrc,
        need: cNeed,
        also: cAlso,
        note: cNote,
        leads: leads,
        sv: []
      });
    } else if (mode === 'edit' && initialData) {
      const c = initialCustomers.find((x: any) => x.id === initialData.id);
      if (c) {
        c.name = cName;
        c.ini = cName ? cName.charAt(0) : c.ini;
        c.phone = cPhone;
        c.bd = cBd;
        c.mar = cMar;
        c.kids = cKids;
        c.mno = cMno;
        c.pw = cPw;
        c.src = cSrc;
        c.need = cNeed;
        c.also = cAlso;
        c.note = cNote;
        c.leads = leads;
      }
    }
    window.dispatchEvent(new Event('data-updated'));
    handleClose();
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    const idx = initialCustomers.findIndex((x: any) => x.id === initialData?.id);
    if (idx !== -1) initialCustomers.splice(idx, 1);
    window.dispatchEvent(new Event('data-updated'));
    handleClose();
    if (mode === 'edit') window.dispatchEvent(new Event('go-back'));
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
            <div className="text-[17px] font-semibold text-foreground">{mode === 'edit' ? '編輯客戶' : '新增客戶'}</div>
            <button onClick={handleSave} className="text-[15px] text-primary font-medium px-2 py-1">儲存</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20 scroll-smooth" id="add-customer-scroll-area">
          <div className="space-y-4">
            <div id="section-basic" className="space-y-4">
              {mode === 'edit' && (
                <div className="flex justify-end mb-2">
                  {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} className="text-[13px] text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg font-medium">刪除客戶</button>
                  ) : (
                    <div className="flex items-center gap-2 bg-destructive/5 px-3 py-1.5 rounded-lg">
                      <span className="text-[12px] text-destructive font-medium">確定刪除？</span>
                      <button onClick={handleDelete} className="text-[12px] bg-destructive text-white px-2.5 py-1 rounded-md">確定</button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="text-[12px] bg-white border border-border text-foreground px-2.5 py-1 rounded-md">取消</button>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">姓名 <span className="text-destructive">*</span></label>
                <input id="c_name" type="text" defaultValue={initialData?.name || ''} placeholder="請輸入姓名" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">電話</label>
                <input id="c_phone" type="tel" defaultValue={initialData?.phone || ''} placeholder="請輸入電話" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground ml-1">生日</label>
                  <input id="c_bd" type="text" placeholder="例如：03/15" defaultValue={initialData?.bd || ''} className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground ml-1">婚姻</label>
                  <select id="c_mar" defaultValue={initialData?.mar || ''} className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground appearance-none">
                    <option value="">請選擇</option>
                    <option value="已婚">已婚</option>
                    <option value="未婚">未婚</option>
                    <option value="單身">單身</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">小孩狀況</label>
                <input id="c_kids" type="text" defaultValue={initialData?.kids || ''} placeholder="例如：1男、無" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
            </div>

            <div id="section-member" className="space-y-4 pt-6 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">會員編號</label>
                <input id="c_mno" type="text" defaultValue={initialData?.mno || ''} placeholder="若已是會員請輸入" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">系統登入密碼</label>
                <div className="relative">
                  <input id="c_pw" type={showPw ? 'text' : 'password'} defaultValue={initialData?.pw || ''} placeholder="請設定密碼" className="w-full bg-white border border-border rounded-xl pl-4 pr-12 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono" />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-muted w-8 h-8 flex items-center justify-center rounded-full">
                    {showPw ? 
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              </div>
            </div>

            <div id="section-needs" className="space-y-4 pt-6 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">來源</label>
                <input id="c_src" type="text" defaultValue={initialData?.src || ''} placeholder="例如：朋友介紹、Facebook" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">標籤管理</label>
                <div className="bg-white border border-border rounded-xl p-3 min-h-[60px] flex gap-2 flex-wrap items-start">
                  {initialData?.tags?.map((t: string) => (
                    <span key={t} className="text-[12px] pl-2 pr-1 py-1 rounded bg-muted text-foreground flex items-center gap-1">
                      {t}
                      <button 
                        onClick={() => {
                          const c = initialCustomers.find(x => x.id === initialData.id);
                          if (c) {
                            c.tags = c.tags.filter(x => x !== t);
                            window.dispatchEvent(new Event('data-updated'));
                          }
                        }}
                        className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white rounded-full transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </span>
                  ))}
                  {(!initialData?.tags || initialData.tags.length === 0) && (
                    <div className="text-muted-foreground text-sm w-full text-center py-2">尚未新增標籤</div>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground ml-1 mt-1">＊新增標籤請至客戶主頁點擊「＋標籤」</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">潛在需求</label>
                <input id="c_need" type="text" defaultValue={initialData?.need || ''} placeholder="例如：想減重、缺保健品、想了解事業..." className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">也有誰在服務</label>
                <input id="c_also" type="text" defaultValue={initialData?.also || ''} placeholder="其他服務人員" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">備註</label>
                <textarea id="c_note" defaultValue={initialData?.note || ''} placeholder="其他備註事項" className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[80px] resize-none"></textarea>
              </div>
            </div>

            <div id="section-leads" className="space-y-4 pt-6 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">潛在名單</label>
                <div className="space-y-2">
                  {leads.map((l: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" value={l.n} onChange={e => { const newLeads = [...leads]; newLeads[i].n = e.target.value; setLeads(newLeads); }} placeholder="姓名" className="w-1/3 bg-white border border-border rounded-xl px-3 py-2 text-[14px]" />
                      <input type="text" value={l.rel} onChange={e => { const newLeads = [...leads]; newLeads[i].rel = e.target.value; setLeads(newLeads); }} placeholder="關係" className="w-1/4 bg-white border border-border rounded-xl px-3 py-2 text-[14px]" />
                      <input type="text" value={l.need} onChange={e => { const newLeads = [...leads]; newLeads[i].need = e.target.value; setLeads(newLeads); }} placeholder="需求" className="flex-1 bg-white border border-border rounded-xl px-3 py-2 text-[14px]" />
                    </div>
                  ))}
                  <button onClick={() => setLeads([...leads, { n: '', rel: '', need: '' }])} className="text-[13px] text-primary font-medium w-full text-center py-2 border border-dashed border-border rounded-xl">＋ 新增潛在名單</button>
                </div>
              </div>
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
