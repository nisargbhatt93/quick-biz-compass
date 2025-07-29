import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Sale {
  id: string;
  quantity_sold: number;
  unit_price: number;
  total_value: number;
  sale_date: string;
  products: { name: string } | null;
  customers: { name: string } | null;
}

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_records")
        .select(`
          *,
          products (name),
          customers (name)
        `)
        .order("sale_date", { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Sales</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-20 mb-2"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Track your sales performance</p>
        </div>
        <Button onClick={() => window.location.href = '/sales/add'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Sale
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sales.map((sale) => (
          <Card key={sale.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {sale.products?.name || "Unknown Product"}
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{sale.total_value}</div>
              <p className="text-xs text-muted-foreground">
                Qty: {sale.quantity_sold} • ₹{sale.unit_price} each
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Customer: {sale.customers?.name || "Walk-in"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(sale.sale_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Sales;