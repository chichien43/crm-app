export interface Product {
  id: number;
  name: string;
  types: string[];
  price: number;
  date?: string;
  cy?: string;
}

export interface Customer {
  id: number;
  name: string;
  ini: string;
  tags: string[];
  last: number | null;
  phone: string;
  bd: string;
  mar: string;
  kids: string;
  mno: string;
  pw: string;
  src: string;
  need: string;
  also: string;
  note: string;
  leads: { n: string; rel: string; need: string }[];
  sv: { d: string; w: string; x: string }[];
}

export interface Purchase {
  c: number;
  p: number;
  d: string;
  q: number;
  v: string;
}

export interface Reminder {
  id: number;
  cid: number;
  d: string;
  t: string;
  n: string;
  k: string;
  at?: string;
}

export interface Subscription {
  id: number;
  c: number;
  p: number;
  q: number;
  cy: string;
  day: number;
  st: string;
  m: string;
  diff: string;
  ok: boolean;
  h: { d: string; x: string }[];
}

export interface Schedule {
  d: string;
  t: string;
  x: string;
}
