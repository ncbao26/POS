import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInvoice } from '../context/InvoiceContext';
import { invoicesAPI, productsAPI } from '../services/api';
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ArrowTrendingUpIcon, 
  UsersIcon,
  CalendarDaysIcon,
  CubeIcon
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
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
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

      // Set recent invoices (last 5)
      setRecentInvoices(allInvoices.slice(0, 5));
      
      // Set low stock products (first 4)
      setLowStockProducts(lowStock.slice(0, 4));

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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <ShoppingBagIcon className="h-5 w-5 mr-2 text-blue-600" />
            Giao dịch gần đây
          </h3>
          <div className="space-y-4">
            {recentInvoices.length > 0 ? recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {invoice.customer ? `${invoice.customer.name}${invoice.customer.phone ? ` - ${invoice.customer.phone}` : ''}` : 'Khách lẻ'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(invoice.createdAt).toLocaleString('vi-VN', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - 
                      {invoice.paymentMethod === 'CASH' ? ' Tiền mặt' : 
                       invoice.paymentMethod === 'CARD' ? ' Thẻ tín dụng' : 
                       invoice.paymentMethod === 'TRANSFER' ? ' Chuyển khoản' : ` ${invoice.paymentMethod}`}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-lg">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                <ShoppingBagIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Chưa có giao dịch nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <CubeIcon className="h-5 w-5 mr-2 text-orange-600" />
            Cảnh báo tồn kho
          </h3>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-orange-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    product.stock === 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                  }`}>
                    <CubeIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">Giá: {formatCurrency(product.price)}</p>
                  </div>
                </div>
                <span className={`font-semibold px-3 py-1 rounded-lg ${
                  product.stock === 0 
                    ? 'text-red-700 bg-red-100' 
                    : 'text-yellow-700 bg-yellow-100'
                }`}>
                  {product.stock} còn lại
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-500">
                <CubeIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Tất cả sản phẩm đều đủ hàng</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/invoices"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            <span>Tạo hóa đơn mới</span>
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