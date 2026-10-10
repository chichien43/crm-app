import React, { useState } from 'react';

export default function LoginView({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  return (
    <div className="absolute inset-0 bg-background z-[200] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-primary text-primary-foreground rounded-3xl shadow-xl flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground tracking-wider mb-2">直銷專屬 CRM</h1>
        <p className="text-sm text-muted-foreground mb-8 text-center">360度客戶追蹤與團隊管理系統</p>

        <div className="w-full bg-card border border-border p-5 rounded-2xl shadow-sm mb-6">
          {mode === 'login' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">帳號</label>
                <input key="login-acc" type="text" placeholder="請輸入帳號" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">密碼</label>
                <input key="login-pw" type="password" placeholder="請輸入密碼" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <button onClick={onLogin} className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3.5 mt-2 shadow-lg shadow-primary/20 hover:bg-primaryHover transition-colors">
                安全登入
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">邀請碼</label>
                <input key="reg-code" type="text" placeholder="請輸入上線或系統邀請碼" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">設定帳號</label>
                <input key="reg-acc" type="text" placeholder="請設定帳號" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground ml-1">設定密碼</label>
                <input key="reg-pw" type="password" placeholder="請設定密碼" className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <button onClick={() => setMode('login')} className="w-full bg-foreground text-background font-semibold rounded-xl py-3.5 mt-2 shadow-lg hover:opacity-90 transition-opacity">
                驗證並註冊
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          {mode === 'login' ? '沒有帳號？使用邀請碼註冊' : '已有帳號？返回登入'}
        </button>

      </div>
    </div>
  );
}
