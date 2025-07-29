import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Delivery {
  id: string;
  delivery_address: string;
  delivery_status: string | null;
  tracking_number: string | null;
  delivery_date: string | null;
  created_at: string;
  sales_records: {
    products: { name: string } | null;
    customers: { name: string } | null;
  } | null;
}

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from("deliveries")
        .select(`
          *,
          sales_records (
            products (name),
            customers (name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Deliveries</h1>
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
          <h1 className="text-3xl font-bold">Deliveries</h1>
          <p className="text-muted-foreground">Track your delivery status</p>
        </div>
        <Button onClick={() => window.location.href = '/deliveries/add'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Delivery
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deliveries.map((delivery) => (
          <Card key={delivery.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {delivery.sales_records?.products?.name || "Unknown Product"}
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={getStatusColor(delivery.delivery_status)}>
                  {delivery.delivery_status || "pending"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  To: {delivery.sales_records?.customers?.name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {delivery.delivery_address}
                </p>
                {delivery.tracking_number && (
                  <p className="text-xs text-muted-foreground">
                    Tracking: {delivery.tracking_number}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(delivery.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Deliveries;