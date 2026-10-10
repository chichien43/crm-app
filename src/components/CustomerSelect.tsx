import React, { useState, useRef, useEffect } from 'react';
import { initialCustomers } from '../data';

export default function CustomerSelect({ id, defaultValue = '' }: { id: string, defaultValue?: number | '' }) {
  const [value, setValue] = useState<number | ''>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = initialCustomers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const selectedCustomer = initialCustomers.find(c => c.id === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <input type="hidden" id={id} value={value} />
      <div 
        className="w-full bg-white border border-border rounded-xl px-4 py-3.5 text-[15px] cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedCustomer ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedCustomer ? selectedCustomer.name : '請選擇客戶...'}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-[60] mt-1 w-full bg-white border border-border rounded-xl shadow-lg max-h-60 flex flex-col pointer-events-auto">
          <div className="p-2 border-b border-border shrink-0">
            <input 
              type="text" 
              className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              placeholder="搜尋姓名或電話..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {filtered.map(c => (
              <div 
                key={c.id} 
                className="px-4 py-3 hover:bg-muted cursor-pointer text-[15px] flex justify-between items-center"
                onClick={() => {
                  setValue(c.id);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                <span>{c.name}</span>
                <span className="text-muted-foreground text-[11px]">{c.phone}</span>
              </div>
            ))}
            {filtered.length === 0 && <div className="px-4 py-4 text-center text-sm text-muted-foreground">查無客戶</div>}
          </div>
        </div>
      )}
    </div>
  );
}
