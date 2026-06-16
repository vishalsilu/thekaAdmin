import { useEffect, useState } from 'react';
import Topbar from "../components/layout/Topbar";
import StatCard from "../components/dashboard/StatCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import InventoryPanel from "../components/dashboard/InventoryPanel";
import OrdersTable from "../components/dashboard/OrdersTable";
import adminApi from '../config/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await adminApi.get('analytics');
        if (mounted && resp?.data?.success) {
          setAnalytics(resp.data.data || {});
        }
      } catch (err) {
        console.error('Dashboard analytics fetch failed', err?.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const stats = [
    { label: 'Total Orders', value: analytics ? analytics.totalOrders : '—', trend: `${analytics?.ordersToday || 0} today`, trendUp: true },
    { label: 'Delivered Revenue', value: analytics ? `₹${(analytics.totalRevenue||0).toLocaleString('en-IN')}` : '—', trend: '', trendUp: true },
    { label: 'Delivered Orders', value: analytics ? analytics.deliveredOrders : '—', trend: '', trendUp: true },
    { label: 'Avg Delivered Value', value: analytics ? `₹${(analytics.avgOrderValue||0).toLocaleString('en-IN')}` : '—', trend: '', trendUp: true }
  ];

  const chartData = analytics?.chart?.length ? analytics.chart : [];
  if (loading) {
    return (
      <>
        <Topbar variant="dashboard" />
        <div className="p-8 text-center text-stone-500">Loading dashboard metrics...</div>
      </>
    );
  }

  return (
    <>
      <Topbar variant="dashboard" />

      <section className="mt-8 flex flex-col items-start justify-between gap-3 xl:flex-row xl:items-center">
        <div>
          <h2 className="m-0 text-5xl font-bold tracking-tight">Sales Overview</h2>
          <p className="mt-1 text-stone-500">Performance metrics for the current fiscal period.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="border border-stone-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.08em]"
            onClick={() => {
              if (analytics) {
                const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `dashboard-analytics-${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }
            }}>
            Export Data
          </button>
          <button
            type="button"
            className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white"
            onClick={() => window.print()}>
            Generate Report
          </button>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 2xl:grid-cols-[2fr_1fr]">
        <RevenueChart data={chartData} />
        <InventoryPanel lowStock={analytics?.lowStock || []} topProducts={analytics?.topProducts || []} />
      </section>

      <OrdersTable recentOrders={analytics?.recentOrders || []} />

      <footer className="mt-5 flex flex-col gap-2 border-t border-stone-200 pt-3 text-[11px] uppercase text-stone-400 md:flex-row md:items-center md:justify-between">
        <span>© 2024 LSSentials Global Branding, All Rights Reserved.</span>
        <div className="flex gap-4">
          <span>System Status</span>
          <span>Security</span>
          <span>Legal</span>
        </div>
      </footer>
    </>
  );
};

export default Dashboard;
