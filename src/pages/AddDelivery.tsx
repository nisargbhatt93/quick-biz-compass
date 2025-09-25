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
import { deliverySchema, type DeliveryFormData } from "@/lib/validations";

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
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryFormData, string>>>({});

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
      toast({
        title: "Error",
        description: "Failed to load sales records.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = deliverySchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof DeliveryFormData, string>> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof DeliveryFormData] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { error } = await supabase.from("deliveries").insert([
        {
          sales_record_id: validation.data.sales_record_id,
          delivery_address: validation.data.delivery_address,
          delivery_status: validation.data.delivery_status,
          tracking_number: validation.data.tracking_number || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Delivery scheduled successfully!",
      });

      navigate("/deliveries");
    } catch (error) {
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name as keyof DeliveryFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
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
              <Select onValueChange={(value) => {
                setFormData({...formData, sales_record_id: value});
                setErrors(prev => ({...prev, sales_record_id: undefined}));
              }} required>
                <SelectTrigger className={errors.sales_record_id ? "border-red-500" : ""}>
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
              {errors.sales_record_id && (
                <p className="text-red-500 text-sm mt-1">{errors.sales_record_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_address">Delivery Address *</Label>
              <Textarea
                id="delivery_address"
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleChange}
                rows={3}
                className={errors.delivery_address ? "border-red-500" : ""}
              />
              {errors.delivery_address && (
                <p className="text-red-500 text-sm mt-1">{errors.delivery_address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_status">Status</Label>
                <Select onValueChange={(value) => {
                  setFormData({...formData, delivery_status: value});
                  setErrors(prev => ({...prev, delivery_status: undefined}));
                }}>
                  <SelectTrigger className={errors.delivery_status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.delivery_status && (
                  <p className="text-red-500 text-sm mt-1">{errors.delivery_status}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking_number">Tracking Number</Label>
                <Input
                  id="tracking_number"
                  name="tracking_number"
                  value={formData.tracking_number}
                  onChange={handleChange}
                  placeholder="Optional"
                  className={errors.tracking_number ? "border-red-500" : ""}
                />
                {errors.tracking_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.tracking_number}</p>
                )}
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