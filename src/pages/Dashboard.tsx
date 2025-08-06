import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, Truck, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LowStockAlert from "@/components/LowStockAlert";

interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalSales: number;
  pendingDeliveries: number;
  totalRevenue: number;
  lowStockProducts: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    pendingDeliveries: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [products, customers, sales, deliveries] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("customers").select("*"),
        supabase.from("sales_records").select("*"),
        supabase.from("deliveries").select("*").eq("delivery_status", "pending"),
      ]);

      const totalRevenue = sales.data?.reduce((sum, sale) => sum + Number(sale.total_value), 0) || 0;
      const lowStockProducts = products.data?.filter(product => product.stock_quantity < 10).length || 0;

      setStats({
        totalProducts: products.data?.length || 0,
        totalCustomers: customers.data?.length || 0,
        totalSales: sales.data?.length || 0,
        pendingDeliveries: deliveries.data?.length || 0,
        totalRevenue,
        lowStockProducts,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      description: `${stats.lowStockProducts} low stock`,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      description: "Active customers",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Sales",
      value: stats.totalSales,
      description: "All time sales",
      icon: ShoppingCart,
      color: "text-purple-600",
    },
    {
      title: "Pending Deliveries",
      value: stats.pendingDeliveries,
      description: "Awaiting delivery",
      icon: Truck,
      color: "text-orange-600",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      description: "All time revenue",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockProducts,
      description: "Products < 10 units",
      icon: TrendingUp,
      color: "text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your ERP dashboard. Here's an overview of your business.
        </p>
      </div>
      
      <LowStockAlert />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;