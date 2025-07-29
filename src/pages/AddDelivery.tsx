import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SaleRecord {
  id: string;
  products: { name: string } | null;
  customers: { name: string } | null;
  total_value: number;
  sale_date: string;
}

const AddDelivery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);
  const [formData, setFormData] = useState({
    sales_record_id: "",
    delivery_address: "",
    delivery_status: "pending",
    tracking_number: "",
  });

  useEffect(() => {
    fetchSalesRecords();
  }, []);

  const fetchSalesRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_records")
        .select(`
          id,
          total_value,
          sale_date,
          products (name),
          customers (name)
        `)
        .order("sale_date", { ascending: false });

      if (error) throw error;
      setSalesRecords(data || []);
    } catch (error) {
      console.error("Error fetching sales records:", error);
      toast({
        title: "Error",
        description: "Failed to load sales records.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("deliveries").insert([
        {
          sales_record_id: formData.sales_record_id,
          delivery_address: formData.delivery_address,
          delivery_status: formData.delivery_status,
          tracking_number: formData.tracking_number || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Delivery scheduled successfully!",
      });

      navigate("/deliveries");
    } catch (error) {
      console.error("Error adding delivery:", error);
      toast({
        title: "Error",
        description: "Failed to schedule delivery. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/deliveries")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Schedule Delivery</h1>
          <p className="text-muted-foreground">Create a new delivery for a sale</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
          <CardDescription>Enter the details for the delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sales_record_id">Sale Record *</Label>
              <Select onValueChange={(value) => setFormData({...formData, sales_record_id: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sale record" />
                </SelectTrigger>
                <SelectContent>
                  {salesRecords.map((sale) => (
                    <SelectItem key={sale.id} value={sale.id}>
                      {sale.products?.name || "Unknown Product"} - 
                      {sale.customers?.name || "Walk-in Customer"} - 
                      ${sale.total_value} ({new Date(sale.sale_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_address">Delivery Address *</Label>
              <Textarea
                id="delivery_address"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleChange}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_status">Status</Label>
                <Select onValueChange={(value) => setFormData({...formData, delivery_status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking_number">Tracking Number</Label>
                <Input
                  id="tracking_number"
                  name="tracking_number"
                  value={formData.tracking_number}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Scheduling..." : "Schedule Delivery"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/deliveries")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDelivery;