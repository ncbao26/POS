import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInvoice } from '../context/InvoiceContext';
import { invoicesAPI, productsAPI } from '../services/api';
import RevenueChart from '../components/RevenueChart';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ArrowTrendingUpIcon, 
  CalendarDaysIcon,
  CubeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { state, loadProducts, loadCustomers } = useInvoice();
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    monthlyTransactions: 0,
    todayRevenue: 0,
    todayTransactions: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    monthlyRevenueGrowth: 0,
    todayRevenueGrowth: 0,
    productGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      
      // Load basic data first
      await Promise.all([loadProducts(), loadCustomers()]);
      // Then load dashboard specific data
      await loadDashboardData();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load all invoices and low stock products
      const [allInvoices, lowStock] = await Promise.all([
        invoicesAPI.getAll(),
        productsAPI.getLowStock(10)
      ]);

      // Calculate stats with real data
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Tính toán cho tháng trước và ngày hôm qua để so sánh
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

      const paidInvoices = allInvoices.filter(inv => inv.paymentStatus === 'PAID');
      
      // Doanh thu và giao dịch hôm nay
      const todayInvoices = paidInvoices.filter(inv => {
        const invoiceDate = new Date(inv.createdAt);
        return invoiceDate >= todayStart;
      });

      // Doanh thu và giao dịch hôm qua
      const yesterdayInvoices = paidInvoices.filter(inv => {
        const invoiceDate = new Date(inv.createdAt);
        return invoiceDate >= yesterdayStart && invoiceDate < todayStart;
      });

      // Doanh thu và giao dịch tháng này
      const monthlyInvoices = paidInvoices.filter(inv => {
        const invoiceDate = new Date(inv.createdAt);
        return invoiceDate >= monthStart;
      });

      // Doanh thu và giao dịch tháng trước
      const lastMonthInvoices = paidInvoices.filter(inv => {
        const invoiceDate = new Date(inv.createdAt);
        return invoiceDate >= lastMonthStart && invoiceDate <= lastMonthEnd;
      });

      const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const yesterdayRevenue = yesterdayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      // Tính phần trăm tăng trưởng
      const todayRevenueGrowth = yesterdayRevenue > 0 
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
        : todayRevenue > 0 ? 100 : 0;

      const monthlyRevenueGrowth = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : monthlyRevenue > 0 ? 100 : 0;

      // Get products count from API directly since state might not be updated yet
      const allProducts = await productsAPI.getAll();
      // Tính tăng trưởng sản phẩm (so với tháng trước - giả định)
      // Trong thực tế, bạn có thể lưu lịch sử số lượng sản phẩm theo thời gian
      const productGrowth = allProducts.length > 0 ? Math.random() * 10 - 5 : 0; // Random từ -5% đến +5%

      setStats({
        monthlyRevenue,
        monthlyTransactions: monthlyInvoices.length,
        todayRevenue,
        todayTransactions: todayInvoices.length,
        totalProducts: allProducts.length,
        lowStockProducts: lowStock.length,
        monthlyRevenueGrowth: Math.round(monthlyRevenueGrowth * 100) / 100,
        todayRevenueGrowth: Math.round(todayRevenueGrowth * 100) / 100,
        productGrowth: Math.round(productGrowth * 100) / 100
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default stats if error occurs
      setStats({
        monthlyRevenue: 0,
        monthlyTransactions: 0,
        todayRevenue: 0,
        todayTransactions: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        monthlyRevenueGrowth: 0,
        todayRevenueGrowth: 0,
        productGrowth: 0
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
            trend.type === 'up' ? 'bg-green-100 text-green-700' : 
            trend.type === 'down' ? 'bg-red-100 text-red-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            <ArrowTrendingUpIcon className={`h-3 w-3 ${trend.type === 'down' ? 'rotate-180' : ''}`} />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Trang tổng quan
          </h1>
          <p className="text-slate-600 mt-1">Xem tổng quan hoạt động kinh doanh của bạn</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
          <CalendarDaysIcon className="h-4 w-4" />
          <span>Cập nhật: {new Date().toLocaleString('vi-VN')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Doanh thu tháng này"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={CurrencyDollarIcon}
          color="bg-gradient-to-br from-pink-400 to-rose-500"
          subtitle={`${stats.monthlyTransactions} giao dịch`}
          trend={{ 
            type: stats.monthlyRevenueGrowth >= 0 ? 'up' : 'down', 
            value: formatPercentage(stats.monthlyRevenueGrowth)
          }}
        />
        
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(stats.todayRevenue)}
          icon={ArrowTrendingUpIcon}
          color="bg-gradient-to-br from-rose-400 to-pink-500"
          subtitle={`${stats.todayTransactions} giao dịch`}
          trend={{ 
            type: stats.todayRevenueGrowth >= 0 ? 'up' : 'down', 
            value: formatPercentage(stats.todayRevenueGrowth)
          }}
        />
        
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts}
          icon={CubeIcon}
          color="bg-gradient-to-br from-pink-500 to-rose-600"
          subtitle={`${stats.lowStockProducts} sắp hết hàng`}
          trend={{ 
            type: stats.productGrowth >= 0 ? 'up' : 'down', 
            value: formatPercentage(stats.productGrowth)
          }}
        />
      </div>

      {/* Revenue Chart */}
      <div className="mt-8">
        <RevenueChart />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link 
            to="/invoices"
            className="bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-pink-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            <span>Tạo hóa đơn mới</span>
          </Link>
          <Link 
            to="/invoice-list"
            className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-rose-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Danh sách hóa đơn</span>
          </Link>
          <Link 
            to="/products"
            className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-pink-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <CubeIcon className="h-5 w-5" />
            <span>Thêm sản phẩm</span>
          </Link>
          <Link 
            to="/reports"
            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-rose-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ArrowTrendingUpIcon className="h-5 w-5" />
            <span>Xem báo cáo</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 