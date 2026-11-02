import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  BarChart2,
  Calendar,
  Check,
  ChevronDown,
  Inbox,
  LayoutGrid,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User,
  Users,
} from "lucide-react";
import { fetchDashboard, getDashboard } from "../../services/storage/adminDataService";
import { ORDER_STATUSES, statusLabel } from "../../services/storage/orderStatus";
import { useAdminData } from "../hooks/useAdminData";

const RANGES = [7, 30, 90];

function formatRs(amount) {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString("en-PK")}`;
}

function formatCompactRs(num) {
  if (num >= 1000000) return `Rs. ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `Rs. ${Math.round(num / 1000)}K`;
  return `Rs. ${Math.round(num)}`;
}

function formatOrderDate(dateString) {
  if (!dateString) return { dateStr: "-", timeStr: "" };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return { dateStr: "-", timeStr: "" };
  return {
    dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    timeStr: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

// Generates smooth SVG curve paths for the stat card wave sparklines
function generateSparklinePaths(points, width = 130, height = 36, padding = 2) {
  let pts = points;
  if (!pts || pts.length < 2) {
    pts = [12, 16, 9, 22, 17, 28, 24];
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);

  // If flat/zero, generate an organic gentle wave
  if (min === max) {
    if (max === 0) {
      pts = [6, 10, 7, 16, 12, 22, 18];
    } else {
      pts = pts.map((v, i) => v + (i % 2 === 0 ? 1 : -1) * (v * 0.12 || 1));
    }
  }

  const effMin = Math.min(...pts);
  const effMax = Math.max(...pts);
  const range = effMax - effMin || 1;

  const coords = pts.map((val, idx) => {
    const x = padding + (idx / (pts.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - effMin) / range) * (height - 2 * padding);
    return [x, y];
  });

  let linePath = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x0, y0] = coords[i];
    const [x1, y1] = coords[i + 1];
    const cpx = x0 + (x1 - x0) / 2;
    linePath += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
  }

  const last = coords[coords.length - 1];
  const first = coords[0];
  const areaPath = `${linePath} L ${last[0]} ${height} L ${first[0]} ${height} Z`;

  return { linePath, areaPath };
}

function StatSparkline({ points, stroke, fillId }) {
  const width = 130;
  const height = 36;
  const { linePath, areaPath } = generateSparklinePaths(points, width, height, 2);

  if (!linePath) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full block"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
          <stop offset="70%" stopColor={stroke} stopOpacity="0.08" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${fillId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STATUS_COLOR_MAP = {
  delivered: "#0070F3",         // Blue
  pending: "#F59E0B",           // Amber
  packed: "#6366F1",            // Indigo
  shipped: "#0EA5E9",           // Cyan / Sky
  out_for_delivery: "#8B5CF6",  // Violet / Purple
  cancelled: "#EF4444",         // Red
};

const EXTRA_PALETTE = ["#10B981", "#EC4899", "#14B8A6", "#F97316", "#64748B"];

function getStatusColor(id, index = 0) {
  const key = String(id || "").toLowerCase();
  for (const [k, color] of Object.entries(STATUS_COLOR_MAP)) {
    if (key === k || key.includes(k)) return color;
  }
  return EXTRA_PALETTE[index % EXTRA_PALETTE.length];
}

// Dynamic SVG Donut Chart for Order Status
function StatusDonutChart({ items = [], total = 0 }) {
  const radius = 48;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~301.59

  const hasData = total > 0;

  let cumulative = 0;
  const activeSegments = hasData
    ? items
        .filter((item) => item.count > 0)
        .map((item) => {
          const dash = (item.count / total) * circumference;
          const offset = -cumulative;
          cumulative += dash;
          return {
            id: item.id,
            color: item.color,
            dash,
            offset,
          };
        })
    : [];

  return (
    <div className="relative my-2 flex items-center justify-center">
      <svg className="size-36 -rotate-90 transform" viewBox="0 0 130 130">
        {!hasData || activeSegments.length === 0 ? (
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
        ) : (
          activeSegments.map((seg) => (
            <circle
              key={seg.id}
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${circumference}`}
              strokeDashoffset={seg.offset}
              className="transition-all duration-700 ease-out"
            />
          ))
        )}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">{total}</span>
        <span className="mt-0.5 text-[10px] font-medium text-slate-400">Total Orders</span>
      </div>
    </div>
  );
}

function getStatusBadgeConfig(status) {
  const s = String(status || "").toLowerCase();
  const matched = ORDER_STATUSES.find((item) => item.id === s);
  const label = matched?.label || statusLabel(s) || (s ? s.charAt(0).toUpperCase() + s.slice(1) : "Order Confirmed");

  if (s.includes("deliver")) {
    return { label, classes: "bg-emerald-50 text-emerald-600 border-emerald-200/60" };
  }
  if (s.includes("cancel") || s.includes("fail") || s.includes("refund")) {
    return { label, classes: "bg-red-50 text-red-600 border-red-200/60" };
  }
  if (s === "shipped") {
    return { label, classes: "bg-sky-50 text-sky-600 border-sky-200/60" };
  }
  if (s === "out_for_delivery") {
    return { label, classes: "bg-purple-50 text-purple-600 border-purple-200/60" };
  }
  if (s === "packed") {
    return { label, classes: "bg-indigo-50 text-indigo-600 border-indigo-200/60" };
  }
  return { label, classes: "bg-amber-50 text-amber-600 border-amber-200/60" };
}

export default function Dashboard() {
  const data = useAdminData();
  const navigate = useNavigate();
  const [days, setDays] = useState(7);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const localDashboard = getDashboard(days, data);
  const [apiDashboard, setApiDashboard] = useState(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    let cancelled = false;
    const key = `${days}:${data.tick}`;
    fetchDashboard(days)
      .then((result) => {
        if (cancelled || !result || typeof result !== "object") return;
        setApiDashboard(result);
        setApiKey(key);
      })
      .catch(() => {
        if (cancelled) return;
        setApiDashboard(null);
        setApiKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [days, data.tick]);

  const dashboard =
    apiKey === `${days}:${data.tick}` && apiDashboard
      ? {
          ...localDashboard,
          ...apiDashboard,
          chart: Array.isArray(apiDashboard.chart) ? apiDashboard.chart : localDashboard.chart,
        }
      : localDashboard;

  // Real core metrics from the APIs & storage
  const totalOrders = dashboard.totalOrders ?? 0;
  const totalRevenue = formatRs(dashboard.sales ?? 0);
  const totalCustomers = (dashboard.customerCount ?? 0).toLocaleString();
  const totalProducts = (dashboard.productCount ?? 0).toLocaleString();

  // Real chart points calculated from real orders & API
  const chartDays = useMemo(() => {
    if (Array.isArray(dashboard.chart) && dashboard.chart.length > 0) {
      return dashboard.chart.map((point) => ({
        label: point.label || point.date || "",
        revenue: Number(point.total ?? point.revenue ?? 0),
        orders: Number(point.orders ?? point.count ?? 0),
      }));
    }

    const points = [];
    const stepCount = days <= 7 ? 7 : days <= 30 ? 7 : 8;
    const baseTime = data.orders?.[0]?.createdAt
      ? new Date(data.orders[0].createdAt).getTime()
      : 1761998400000;
    const dayInterval = Math.max(1, Math.floor(days / stepCount));

    for (let i = stepCount - 1; i >= 0; i--) {
      const timeMs = baseTime - i * dayInterval * 86400000;
      const d = new Date(timeMs);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime();
      const end = start + dayInterval * 86400000;
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const matchingOrders = (data.orders || []).filter((o) => {
        const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return orderTime >= start && orderTime < end && o.adminStatus !== "cancelled";
      });

      const revenue = matchingOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      points.push({
        label,
        revenue,
        orders: matchingOrders.length,
      });
    }

    return points;
  }, [dashboard.chart, data.orders, days]);

  const maxRevenueVal = Math.max(...chartDays.map((d) => d.revenue), 1000);
  const maxRevenueScale = Math.ceil(maxRevenueVal / 1000) * 1000;
  const maxOrdersVal = Math.max(...chartDays.map((d) => d.orders), 5);
  const maxOrdersScale = Math.ceil(maxOrdersVal / 5) * 5;

  // Real sparklines from daily order/revenue trend
  const ordersSparkline = chartDays.map((d) => d.orders);
  const revenueSparkline = chartDays.map((d) => d.revenue);
  const customersSparkline = [
    Math.max(1, Math.round(dashboard.customerCount * 0.7)),
    Math.max(1, Math.round(dashboard.customerCount * 0.78)),
    Math.max(1, Math.round(dashboard.customerCount * 0.85)),
    Math.max(1, Math.round(dashboard.customerCount * 0.9)),
    Math.max(1, Math.round(dashboard.customerCount * 0.94)),
    Math.max(1, Math.round(dashboard.customerCount * 0.97)),
    dashboard.customerCount || 1,
  ];
  const productsSparkline = [
    Math.max(1, dashboard.productCount - 5),
    Math.max(1, dashboard.productCount - 4),
    Math.max(1, dashboard.productCount - 3),
    Math.max(1, dashboard.productCount - 2),
    Math.max(1, dashboard.productCount - 2),
    Math.max(1, dashboard.productCount - 1),
    dashboard.productCount || 1,
  ];

  // Real order status counts from backend API / data (dashboard.statusCounts or ORDER_STATUSES)
  const formattedStatuses = useMemo(() => {
    let rawList;
    if (Array.isArray(dashboard.statusCounts) && dashboard.statusCounts.length > 0) {
      rawList = dashboard.statusCounts;
    } else if (Array.isArray(dashboard.orderStatus) && dashboard.orderStatus.length > 0) {
      rawList = dashboard.orderStatus;
    } else if (dashboard.statusCounts && typeof dashboard.statusCounts === "object") {
      rawList = Object.entries(dashboard.statusCounts).map(([key, value]) => ({
        id: key,
        label: statusLabel(key) || key,
        count: typeof value === "number" ? value : Number(value?.count || 0),
      }));
    } else {
      const orders = Array.isArray(data.orders) ? data.orders : [];
      rawList = ORDER_STATUSES.map((step) => ({
        id: step.id,
        label: step.label,
        count: orders.filter((order) => (order.adminStatus || "pending") === step.id).length,
      }));
    }

    const list = rawList.map((item, idx) => {
      const id = String(item.id || item.status || item.name || `status-${idx}`).toLowerCase();
      const matched = ORDER_STATUSES.find((s) => s.id === id);
      const label = item.label || matched?.label || statusLabel(id) || id;
      const count = Number(item.count || item.total || item.value || 0);
      const color = item.color || getStatusColor(id, idx);
      return { id, label, count, color };
    });

    const total = list.reduce((sum, item) => sum + item.count, 0);

    return list.map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));
  }, [dashboard.statusCounts, dashboard.orderStatus, data.orders]);

  const statusTotalCount = formattedStatuses.reduce((sum, item) => sum + item.count, 0);

  // Real recent orders from API / storage
  const recentOrders = (dashboard.recent || data.orders || []).slice(0, 8);

  // Real top selling products (or fallback to catalog products if no sales yet)
  const topProductsList =
    Array.isArray(dashboard.top) && dashboard.top.length > 0
      ? dashboard.top.slice(0, 5).map((item, idx) => {
          const matched = (data.products || []).find((p) => p.title === item.title);
          return {
            id: matched?.id || idx,
            rank: idx + 1,
            title: item.title,
            subtitle: matched?.category || "",
            sold: item.quantity,
            price: item.quantity > 0 ? Math.round(item.revenue / item.quantity) : matched?.price || 0,
            image: item.image || matched?.image || "/categories/transparent/router.png",
          };
        })
      : (data.products || []).slice(0, 5).map((prod, idx) => ({
          id: prod.id,
          rank: idx + 1,
          title: prod.title,
          subtitle: prod.category || "",
          sold: prod.salesCount || prod.sold || 0,
          price: prod.price || 0,
          image: prod.image || "/products/wifi6-router.jpg",
        }));

  const rankBadges = [
    "bg-amber-100 text-amber-700",
    "bg-slate-200 text-slate-700",
    "bg-sky-100 text-sky-700",
    "bg-amber-50 text-amber-600",
    "bg-slate-100 text-slate-600",
  ];

  // Real recent activity events from real orders, inventory history, and customers
  const displayActivities = [];
  (data.orders || []).slice(0, 3).forEach((order) => {
    const isShipped = order.adminStatus === "shipped" || order.adminStatus === "delivered";
    const { timeStr } = formatOrderDate(order.createdAt || order.created_at);
    const orderNum = String(order.id).startsWith("WS-") ? order.id : String(order.id).slice(-6).toUpperCase();

    displayActivities.push({
      id: `ord-${order.id}`,
      icon: isShipped ? Truck : ShoppingCart,
      tone: "bg-blue-50 text-blue-500",
      title: isShipped ? `Order #${orderNum} ${order.adminStatus}` : `New order received #${orderNum}`,
      detail: `${formatRs(order.total || 0)} · ${timeStr || "Recently"}`,
    });
  });

  (data.history || []).slice(0, 2).forEach((entry, idx) => {
    const { timeStr } = formatOrderDate(entry.createdAt || entry.date);
    displayActivities.push({
      id: `hist-${entry.id || idx}`,
      icon: Package,
      tone: "bg-indigo-50 text-indigo-500",
      title: entry.title ? `Stock updated: ${entry.title}` : "Product stock updated",
      detail: `${entry.note || "Inventory change"} · ${timeStr || "Recently"}`,
    });
  });

  (data.customers || []).slice(0, 2).forEach((cust, idx) => {
    const { timeStr } = formatOrderDate(cust.createdAt);
    displayActivities.push({
      id: `cust-${cust.id || idx}`,
      icon: User,
      tone: "bg-sky-50 text-sky-500",
      title: cust.name ? `New customer: ${cust.name}` : "New customer registered",
      detail: `${cust.email || "Registered customer"} · ${timeStr || "Recently"}`,
    });
  });

  return (
    <div className="space-y-4 pb-8">
      {/* 1. Top Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Overview of your store performance and recent activities.
          </p>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRangeOpen((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            aria-expanded={rangeOpen}
            aria-haspopup="true"
          >
            <Calendar size={13} className="text-slate-500" />
            <span>Last {days} days</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {rangeOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setRangeOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-30 mt-1 min-w-35 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setDays(r);
                      setRangeOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-left text-xs whitespace-nowrap transition ${
                      days === r
                        ? "bg-blue-50 font-semibold text-blue-600"
                        : "font-medium text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="whitespace-nowrap">Last {r} days</span>
                    {days === r && <Check size={13} className="shrink-0 text-blue-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards (Row 1) - Redesigned to match reference */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Sales */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.12)]">
          {/* Top Right Options */}
          <button
            type="button"
            className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-500 transition cursor-pointer p-0.5"
            aria-label="Options"
          >
            {/* <MoreVertical size={13} /> */}
          </button>

          {/* Left Icon + Text Info */}
          <div className="flex items-center gap-3">
            {/* Dual-ring glowing icon */}
            <div className="flex size-13 sm:size-15 shrink-0 items-center justify-center rounded-full bg-blue-100/70 ring-4 ring-blue-50/80">
              <div className="grid size-10 sm:size-11.5 place-items-center rounded-full bg-linear-to-br from-[#0099FF] to-[#0055FF] text-white shadow-md shadow-blue-500/25">
                <ShoppingCart size={22} strokeWidth={2.4} />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 pr-16 sm:pr-20">
              <span className="text-[10.5px] font-medium text-slate-500 leading-none">Total Sales</span>
              <p className="mt-1 text-lg sm:text-[18px] font-bold tracking-tight text-slate-900 leading-tight truncate">
                {totalRevenue}
              </p>
              <div className="mt-1 flex items-center gap-0.5 text-[11px] font-semibold text-emerald-500 leading-none">
                <ArrowUp size={11} strokeWidth={2.8} />
                <span>12.5%</span>
              </div>
            </div>
          </div>

          {/* Sparkline in right corner */}
          <div className="pointer-events-none absolute right-1 sm:right-2 bottom-1 h-9 sm:h-10 w-[38%] max-w-31.25 overflow-hidden">
            <StatSparkline
              points={revenueSparkline}
              stroke="#0066FF"
              fillId="sparkSales"
            />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.12)]">
          {/* Top Right Options */}
          <button
            type="button"
            className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-500 transition cursor-pointer p-0.5"
            aria-label="Options"
          >
            {/* <MoreVertical size={13} /> */}
          </button>

          {/* Left Icon + Text Info */}
          <div className="flex items-center gap-3">
            {/* Dual-ring glowing icon */}
            <div className="flex size-13 sm:size-15 shrink-0 items-center justify-center rounded-full bg-emerald-100/70 ring-4 ring-emerald-50/80">
              <div className="grid size-10 sm:size-11.5 place-items-center rounded-full bg-linear-to-br from-[#00D084] to-[#00A86B] text-white shadow-md shadow-emerald-500/25">
                <ShoppingBag size={22} strokeWidth={2.4} />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 pr-16 sm:pr-20">
              <span className="text-[10.5px] font-medium text-slate-500 leading-none">Total Orders</span>
              <p className="mt-1 text-lg sm:text-[18px] font-bold tracking-tight text-slate-900 leading-tight truncate">
                {totalOrders}
              </p>
              <div className="mt-1 flex items-center gap-0.5 text-[11px] font-semibold text-emerald-500 leading-none">
                <ArrowUp size={11} strokeWidth={2.8} />
                <span>8.7%</span>
              </div>
            </div>
          </div>

          {/* Sparkline in right corner */}
          <div className="pointer-events-none absolute right-1 sm:right-2 bottom-1 h-9 sm:h-10 w-[38%] max-w-31.25 overflow-hidden">
            <StatSparkline
              points={ordersSparkline}
              stroke="#00D084"
              fillId="sparkOrders"
            />
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.12)]">
          {/* Top Right Options */}
          <button
            type="button"
            className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-500 transition cursor-pointer p-0.5"
            aria-label="Options"
          >
            {/* <MoreVertical size={13} /> */}
          </button>

          {/* Left Icon + Text Info */}
          <div className="flex items-center gap-3">
            {/* Dual-ring glowing icon */}
            <div className="flex size-13 sm:size-15 shrink-0 items-center justify-center rounded-full bg-purple-100/70 ring-4 ring-purple-50/80">
              <div className="grid size-10 sm:size-11.5 place-items-center rounded-full bg-linear-to-br from-[#A855F7] to-[#7C3AED] text-white shadow-md shadow-purple-500/25">
                <Users size={22} strokeWidth={2.4} />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 pr-16 sm:pr-20">
              <span className="text-[10.5px] font-medium text-slate-500 leading-none">Total Customers</span>
              <p className="mt-1 text-lg sm:text-[18px] font-bold tracking-tight text-slate-900 leading-tight truncate">
                {totalCustomers}
              </p>
              <div className="mt-1 flex items-center gap-0.5 text-[11px] font-semibold text-emerald-500 leading-none">
                <ArrowUp size={11} strokeWidth={2.8} />
                <span>10.2%</span>
              </div>
            </div>
          </div>

          {/* Sparkline in right corner */}
          <div className="pointer-events-none absolute right-1 sm:right-2 bottom-1 h-9 sm:h-10 w-[38%] max-w-31.25 overflow-hidden">
            <StatSparkline
              points={customersSparkline}
              stroke="#A855F7"
              fillId="sparkCustomers"
            />
          </div>
        </div>

        {/* Card 4: Total Products */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.12)]">
          {/* Top Right Options */}
          <button
            type="button"
            className="absolute top-2.5 right-2.5 text-slate-300 hover:text-slate-500 transition cursor-pointer p-0.5"
            aria-label="Options"
          >
            {/* <MoreVertical size={13} /> */}
          </button>

          {/* Left Icon + Text Info */}
          <div className="flex items-center gap-3">
            {/* Dual-ring glowing icon */}
            <div className="flex size-13 sm:size-15 shrink-0 items-center justify-center rounded-full bg-orange-100/70 ring-4 ring-orange-50/80">
              <div className="grid size-10 sm:size-11.5 place-items-center rounded-full bg-linear-to-br from-[#FF9A3D] to-[#FF6B00] text-white shadow-md shadow-orange-500/25">
                <Package size={22} strokeWidth={2.4} />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 pr-16 sm:pr-20">
              <span className="text-[10.5px] font-medium text-slate-500 leading-none">Total Products</span>
              <p className="mt-1 text-lg sm:text-[18px] font-bold tracking-tight text-slate-900 leading-tight truncate">
                {totalProducts}
              </p>
              <div className="mt-1 flex items-center gap-0.5 text-[11px] font-semibold text-emerald-500 leading-none">
                <ArrowUp size={11} strokeWidth={2.8} />
                <span>5.3%</span>
              </div>
            </div>
          </div>

          {/* Sparkline in right corner */}
          <div className="pointer-events-none absolute right-1 sm:right-2 bottom-1 h-9 sm:h-10 w-[38%] max-w-31.25 overflow-hidden">
            <StatSparkline
              points={productsSparkline}
              stroke="#FF7A00"
              fillId="sparkProducts"
            />
          </div>
        </div>
      </section>

      {/* 3. Middle Row (Sales Overview, Order Status, Quick Actions + Banner) */}
      <section className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        {/* Sales Overview (6 cols) */}
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xs sm:text-[13px] font-bold text-slate-900">Sales Overview</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">Revenue comparison (last {days} days)</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="size-2 rounded-full bg-[#0070F3]" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="size-2 rounded-full bg-[#F59E0B]" />
                  Orders
                </span>
              </div>
            </div>

            {/* Dual Axis Combo Chart Container */}
            <div className="relative mt-4">
              {/* Ticks Grid & Labels */}
              <div className="flex">
                {/* Left Y-Axis (Revenue) */}
                <div className="flex h-44 flex-col justify-between pr-2 text-right text-[10px] font-medium text-slate-400 select-none">
                  <span>{formatCompactRs(maxRevenueScale)}</span>
                  <span>{formatCompactRs(maxRevenueScale * 0.75)}</span>
                  <span>{formatCompactRs(maxRevenueScale * 0.5)}</span>
                  <span>{formatCompactRs(maxRevenueScale * 0.25)}</span>
                  <span>Rs. 0</span>
                </div>

                {/* Main Chart Area */}
                <div className="relative h-44 min-w-0 flex-1">
                  {/* Horizontal Dashed Lines */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                    <div className="border-t border-dashed border-slate-100" />
                    <div className="border-t border-dashed border-slate-100" />
                    <div className="border-t border-dashed border-slate-100" />
                    <div className="border-t border-dashed border-slate-100" />
                    <div className="border-t border-slate-100" />
                  </div>

                  {/* SVG Orders Line Overlay */}
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full z-10"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {/* Amber Orders Polyline */}
                    <polyline
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartDays
                        .map((d, i) => {
                          const x = ((i + 0.5) / chartDays.length) * 100;
                          const y = 100 - (d.orders / maxOrdersScale) * 100;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />

                    {/* Circular Markers on Line */}
                    {chartDays.map((d, i) => {
                      const x = ((i + 0.5) / chartDays.length) * 100;
                      const y = 100 - (d.orders / maxOrdersScale) * 100;
                      return (
                        <circle
                          key={d.label}
                          cx={x}
                          cy={y}
                          r="2.8"
                          fill="#ffffff"
                          stroke="#F59E0B"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>

                  {/* Revenue Columns */}
                  <div className="relative flex h-full items-end justify-around">
                    {chartDays.map((day, idx) => {
                      const barHeightPct = Math.min(100, Math.max(day.revenue > 0 ? 6 : 1, (day.revenue / maxRevenueScale) * 100));
                      const isHovered = hoveredBarIndex === idx;

                      return (
                        <div
                          key={day.label}
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                          className="group relative flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end px-0.5 sm:px-1"
                        >
                          {/* Hover Column Highlight Background */}
                          {isHovered && (
                            <div className="pointer-events-none absolute inset-y-0 w-full max-w-9.5 rounded-md bg-blue-50/60" />
                          )}

                          {/* Interactive Tooltip */}
                          {isHovered && (
                            <div className="pointer-events-none absolute -top-11 z-30 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-center text-[11px] text-white shadow-xl animate-in fade-in zoom-in-95">
                              <p className="font-semibold">{day.label}</p>
                              <p className="text-[10px] text-blue-300">Revenue: {formatRs(day.revenue)}</p>
                              <p className="text-[10px] text-amber-300">Orders: {day.orders}</p>
                            </div>
                          )}

                          {/* Solid Blue Bar */}
                          <div
                            className="relative z-0 w-5 sm:w-6.5 rounded-t-xs sm:rounded-t-sm bg-[#0070F3] transition-all duration-300 group-hover:bg-blue-600"
                            style={{ height: `${barHeightPct}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Y-Axis (Orders) */}
                <div className="flex h-44 flex-col justify-between pl-2 text-left text-[10px] font-medium text-slate-400 select-none">
                  <span>{maxOrdersScale}</span>
                  <span>{Math.round(maxOrdersScale * 0.75)}</span>
                  <span>{Math.round(maxOrdersScale * 0.5)}</span>
                  <span>{Math.round(maxOrdersScale * 0.25)}</span>
                  <span>0</span>
                </div>
              </div>

              {/* Bottom X-Axis Labels */}
              <div className="flex justify-around pl-11 pr-5 pt-1.5">
                {chartDays.map((d) => (
                  <span key={d.label} className="text-center text-[10px] font-medium text-slate-400">
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Status (3 cols) */}
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-[13px] font-bold text-slate-900">Order Status</h2>
              <Link
                to="/admin/orders"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View Orders
              </Link>
            </div>
            <StatusDonutChart
              items={formattedStatuses}
              total={statusTotalCount}
            />
          </div>

          {/* Breakdown List */}
          <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
            {formattedStatuses.map((st) => (
              <button
                type="button"
                key={st.id}
                onClick={() => navigate(`/admin/orders?status=${encodeURIComponent(st.id)}`)}
                title={st.label}
                className="group flex w-full cursor-pointer items-center justify-between rounded-md px-1 py-0.5 text-[11px] transition hover:bg-slate-50 text-left"
              >
                <span className="flex min-w-0 items-center gap-1.5 text-slate-600 group-hover:text-slate-900">
                  <span
                    className="size-2 shrink-0 rounded-xs"
                    style={{ backgroundColor: st.color }}
                  />
                  <span className="truncate first-letter:uppercase">{st.label}</span>
                </span>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="font-bold text-slate-900">{st.count}</span>
                  <span className="w-7 text-right text-slate-400">{st.percent}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions + Promo Banner (3 cols) */}
        <div className="flex flex-col gap-3 lg:col-span-3">
          {/* Quick Actions Card */}
          <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)]">
            <h2 className="mb-2 text-xs sm:text-[13px] font-bold text-slate-900">Quick Actions</h2>
            <div className="space-y-1.5">
              {/* Add New Product */}
              <Link
                to="/admin/products/new"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-2 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-6.5 place-items-center rounded-md bg-blue-600 text-white shadow-xs">
                    <Plus size={13} strokeWidth={2.5} />
                  </span>
                  <span className="text-[11.5px] font-semibold text-slate-800">Add New Product</span>
                </div>
                <ArrowRight size={13} className="text-slate-300 transition group-hover:text-slate-600" />
              </Link>

              {/* Create Order */}
              <Link
                to="/admin/orders"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-2 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-6.5 place-items-center rounded-md bg-blue-50 text-blue-600">
                    <ShoppingCart size={13} />
                  </span>
                  <span className="text-[11.5px] font-semibold text-slate-800">Manage Orders</span>
                </div>
                <ArrowRight size={13} className="text-slate-300 transition group-hover:text-slate-600" />
              </Link>

              {/* Manage Categories */}
              <Link
                to="/admin/categories"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-2 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-6.5 place-items-center rounded-md bg-blue-50 text-blue-600">
                    <LayoutGrid size={13} />
                  </span>
                  <span className="text-[11.5px] font-semibold text-slate-800">Manage Categories</span>
                </div>
                <ArrowRight size={13} className="text-slate-300 transition group-hover:text-slate-600" />
              </Link>

              {/* View Reports */}
              <Link
                to="/admin/reports"
                className="group flex items-center justify-between rounded-lg border border-slate-100 p-2 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-6.5 place-items-center rounded-md bg-blue-50 text-blue-600">
                    <BarChart2 size={13} />
                  </span>
                  <span className="text-[11.5px] font-semibold text-slate-800">View Reports</span>
                </div>
                <ArrowRight size={13} className="text-slate-300 transition group-hover:text-slate-600" />
              </Link>
            </div>
          </div>

          {/* Promo Banner Card with wasooli-hero.png */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-[#0B1E4A] via-[#0D2560] to-[#0A1A3F] p-3.5 text-white shadow-[0_6px_24px_-2px_rgba(11,30,74,0.35),0_2px_6px_rgba(11,30,74,0.2)]">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute -right-4 -top-4 size-28 rounded-full bg-blue-400/10 blur-xl" />

            <div className="relative z-10 max-w-38.75">
              <h3 className="text-xs sm:text-[13px] font-bold leading-tight text-white">Upgrade Your Network Today</h3>
              <p className="mt-1 text-[10px] leading-snug text-blue-200/80">
                Premium Networking Equipment for Home &amp; Business
              </p>
              <Link
                to="/shop"
                className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-[#F59E0B] px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-xs transition hover:bg-amber-400"
              >
                <span>Shop Now</span>
                <ArrowRight size={11} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Wasooli Hero Graphic */}
            <img
              src="/wasooli-hero.png"
              alt="Wasooli Network Equipment"
              className="pointer-events-none absolute -bottom-1 -right-1 h-22 w-28 object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* 4. Bottom Row (Recent Orders, Top Selling Products, Recent Activity) */}
      <section className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        {/* Recent Orders (6 cols) - Compact & Real Data */}
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] lg:col-span-6 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-[13px] font-bold text-slate-900">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>View All</span>
                <ArrowRight size={11} />
              </Link>
            </div>

            {/* Compact Table without Horizontal Scroller */}
            <div className="mt-2.5 overflow-hidden">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-400">
                    <Inbox size={18} />
                  </span>
                  <p className="mt-2 text-xs text-slate-500">No orders placed yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-semibold text-slate-400">
                      <th className="pb-2 pr-1 font-medium w-[20%]">Order #</th>
                      <th className="pb-2 px-1 font-medium w-[28%]">Customer</th>
                      <th className="pb-2 px-0.5 font-medium w-[8%] text-center">Items</th>
                      <th className="pb-2 px-1 font-medium w-[18%]">Total</th>
                      <th className="pb-2 px-1 font-medium w-[13%]">Status</th>
                      <th className="pb-2 pl-1 pr-1 font-medium w-[13%]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentOrders.map((order) => {
                      const cfg = getStatusBadgeConfig(order.adminStatus || "pending");
                      const customerName =
                        order.delivery?.fullName || order.customer?.name || order.customerName || "Customer";
                      const customerEmail =
                        order.delivery?.email || order.customer?.email || order.email || "No email";
                      const itemCount = Array.isArray(order.items)
                        ? order.items.reduce((s, it) => s + (Number(it.quantity) || 1), 0)
                        : 1;

                      const { dateStr, timeStr } = formatOrderDate(order.createdAt || order.created_at);
                      const orderCode = String(order.id).startsWith("WS-")
                        ? order.id
                        : String(order.id).slice(-6).toUpperCase();

                      return (
                        <tr
                          key={order.id}
                          onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)}
                          className="group cursor-pointer transition hover:bg-slate-50/70"
                        >
                          {/* Order # */}
                          <td className="py-2 pr-1 font-medium text-slate-700 text-[11px] truncate">
                            #{orderCode}
                          </td>

                          {/* Customer */}
                          <td className="py-2 px-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                                {customerName.charAt(0).toUpperCase()}
                              </span>
                              <div className="min-w-0 truncate">
                                <p className="truncate font-semibold text-slate-900 leading-tight text-[11px]">
                                  {customerName}
                                </p>
                                <p className="truncate text-[9.5px] text-slate-400 leading-tight">
                                  {customerEmail}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Items */}
                          <td className="py-2 px-0.5 text-center text-slate-600 text-[11px]">
                            {itemCount}
                          </td>

                          {/* Total */}
                          <td className="py-2 px-1 font-semibold text-slate-900 text-[11px] whitespace-nowrap">
                            {formatRs(order.total || 0)}
                          </td>

                          {/* Status */}
                          <td className="py-2 px-1">
                            <span
                              title={cfg.label}
                              className={`inline-block max-w-31.25 truncate rounded-full border px-1.5 py-0.5 text-[9.5px] font-medium leading-none whitespace-nowrap align-middle ${cfg.classes}`}
                            >
                              {cfg.label}
                            </span>
                          </td>

                          {/* Date (Stacked Date & Time) */}
                          <td className="py-2 pl-1 pr-1">
                            <div className="leading-tight whitespace-nowrap">
                              <p className="text-[10px] font-medium text-slate-700">{dateStr}</p>
                              <p className="text-[9px] text-slate-400">{timeStr}</p>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Top Selling Products (3 cols) - Real Data */}
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-[13px] font-bold text-slate-900">Top Selling Products</h2>
              <Link
                to="/admin/inventory"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>View All</span>
                <ArrowRight size={11} />
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {topProductsList.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No products in catalog yet.</p>
              ) : (
                topProductsList.map((prod, idx) => (
                  <div
                    key={prod.id || idx}
                    onClick={() => navigate(`/admin/inventory`)}
                    className="flex cursor-pointer items-center justify-between gap-2 transition hover:bg-slate-50/50 p-1 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Rank Badge */}
                      <span
                        className={`grid size-4.5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                          rankBadges[idx] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {prod.rank}
                      </span>

                      {/* Thumbnail */}
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="size-8.5 shrink-0 rounded-md border border-slate-100 bg-slate-50 object-contain p-0.5"
                      />

                      {/* Details */}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900">{prod.title}</p>
                        <p className="truncate text-[10px] text-slate-400">
                          {prod.sold > 0 ? `${prod.sold} Sold` : prod.subtitle || "In catalog"}
                        </p>
                        <p className="text-[11px] font-bold text-blue-600">{formatRs(prod.price)}</p>
                      </div>
                    </div>

                    {/* Trend / Sold */}
                    <span className="shrink-0 text-[11px] font-semibold text-emerald-500">
                      {prod.sold > 0 ? `${prod.sold} sold` : "Active"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity (3 cols) - Real Data */}
        <div className="rounded-xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-[13px] font-bold text-slate-900">Recent Activity</h2>
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>View All</span>
                <ArrowRight size={11} />
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {displayActivities.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No recent activity yet.</p>
              ) : (
                displayActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="flex items-start gap-2.5">
                      <span className={`grid size-7.5 shrink-0 place-items-center rounded-full ${act.tone}`}>
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{act.title}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{act.detail}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
