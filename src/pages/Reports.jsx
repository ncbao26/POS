import { useState, useEffect } from 'react';
import { invoicesAPI, productsAPI, customersAPI } from '../services/api';
import { 
  CalendarDaysIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Reports = () => {
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // New states for recent transactions and low stock
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  
  // States for comparison data
  const [comparisonStats, setComparisonStats] = useState({
    revenueGrowth: 0,
    transactionGrowth: 0,
    avgOrderGrowth: 0,
    discountGrowth: 0
  });

  useEffect(() => {
    loadReports();
    loadRecentData(); // Load recent transactions and low stock
  }, [dateRange, startDate, endDate, paymentStatus]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadReports();
      loadRecentData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dateRange, startDate, endDate, paymentStatus]);

  // Refresh when user focuses on window (comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      loadReports();
      loadRecentData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dateRange, startDate, endDate, paymentStatus]);

  const loadReports = async () => {
    try {
      setLoading(true);
      let data;
      
      // Add timestamp to avoid caching
      const timestamp = new Date().getTime();
      
      if (dateRange === 'custom' && startDate && endDate) {
        // Custom date range
        data = await invoicesAPI.getByDateRange(startDate, endDate, paymentStatus || null);
      } else if (dateRange !== 'all') {
        // Predefined date ranges
        const today = new Date();
        let calculatedStartDate, calculatedEndDate;

        switch (dateRange) {
          case 'today':
            calculatedStartDate = calculatedEndDate = today.toISOString().split('T')[0];
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            calculatedStartDate = weekAgo.toISOString().split('T')[0];
            calculatedEndDate = today.toISOString().split('T')[0];
            break;
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            calculatedStartDate = monthStart.toISOString().split('T')[0];
            calculatedEndDate = today.toISOString().split('T')[0];
            break;
          case 'year':
            const yearStart = new Date(today.getFullYear(), 0, 1);
            calculatedStartDate = yearStart.toISOString().split('T')[0];
            calculatedEndDate = today.toISOString().split('T')[0];
            break;
          default:
            calculatedStartDate = calculatedEndDate = null;
        }

        if (calculatedStartDate && calculatedEndDate) {
          data = await invoicesAPI.getByDateRange(calculatedStartDate, calculatedEndDate, paymentStatus || null);
        } else {
          data = await invoicesAPI.getAll();
        }
      } else {
        // All invoices - always get fresh data
        if (paymentStatus) {
          data = await invoicesAPI.getByDateRange(null, null, paymentStatus);
        } else {
          data = await invoicesAPI.getAll();
        }
      }

      console.log('Reports data loaded:', data?.length || 0, 'invoices at', new Date().toLocaleTimeString());
      setInvoices(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      
      // Calculate comparison stats
      await calculateComparisonStats(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Không thể tải báo cáo. Vui lòng thử lại.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateComparisonStats = async (currentData) => {
    try {
      // Get comparison period data
      const today = new Date();
      let comparisonStartDate, comparisonEndDate;
      
      switch (dateRange) {
        case 'today':
          // So sánh với hôm qua
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          comparisonStartDate = comparisonEndDate = yesterday.toISOString().split('T')[0];
          break;
        case 'week':
          // So sánh với tuần trước
          const twoWeeksAgo = new Date(today);
          twoWeeksAgo.setDate(today.getDate() - 14);
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          comparisonStartDate = twoWeeksAgo.toISOString().split('T')[0];
          comparisonEndDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          // So sánh với tháng trước
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          comparisonStartDate = lastMonthStart.toISOString().split('T')[0];
          comparisonEndDate = lastMonthEnd.toISOString().split('T')[0];
          break;
        case 'year':
          // So sánh với năm trước
          const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
          const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
          comparisonStartDate = lastYearStart.toISOString().split('T')[0];
          comparisonEndDate = lastYearEnd.toISOString().split('T')[0];
          break;
        case 'custom':
          if (startDate && endDate) {
            // Tính khoảng thời gian tương đương trước đó
            const start = new Date(startDate);
            const end = new Date(endDate);
            const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            
            const comparisonEnd = new Date(start);
            comparisonEnd.setDate(comparisonEnd.getDate() - 1);
            const comparisonStart = new Date(comparisonEnd);
            comparisonStart.setDate(comparisonStart.getDate() - daysDiff);
            
            comparisonStartDate = comparisonStart.toISOString().split('T')[0];
            comparisonEndDate = comparisonEnd.toISOString().split('T')[0];
          }
          break;
        default:
          // Không có so sánh cho 'all'
          setComparisonStats({
            revenueGrowth: 0,
            transactionGrowth: 0,
            avgOrderGrowth: 0,
            discountGrowth: 0
          });
          return;
      }

      if (comparisonStartDate && comparisonEndDate) {
        const comparisonData = await invoicesAPI.getByDateRange(comparisonStartDate, comparisonEndDate, paymentStatus || null);
        
        // Calculate current stats
        const currentStats = calculateStats(currentData);
        const comparisonStatsData = calculateStats(comparisonData);
        
        // Calculate growth percentages
        const revenueGrowth = comparisonStatsData.totalRevenue > 0 
          ? ((currentStats.totalRevenue - comparisonStatsData.totalRevenue) / comparisonStatsData.totalRevenue) * 100 
          : currentStats.totalRevenue > 0 ? 100 : 0;
          
        const transactionGrowth = comparisonStatsData.totalInvoices > 0 
          ? ((currentStats.totalInvoices - comparisonStatsData.totalInvoices) / comparisonStatsData.totalInvoices) * 100 
          : currentStats.totalInvoices > 0 ? 100 : 0;
          
        const avgOrderGrowth = comparisonStatsData.averageOrderValue > 0 
          ? ((currentStats.averageOrderValue - comparisonStatsData.averageOrderValue) / comparisonStatsData.averageOrderValue) * 100 
          : currentStats.averageOrderValue > 0 ? 100 : 0;
          
        const discountGrowth = comparisonStatsData.totalDiscount > 0 
          ? ((currentStats.totalDiscount - comparisonStatsData.totalDiscount) / comparisonStatsData.totalDiscount) * 100 
          : currentStats.totalDiscount > 0 ? 100 : 0;

        setComparisonStats({
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          transactionGrowth: Math.round(transactionGrowth * 100) / 100,
          avgOrderGrowth: Math.round(avgOrderGrowth * 100) / 100,
          discountGrowth: Math.round(discountGrowth * 100) / 100
        });
      }
    } catch (error) {
      console.error('Error calculating comparison stats:', error);
      setComparisonStats({
        revenueGrowth: 0,
        transactionGrowth: 0,
        avgOrderGrowth: 0,
        discountGrowth: 0
      });
    }
  };

  const calculateStats = (data = invoices) => {
    const paidInvoices = data.filter(inv => inv.paymentStatus === 'PAID');
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalInvoices = paidInvoices.length;
    const averageOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const totalDiscount = paidInvoices.reduce((sum, inv) => sum + (inv.discountAmount || 0), 0);

    return {
      totalRevenue,
      totalInvoices,
      averageOrderValue,
      totalDiscount
    };
  };

  const getTopPaymentMethods = () => {
    const paidInvoices = invoices.filter(inv => inv.paymentStatus === 'PAID');
    const methods = {};
    
    paidInvoices.forEach(inv => {
      methods[inv.paymentMethod] = (methods[inv.paymentMethod] || 0) + 1;
    });

    return Object.entries(methods)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);
  };

  const exportToCSV = () => {
    if (invoices.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    const headers = ['Mã hóa đơn', 'Khách hàng', 'Ngày tạo', 'Tổng tiền', 'Giảm giá', 'Phương thức thanh toán', 'Trạng thái'];
    const csvContent = [
      headers.join(','),
      ...invoices.map(inv => [
        inv.invoiceNumber || '',
        inv.customer ? `${inv.customer.name}${inv.customer.phone ? ` - ${inv.customer.phone}` : ''}` : 'Khách lẻ',
        inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('vi-VN') : '',
        inv.totalAmount || 0,
        inv.discountAmount || 0,
        inv.paymentMethod || '',
        inv.paymentStatus || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Đã xuất báo cáo thành công');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatPercentage = (percentage) => {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getDateRangeText = () => {
    switch (dateRange) {
      case 'today':
        return 'Hôm nay';
      case 'week':
        return '7 ngày qua';
      case 'month':
        return 'Tháng này';
      case 'year':
        return 'Năm này';
      case 'custom':
        if (startDate && endDate) {
          return `Từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}`;
        }
        return 'Tùy chọn';
      default:
        return 'Tất cả';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${color}`}>
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
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
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

  const loadRecentData = async () => {
    try {
      // Load recent invoices (last 5)
      const allInvoices = await invoicesAPI.getAll();
      setRecentInvoices(allInvoices.slice(0, 5));
      
      // Load low stock products
      const lowStock = await productsAPI.getLowStock(10);
      setLowStockProducts(lowStock.slice(0, 4));
    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const stats = calculateStats();
  const paymentMethods = getTopPaymentMethods();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Báo cáo bán hàng
          </h1>
          <p className="text-slate-600 mt-1">
            Phân tích doanh thu và hiệu suất kinh doanh - {getDateRangeText()}
            {lastUpdated && (
              <span className="ml-2 text-sm text-slate-500">
                • Cập nhật lúc {lastUpdated.toLocaleTimeString('vi-VN')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadReports}
            disabled={loading}
            className="bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg shadow-pink-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowTrendingUpIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-green-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Lọc theo khoảng thời gian:</span>
            
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Hôm nay' },
                { key: 'week', label: '7 ngày qua' },
                { key: 'month', label: 'Tháng này' },
                { key: 'year', label: 'Năm này' },
                { key: 'custom', label: 'Tùy chọn' },
                { key: 'all', label: 'Tất cả' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setDateRange(period.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    dateRange === period.key
                      ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái thanh toán</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle={`${stats.totalInvoices} giao dịch`}
          trend={{ 
            type: comparisonStats.revenueGrowth >= 0 ? 'up' : 'down', 
            value: formatPercentage(comparisonStats.revenueGrowth)
          }}
        />
        
        <StatCard
          title="Số giao dịch"
          value={stats.totalInvoices}
          icon={ShoppingBagIcon}
          color="bg-gradient-to-br from-pink-400 to-rose-500"
          subtitle={`Trung bình: ${formatCurrency(stats.averageOrderValue)}`}
          trend={{ 
            type: comparisonStats.transactionGrowth >= 0 ? 'up' : 'down', 
            value: formatPercentage(comparisonStats.transactionGrowth)
          }}
        />
        
        <StatCard
          title="Giao dịch trung bình"
          value={formatCurrency(stats.averageOrderValue)}
          icon={ArrowTrendingUpIcon}
          color="bg-gradient-to-br from-rose-400 to-pink-500"
          subtitle="Giá trị đơn hàng"
          trend={{ 
            type: comparisonStats.avgOrderGrowth >= 0 ? 'up' : 'down', 
            value: formatPercentage(comparisonStats.avgOrderGrowth)
          }}
        />
        
        <StatCard
          title="Tổng giảm giá"
          value={formatCurrency(stats.totalDiscount)}
          icon={ChartBarIcon}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          subtitle="Khuyến mãi áp dụng"
          trend={{ 
            type: comparisonStats.discountGrowth >= 0 ? 'up' : 'down', 
            value: formatPercentage(comparisonStats.discountGrowth)
          }}
        />
      </div>

      {/* Payment Methods Chart */}
      {paymentMethods.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-pink-600" />
            Phương thức thanh toán phổ biến
          </h3>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    index === 0 ? 'bg-pink-500' : 
                    index === 1 ? 'bg-rose-500' : 'bg-pink-400'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-700">
                    {method.method === 'CASH' ? 'Tiền mặt' : 
                     method.method === 'TRANSFER' ? 'Chuyển khoản' : 
                     method.method === 'CARD' ? 'Thẻ tín dụng' : method.method}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{method.count} giao dịch</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <ShoppingBagIcon className="h-5 w-5 mr-2 text-pink-600" />
            Giao dịch gần đây
          </h3>
          <div className="space-y-4">
            {recentInvoices.length > 0 ? recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-pink-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
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
    </div>
  );
};

export default Reports;