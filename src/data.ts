import { Product, Customer, Purchase, Reminder, Subscription, Schedule } from './types';

export const TODAY = '2026-10-08';

const load = (key, defaultData) => {
  try {
    const saved = localStorage.getItem('crm_' + key);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error('Failed to load ' + key, e); }
  return defaultData;
};

export const userProfile = load('userProfile', {
  name: '王小明',
  avatar: ''
});

export const initialProducts: Product[] = load('products', [
  { id: 1, name: '益生菌 30包', types: ['零售', '享回購'], price: 1800 },
  { id: 2, name: '膠原蛋白飲', types: ['零售', '享回購'], price: 2400 },
  { id: 3, name: '溫和洗髮精', types: ['零售', '享回購'], price: 680 },
  { id: 4, name: '酵素飲', types: ['零售', '享回購'], price: 1500 },
  { id: 5, name: '保濕精華液', types: ['零售'], price: 1980 },
  { id: 6, name: '健康講座・台北場', types: ['活動'], price: 0, date: '2026-09-14' },
  { id: 7, name: '秋季美容體驗會', types: ['活動'], price: 300, date: '2026-10-17' },
  { id: 8, name: 'VIP 品茶會', types: ['活動'], price: 0, date: '2026-08-20' },
]);

export const initialPurchases: Purchase[] = load('purchases', [
  { c: 1, p: 1, d: '2026-09-20', q: 2, v: '享回購', price: 1800, tags: ['秋季特惠'] }, { c: 1, p: 1, d: '2026-08-20', q: 2, v: '享回購', price: 1800, tags: ['買四送一'] },
  { c: 1, p: 2, d: '2026-08-02', q: 1, v: '新購', price: 2400, tags: ['加價購'] }, { c: 1, p: 6, d: '2026-09-14', q: 1, v: '活動', price: 0 },
  { c: 2, p: 4, d: '2026-09-26', q: 1, v: '新購', price: 1500, tags: ['秋季特惠'] },
  { c: 3, p: 2, d: '2026-10-01', q: 1, v: '享回購', price: 2400 },
  { c: 4, p: 6, d: '2026-09-14', q: 1, v: '活動', price: 0 },
  { c: 5, p: 3, d: '2026-09-18', q: 2, v: '享回購', price: 680, tags: ['買四送一'] },
  { c: 6, p: 2, d: '2026-09-25', q: 1, v: '享回購', price: 2400 },
  { c: 7, p: 1, d: '2026-09-15', q: 1, v: '享回購', price: 1800 },
  { c: 8, p: 4, d: '2026-09-10', q: 1, v: '享回購', price: 1500 }
]);

export const initialCustomers: Customer[] = load('customers', [
  {
    id: 1, name: '林美華', ini: '林', tags: ['VIP', '美容', '腸胃'], last: 3, phone: '0912-345-678', bd: '03/15', mar: '已婚', kids: '2 個孩子', mno: 'TW1234567', pw: 'Lin0315!', src: '朋友介紹', need: '腸胃保養', also: '王小明', note: '喜歡下午聯絡',
    leads: [{ n: '林美玲', rel: '妹妹', need: '產後想瘦身' }],
    sv: [{ d: '2026-10-05', w: '電話', x: '想把每月 2 盒改成 1 盒' }]
  },
  {
    id: 2, name: '陳志明', ini: '陳', tags: ['新客', '腸胃'], last: 12, phone: '0933-222-111', bd: '11/02', mar: '未婚', kids: '無', mno: '', pw: '', src: '講座', need: '消化不良', also: '', note: '',
    leads: [],
    sv: [{ d: '2026-09-26', w: '見面', x: '咖啡廳介紹產品，當場買酵素飲' }]
  },
  {
    id: 3, name: 'Nguyễn Thị Lan', ini: 'Lan', tags: ['VIP', '美容', '喜歡 LINE'], last: 1, phone: '+84 90 123 4567', bd: '07/21', mar: '已婚', kids: '1 個', mno: 'VN7788990', pw: 'Lan2026#', src: 'Facebook', need: '美白、抗老', also: '', note: '越南客戶，用 Zalo',
    leads: [],
    sv: [{ d: '2026-10-07', w: 'Zalo', x: '詢問膠原蛋白新口味' }]
  },
  {
    id: 4, name: '王小芬', ini: '王', tags: ['潛在', '愛聽講座'], last: 45, phone: '0988-765-432', bd: '01/09', mar: '未婚', kids: '無', mno: '', pw: '', src: '林美華介紹', need: '睡眠品質', also: '', note: '',
    leads: [],
    sv: [{ d: '2026-08-24', w: '電話', x: '初次聯繫，邀請講座' }]
  },
  {
    id: 5, name: '張大偉', ini: '張', tags: ['回購', '價格敏感'], last: 20, phone: '0910-000-888', bd: '05/30', mar: '已婚', kids: '1 個', mno: 'TW2233445', pw: 'Chang530', src: '同事', need: '頭皮保養', also: '李佳玲', note: '晚上才方便',
    leads: [],
    sv: [{ d: '2026-09-18', w: '電話', x: '出國兩個月，想暫停' }]
  },
  {
    id: 6, name: '黃淑芬', ini: '黃', tags: ['回購', '美容', '愛聽講座'], last: 8, phone: '0922-111-333', bd: '10/20', mar: '已婚', kids: '2 個', mno: 'TW5566778', pw: 'Huang1020', src: '講座', need: '保濕', also: '', note: '生日快到了',
    leads: [{ n: '黃先生', rel: '先生', need: '血壓、體力' }],
    sv: [{ d: '2026-09-30', w: 'LINE', x: '報名秋季美容體驗會' }]
  }
]);

export const initialReminders: Reminder[] = load('reminders', [
  { id: 1, cid: 1, d: TODAY, t: '14:00', n: '確認益生菌回購數量', k: '享回購' },
  { id: 2, cid: 2, d: '2026-10-07', t: '10:00', n: '送酵素試用包', k: '跟進' },
  { id: 3, cid: 3, d: '2026-10-09', t: '09:30', n: 'Zalo 確認首期出貨', k: '享回購' },
  { id: 4, cid: 5, d: TODAY, t: '19:00', n: '問 12 月是否恢復享回購', k: '享回購' },
]);

export const initialDone: Reminder[] = load('done', [
  { id: 90, cid: 4, d: TODAY, t: '09:00', n: '傳講座資訊給她', k: '跟進', at: '09:12' }
]);

export const initialSubscriptions: Subscription[] = load('subscriptions', [
  { id: 1, c: 1, p: 1, q: 1, cy: '每月', day: 20, st: '進行中', m: '變更', diff: '數量 2 盒 → 1 盒', ok: true, h: [{ d: '2026-10-05', x: '數量 2 盒 → 1 盒' }] },
  { id: 2, c: 3, p: 2, q: 1, cy: '每月', day: 9, st: '進行中', m: '新加入', diff: '新加入・每月 1 盒', ok: true, h: [{ d: '2026-10-01', x: '新加入：每月 1 盒' }] },
  { id: 3, c: 5, p: 3, q: 2, cy: '每 2 個月', day: 18, st: '暫停', m: '暫停', diff: '暫停 10–11 月', ok: false, h: [{ d: '2026-10-06', x: '暫停 10–11 月' }] },
  { id: 4, c: 6, p: 2, q: 1, cy: '每月', day: 25, st: '進行中', m: '無異動', diff: '', ok: true, h: [{ d: '2026-03-25', x: '新加入' }] }
]);

export const initialSchedules: Schedule[] = load('schedules', [
  { d: '2026-10-08', t: '11:00', x: '團隊早會' },
  { d: '2026-10-10', t: '14:00', x: '健康講座・台北場' },
]);

export const saveAll = () => {
  localStorage.setItem('crm_userProfile', JSON.stringify(userProfile));
  localStorage.setItem('crm_products', JSON.stringify(initialProducts));
  localStorage.setItem('crm_purchases', JSON.stringify(initialPurchases));
  localStorage.setItem('crm_customers', JSON.stringify(initialCustomers));
  localStorage.setItem('crm_reminders', JSON.stringify(initialReminders));
  localStorage.setItem('crm_done', JSON.stringify(initialDone));
  localStorage.setItem('crm_subscriptions', JSON.stringify(initialSubscriptions));
  localStorage.setItem('crm_schedules', JSON.stringify(initialSchedules));
};

export const getExportPayload = () => {
  return {
    appName: '直銷團隊專屬 CRM',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userProfile,
    products: initialProducts,
    purchases: initialPurchases,
    customers: initialCustomers,
    reminders: initialReminders,
    done: initialDone,
    subscriptions: initialSubscriptions,
    schedules: initialSchedules,
  };
};

export const importBackupPayload = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new Error('檔案格式錯誤：無法辨識的備份資料');
  }

  const counts = {
    customers: 0,
    purchases: 0,
    products: 0,
    subscriptions: 0
  };

  if (data.userProfile && typeof data.userProfile === 'object') {
    Object.assign(userProfile, data.userProfile);
  }

  if (Array.isArray(data.customers)) {
    initialCustomers.length = 0;
    initialCustomers.push(...data.customers);
    counts.customers = data.customers.length;
  }

  if (Array.isArray(data.purchases)) {
    initialPurchases.length = 0;
    initialPurchases.push(...data.purchases);
    counts.purchases = data.purchases.length;
  }

  if (Array.isArray(data.products)) {
    initialProducts.length = 0;
    initialProducts.push(...data.products);
    counts.products = data.products.length;
  }

  if (Array.isArray(data.subscriptions)) {
    initialSubscriptions.length = 0;
    initialSubscriptions.push(...data.subscriptions);
    counts.subscriptions = data.subscriptions.length;
  }

  if (Array.isArray(data.reminders)) {
    initialReminders.length = 0;
    initialReminders.push(...data.reminders);
  }

  if (Array.isArray(data.done)) {
    initialDone.length = 0;
    initialDone.push(...data.done);
  }

  if (Array.isArray(data.schedules)) {
    initialSchedules.length = 0;
    initialSchedules.push(...data.schedules);
  }

  saveAll();
  window.dispatchEvent(new Event('data-updated'));
  return counts;
};

