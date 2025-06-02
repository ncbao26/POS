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
    lowStockProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      console.log('Dashboard: Initializing...');
      setLoading(true);
      
      // Load basic data first
      await Promise.all([loadProducts(), loadCustomers()]);
      console.log('Dashboard: Basic data loaded');
      
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
      console.log('Dashboard: Loading dashboard data...');
      
      // Load all invoices and low stock products
      const [allInvoices, lowStock] = await Promise.all([
        invoicesAPI.getAll(),
        productsAPI.getLowStock(10)
      ]);

      console.log('Dashboard: Data loaded successfully', { invoices: allInvoices.length, lowStock: lowStock.length });

      // Calculate stats with real data
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const paidInvoices = allInvoices.filter(inv => inv.paymentStatus === 'PAID');
      
      const todayInvoices = paidInvoices.filter(inv => {
        const invoiceDate = new Date(inv.createdAt);
        return invoiceDate >= todayStart;
      });

      const monthlyInvoices = paidInvoices.filter(inv => {
        const invoiceDate = new Date(inv.createdAt);
        return invoiceDate >= monthStart;
      });

      const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      // Get products count from API directly since state might not be updated yet
      const allProducts = await productsAPI.getAll();
      console.log('Dashboard: Products loaded', { count: allProducts.length });

      setStats({
        monthlyRevenue,
        monthlyTransactions: monthlyInvoices.length,
        todayRevenue,
        todayTransactions: todayInvoices.length,
        totalProducts: allProducts.length,
        lowStockProducts: lowStock.length
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
        lowStockProducts: 0
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
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
            trend.type === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
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
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={`${stats.monthlyTransactions} giao dịch`}
          trend={{ type: 'up', value: '+12%' }}
        />
        
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(stats.todayRevenue)}
          icon={ArrowTrendingUpIcon}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={`${stats.todayTransactions} giao dịch`}
          trend={{ type: 'up', value: '+8%' }}
        />
        
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts}
          icon={CubeIcon}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle={`${stats.lowStockProducts} sắp hết hàng`}
          trend={{ type: 'down', value: '-3%' }}
        />
      </div>

      {/* Revenue Chart */}
      <div className="mt-8">
        <RevenueChart />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link 
            to="/invoices"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            <span>Tạo hóa đơn mới</span>
          </Link>
          <Link 
            to="/invoice-list"
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Danh sách hóa đơn</span>
          </Link>
          <Link 
            to="/products"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <CubeIcon className="h-5 w-5" />
            <span>Thêm sản phẩm</span>
          </Link>
          <Link 
            to="/reports"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
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