import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { initialSubscriptions, initialReminders, TODAY } from '../data';

interface NewsItem {
  id: string;
  category: '公告' | '活動' | '提醒' | '系統';
  title: string;
  content: string;
  date: string;
  actionText?: string;
  actionTab?: string;
}

export default function NewsView({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('全部');
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('crm_read_news');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  // Dynamic status
  const unreadSubs = initialSubscriptions.filter(s => !s.ok).length;
  const overdueReminders = initialReminders.filter(r => r.d < TODAY && r.k !== '享回購').length;
  const todayReminders = initialReminders.filter(r => r.d === TODAY && r.k !== '享回購').length;

  const newsList: NewsItem[] = [
    {
      id: 'sub-deadline',
      category: '公告',
      title: '10/25 是本月享回購月結截止日',
      content: unreadSubs > 0 
        ? `目前尚有 ${unreadSubs} 筆享回購排程未核對，請於截止日前儘速核對確認。`
        : '恭喜！本月享回購排程已全數核對完成。',
      date: '今天 09:00',
      actionText: '前往核對排程',
      actionTab: 'sub'
    },
    {
      id: 'activity-beauty',
      category: '活動',
      title: '秋季美容體驗會 10/17（六）熱烈報名中',
      content: '地點：台北旗艦中心。歡迎夥伴邀請新朋友與 VIP 客戶參加體驗新產品，現場備有精美伴手禮。',
      date: '昨天 14:30',
      actionText: '查看行程日曆',
      actionTab: 'cal'
    },
    {
      id: 'rem-status',
      category: '提醒',
      title: '今日客戶跟進與待辦通知',
      content: `今天有 ${todayReminders} 件客戶提醒事項，${overdueReminders > 0 ? `另有 ${overdueReminders} 筆逾期未跟進` : '無逾期待辦'}，記得抽空問候客戶哦！`,
      date: '今天 08:30',
      actionText: '查看今日待辦',
      actionTab: 'today'
    },
    {
      id: 'feature-backup',
      category: '系統',
      title: '全新功能：已新增「資料備份與匯出」',
      content: '您的資料 100% 儲存在手機地端，現在可隨時至「設定」一鍵下載 JSON 備份檔，保障資料永不遺失！',
      date: '10/11',
      actionText: '前往設定查看',
    },
    {
      id: 'system-security',
      category: '系統',
      title: '隱私保護提示：本機離線安全儲存',
      content: '所有客戶電話、姓名、購買紀錄與排程均保存在本機裝置，無伺服器集中儲存，敬請安心使用。',
      date: '10/08',
    }
  ];

  const handleMarkAllRead = () => {
    const allIds = newsList.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem('crm_read_news', JSON.stringify(allIds));
    window.dispatchEvent(new Event('news-read-updated'));
  };

  const handleAction = (tab?: string) => {
    if (tab) {
      if (tab === 'sub') window.dispatchEvent(new Event('nav-sub'));
      if (tab === 'cal') window.dispatchEvent(new Event('nav-cal'));
      if (tab === 'today') {
        // Go to today tab
        const navEvent = new CustomEvent('nav-tab', { detail: 'today' });
        window.dispatchEvent(navEvent);
      }
    }
    handleClose();
  };

  const categories = ['全部', '公告', '活動', '提醒', '系統'];
  const filteredList = activeFilter === '全部' 
    ? newsList 
    : newsList.filter(n => n.category === activeFilter);

  const unreadCount = newsList.filter(n => !readIds.includes(n.id)).length;

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 pointer-events-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      />
      
      {/* Fixed Full-Height Sheet resting directly above bottom nav (74px) */}
      <div 
        style={{ top: '48px', bottom: '74px' }}
        className={`absolute left-0 right-0 bg-white rounded-t-[28px] pointer-events-auto flex flex-col shadow-2xl transition-transform duration-300 ease-out border-t border-border z-10 overflow-hidden ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-1 shrink-0"></div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-foreground">公告與通知</h2>
                {unreadCount > 0 && (
                  <span className="bg-destructive text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} 則未讀
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground">團隊重要事項與客戶提醒中心</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[12px] font-medium text-primary hover:text-primary/80 px-2 py-1 rounded-md transition-colors"
              >
                全部已讀
              </button>
            )}
            <button 
              onClick={handleClose} 
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-gray-50/80 border-b border-border flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {categories.map(cat => {
            const isSelected = activeFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1 rounded-full text-[13px] font-medium transition-all shrink-0 ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-white border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              目前沒有「{activeFilter}」類別的通知
            </div>
          ) : (
            filteredList.map(item => {
              const isRead = readIds.includes(item.id);
              
              const catBadgeColor = {
                '公告': 'bg-primary/10 text-primary border-primary/20',
                '活動': 'bg-amber-50 text-amber-700 border-amber-200',
                '提醒': 'bg-rose-50 text-rose-700 border-rose-200',
                '系統': 'bg-slate-100 text-slate-700 border-slate-200',
              }[item.category] || 'bg-muted text-muted-foreground';

              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-sm ${
                    isRead ? 'border-border/80 opacity-80' : 'border-primary/30 ring-1 ring-primary/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${catBadgeColor}`}>
                        {item.category}
                      </span>
                      <span className="font-semibold text-[15px] text-foreground">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">{item.date}</span>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-destructive shrink-0"></span>
                      )}
                    </div>
                  </div>

                  <p className="text-[13px] text-muted-foreground leading-relaxed pl-0.5">
                    {item.content}
                  </p>

                  {item.actionText && (
                    <div className="mt-3 pt-2.5 border-t border-border/60 flex justify-end">
                      <button
                        onClick={() => handleAction(item.actionTab)}
                        className="text-[12px] font-medium text-primary hover:text-primary/80 flex items-center gap-1 group transition-colors"
                      >
                        <span>{item.actionText}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    modalRoot
  );
}
