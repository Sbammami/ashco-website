import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, LogOut, Save, Loader2, ShieldAlert, Package, Check,
  TrendingUp, Users, Fuel, ChevronDown, X, Eye, Search,
  Truck, CheckCircle, Clock, AlertCircle, LayoutDashboard,
  DollarSign, Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, supabaseReady } from '@/lib/supabase';
import { formatNaira, formatLitres } from '@/lib/format';

/* ─── types ─────────────────────────────────────────────────── */
interface ProductRow { id: string; name: string; price_per_litre: number; min_litres: number; max_litres: number }
interface SettingsRow { id: string; flat_delivery_fee: number; returning_discount_rate: number }
type OrderStatus = 'pending' | 'processing' | 'in-transit' | 'delivered' | 'cancelled';
interface OrderRow {
  id: string; ref: string; name: string; phone: string;
  product_name: string; litres: number; price_per_litre: number;
  delivery_fee: number; discount: number; total: number;
  city: string; address: string; payment_method: string;
  status: OrderStatus; created_at: string;
}

/* ─── helpers ───────────────────────────────────────────────── */
const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'in-transit', 'delivered', 'cancelled'];

const statusMeta: Record<OrderStatus, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  pending:    { label: 'Pending',    bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
  processing: { label: 'Processing', bg: 'bg-blue-100',   text: 'text-blue-800',   icon: Clock },
  'in-transit':{ label: 'In Transit', bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
  delivered:  { label: 'Delivered',  bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-100',    text: 'text-red-800',    icon: X },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = statusMeta[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.bg} ${m.text}`}>
      <Icon className="w-3 h-3" /> {m.label}
    </span>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type Tab = 'overview' | 'orders' | 'pricing';

/* ─── component ─────────────────────────────────────────────── */
const Admin = () => {
  const navigate = useNavigate();
  const { ready, userId, isAdmin, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => { if (ready && !userId) navigate('/login'); }, [ready, userId, navigate]);

  const load = useCallback(async () => {
    if (!supabaseReady || !userId || !isAdmin) return;
    const [p, s, o] = await Promise.all([
      supabase.from('products').select('id, name, price_per_litre, min_litres, max_litres').order('sort_order'),
      supabase.from('settings').select('id, flat_delivery_fee, returning_discount_rate').eq('id', 'global').single(),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200),
    ]);
    setProducts((p.data as ProductRow[]) ?? []);
    setSettings((s.data as SettingsRow) ?? null);
    setOrders((o.data as OrderRow[]) ?? []);
    setLoading(false);
  }, [userId, isAdmin]);

  useEffect(() => { if (ready && userId && isAdmin) load(); else if (ready) setLoading(false); }, [ready, userId, isAdmin, load]);

  /* pricing save */
  async function saveAll() {
    if (!supabaseReady || !settings) return;
    setSaving(true); setSaveError(null); setSaved(false);
    try {
      for (const p of products) {
        const { error } = await supabase.from('products').update({ price_per_litre: p.price_per_litre, updated_at: new Date().toISOString() }).eq('id', p.id);
        if (error) throw error;
      }
      const { error: sErr } = await supabase.from('settings').update({ flat_delivery_fee: settings.flat_delivery_fee, returning_discount_rate: settings.returning_discount_rate, updated_at: new Date().toISOString() }).eq('id', 'global');
      if (sErr) throw sErr;
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (err: any) { setSaveError(err.message || 'Could not save.'); }
    finally { setSaving(false); }
  }

  /* order status update */
  async function updateStatus(orderId: string, newStatus: OrderStatus) {
    setUpdatingOrderId(orderId);
    await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    setUpdatingOrderId(null);
  }

  /* ── loading / access guards ── */
  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-ashco-green-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ashco-green-dark flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-ashco-black mb-2">Admins only</h1>
          <p className="text-sm text-gray-600 mb-6">Your account doesn't have admin access.</p>
          <Link to="/" className="inline-block bg-ashco-green text-white font-semibold px-5 py-2.5 rounded-xl">Back home</Link>
        </div>
      </div>
    );
  }

  /* ── derived stats ── */
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const totalLitres = orders.reduce((s, o) => s + Number(o.litres), 0);
  const uniqueCustomers = new Set(orders.map(o => o.phone)).size;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.ref.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── tabs config ── */
  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders',   label: `Orders${pendingCount ? ` (${pendingCount})` : ''}`, icon: Package },
    { id: 'pricing',  label: 'Pricing', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ashco-green via-ashco-green-dark to-black">
      {/* ── header ── */}
      <header className="sticky top-0 z-30 bg-ashco-green-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white min-w-0">
            <div className="w-9 h-9 bg-white rounded-lg p-1 shadow flex-shrink-0">
              <img src="/logo.png" alt="Ashco" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-extrabold tracking-tight hidden sm:block">ADMIN DASHBOARD</span>
          </div>
          {/* tabs */}
          <nav className="flex gap-1">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    tab === t.id ? 'bg-white text-ashco-black' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:block">{t.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ashco-black bg-white px-3 py-2 rounded-xl hover:bg-white/90 transition-colors">
              <Home className="w-4 h-4" /> <span className="hidden sm:block">View site</span>
            </Link>
            <button onClick={() => { signOut(); navigate('/'); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">

        {/* ══ OVERVIEW TAB ══════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div>
            <h1 className="font-display text-3xl font-extrabold text-white mb-1">Overview</h1>
            <p className="text-white/60 mb-8">Ashco Energy — operations at a glance</p>

            {/* stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Revenue', value: formatNaira(totalRevenue), icon: TrendingUp, color: 'text-ashco-yellow' },
                { label: 'Total Orders', value: orders.length.toLocaleString(), icon: Package, color: 'text-blue-400' },
                { label: 'Litres Sold', value: formatLitres(totalLitres), icon: Fuel, color: 'text-green-400' },
                { label: 'Customers', value: uniqueCustomers.toString(), icon: Users, color: 'text-purple-400' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">{s.label}</span>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="font-display text-2xl font-extrabold text-white">{s.value}</p>
                  </div>
                );
              })}
            </div>

            {/* status breakdown */}
            <div className="rounded-2xl bg-white/10 border border-white/10 p-5 mb-6">
              <h2 className="font-display font-bold text-white mb-4">Order Status Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {STATUS_OPTIONS.map(s => {
                  const count = orders.filter(o => o.status === s).length;
                  const m = statusMeta[s];
                  const Icon = m.icon;
                  return (
                    <div key={s} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${m.text.replace('text-', 'text-')}`} />
                      <p className="text-2xl font-display font-extrabold text-white">{count}</p>
                      <p className="text-xs text-white/50 mt-0.5">{m.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* latest 5 orders */}
            <div className="rounded-2xl bg-white/10 border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 className="font-display font-bold text-white">Latest Orders</h2>
                <button onClick={() => setTab('orders')} className="text-sm text-ashco-yellow hover:underline">View all →</button>
              </div>
              {orders.length === 0 ? (
                <p className="text-white/50 text-sm p-6">No orders yet.</p>
              ) : (
                <div className="divide-y divide-white/10">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between gap-4 px-5 py-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{o.name}</p>
                        <p className="text-xs text-white/50">{o.product_name} · {formatLitres(o.litres)} · {o.city}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-display font-bold text-ashco-yellow">{formatNaira(o.total)}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ ORDERS TAB ════════════════════════════════════════════════ */}
        {tab === 'orders' && (
          <div>
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <h1 className="font-display text-3xl font-extrabold text-white mb-1">Orders</h1>
                <p className="text-white/60">Track and update all customer orders</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white/50 text-xs">Total revenue</p>
                <p className="font-display text-xl font-extrabold text-ashco-yellow">{formatNaira(totalRevenue)}</p>
              </div>
            </div>

            {/* filter pills */}
            <div className="flex gap-2 flex-wrap mb-4">
              {(['all', ...STATUS_OPTIONS] as const).map(s => {
                const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      filterStatus === s ? 'bg-white text-ashco-black' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {s === 'all' ? 'All' : statusMeta[s].label} ({count})
                  </button>
                );
              })}
            </div>

            {/* search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by name, ref, or city…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50"
              />
            </div>

            {/* orders list */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center text-white/50">No orders match your filter.</div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map(o => (
                  <div key={o.id} className="rounded-xl bg-white p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-ashco-black">{o.name}</span>
                          <span className="text-sm text-gray-500">{o.phone}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">{o.product_name} · {formatLitres(o.litres)} → {o.address}, {o.city}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{o.ref} · {fmt(o.created_at)}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-display font-extrabold text-ashco-green">{formatNaira(o.total)}</div>
                        <div className="text-xs text-gray-400">{o.payment_method}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {/* status selector */}
                      <div className="flex gap-1.5 flex-wrap">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(o.id, s)}
                            disabled={updatingOrderId === o.id}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                              o.status === s
                                ? `${statusMeta[s].bg} ${statusMeta[s].text} ring-2 ring-offset-1 ring-ashco-green`
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            } disabled:opacity-50`}
                          >
                            {updatingOrderId === o.id && o.status === s ? <Loader2 className="w-3 h-3 animate-spin inline" /> : statusMeta[s].label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ashco-green hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ PRICING TAB ═══════════════════════════════════════════════ */}
        {tab === 'pricing' && (
          <div>
            <h1 className="font-display text-3xl font-extrabold text-white mb-1">Pricing</h1>
            <p className="text-white/60 mb-6">Changes save instantly and update the live site for everyone.</p>

            <div className="rounded-2xl bg-white p-5 sm:p-6 space-y-5">
              {/* product prices */}
              {products.length === 0 && <p className="text-gray-400 text-sm">No products found.</p>}
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-4 border-b last:border-0 pb-4 last:pb-0">
                  <div>
                    <div className="font-display font-bold text-ashco-black">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.min_litres.toLocaleString()}–{p.max_litres.toLocaleString()} L per order</div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₦</span>
                    <input
                      type="number"
                      value={p.price_per_litre}
                      onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, price_per_litre: Number(e.target.value) } : x))}
                      className="w-40 text-lg font-display font-bold text-ashco-black border-2 border-gray-200 rounded-xl pl-7 pr-14 py-2.5 focus:border-ashco-green outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/L</span>
                  </div>
                </div>
              ))}

              {/* delivery fee */}
              {settings && (
                <>
                  <div className="flex items-center justify-between gap-4 border-b pb-4">
                    <div>
                      <div className="font-display font-bold text-ashco-black">Flat delivery fee</div>
                      <div className="text-xs text-gray-500">Charged once per order</div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₦</span>
                      <input
                        type="number"
                        value={settings.flat_delivery_fee}
                        onChange={e => setSettings({ ...settings, flat_delivery_fee: Number(e.target.value) })}
                        className="w-40 text-lg font-display font-bold text-ashco-black border-2 border-gray-200 rounded-xl pl-7 pr-4 py-2.5 focus:border-ashco-green outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-display font-bold text-ashco-black">Returning-customer discount</div>
                      <div className="text-xs text-gray-500">Percent off for loyal customers</div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <input
                        type="number"
                        value={Math.round(settings.returning_discount_rate * 100)}
                        onChange={e => setSettings({ ...settings, returning_discount_rate: Number(e.target.value) / 100 })}
                        className="w-40 text-lg font-display font-bold text-ashco-black border-2 border-gray-200 rounded-xl pl-4 pr-10 py-2.5 focus:border-ashco-green outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">%</span>
                    </div>
                  </div>
                </>
              )}

              {saveError && <p className="text-sm font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>}

              <button
                onClick={saveAll}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-ashco-green text-white font-display font-bold py-3.5 rounded-xl hover:bg-ashco-green-dark transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><Check className="w-5 h-5" /> Saved!</> : <><Save className="w-5 h-5" /> Save changes</>}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── order detail modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <p className="font-display font-bold text-ashco-black">{selectedOrder.ref}</p>
                <p className="text-xs text-gray-400">{fmt(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Customer</p>
                <p className="font-semibold text-ashco-black">{selectedOrder.name}</p>
                <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Delivery address</p>
                <p className="text-sm text-gray-700">{selectedOrder.address}, {selectedOrder.city}</p>
              </div>
              <div className="border rounded-xl divide-y text-sm">
                {[
                  ['Product', selectedOrder.product_name],
                  ['Quantity', formatLitres(selectedOrder.litres)],
                  ['Price / L', formatNaira(selectedOrder.price_per_litre)],
                  ['Delivery fee', formatNaira(selectedOrder.delivery_fee)],
                  ...(selectedOrder.discount > 0 ? [['Discount', `-${formatNaira(selectedOrder.discount)}`]] : []),
                  ['Payment', selectedOrder.payment_method],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-ashco-black">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 font-display font-bold bg-gray-50">
                  <span className="text-ashco-black">Total</span>
                  <span className="text-ashco-green">{formatNaira(selectedOrder.total)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Update status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      disabled={updatingOrderId === selectedOrder.id}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selectedOrder.status === s
                          ? `${statusMeta[s].bg} ${statusMeta[s].text} ring-2 ring-offset-1 ring-ashco-green`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {statusMeta[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
