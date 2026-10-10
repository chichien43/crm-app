import React from 'react';

export default function BadgesView({ onClose }: { onClose: () => void }) {
  const myBadges = [
    { id: 1, name: '新人起步', desc: '完成首次登入與基本設定', icon: '🌟', date: '2023-10-01' },
    { id: 2, name: '首單達成', desc: '成功完成第一筆客戶交易', icon: '🏆', date: '2023-10-15' },
    { id: 3, name: '百人斬', desc: '客戶名單累積超過 100 人', icon: '🔥', date: '2024-02-20' },
  ];

  const lockedBadges = [
    { id: 4, name: '業績達標', desc: '單月業績突破 10 萬', icon: '💎' },
    { id: 5, name: '活動大使', desc: '參與 5 場官方舉辦活動', icon: '🎖️' },
  ];

  return (
    <div className="absolute inset-0 bg-background z-[60] flex flex-col animate-fade-in">
      <div className="h-14 flex items-center px-4 border-b border-border bg-card shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 mr-2 text-foreground">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="font-semibold text-[17px]">成就勳章</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 bg-muted/30">
        
        <div className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground rounded-2xl p-6 mb-8 shadow-lg shadow-primary/20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-3 shadow-inner">
            👑
          </div>
          <div className="text-xl font-bold mb-1">尊榮大使</div>
          <div className="text-sm opacity-90">目前已收集 {myBadges.length} 面勳章</div>
          <div className="w-full bg-black/20 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-white h-full rounded-full" style={{ width: `${(myBadges.length / (myBadges.length + lockedBadges.length)) * 100}%` }}></div>
          </div>
          <div className="text-xs mt-1.5 opacity-80 text-right w-full">下一階：品牌總監</div>
        </div>

        <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">已獲得 ({myBadges.length})</div>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {myBadges.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] px-2 py-0.5 rounded-bl-lg font-medium">
                {b.date.substring(0,7)}
              </div>
              <div className="text-4xl mb-2 drop-shadow-sm">{b.icon}</div>
              <div className="font-bold text-[14px] mb-1">{b.name}</div>
              <div className="text-[11px] text-muted-foreground">{b.desc}</div>
            </div>
          ))}
        </div>

        <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">未解鎖 ({lockedBadges.length})</div>
        <div className="grid grid-cols-2 gap-3 pb-8">
          {lockedBadges.map(b => (
            <div key={b.id} className="bg-card border border-dashed border-border rounded-xl p-4 flex flex-col items-center text-center opacity-60 grayscale">
              <div className="text-4xl mb-2 opacity-50">{b.icon}</div>
              <div className="font-bold text-[14px] mb-1">{b.name}</div>
              <div className="text-[11px] text-muted-foreground">{b.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
