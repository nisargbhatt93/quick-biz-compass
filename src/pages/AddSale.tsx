import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { saleSchema, type SaleFormData } from "@/lib/validations";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface Customer {
  id: string;
  name: string;
}

const AddSale = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    product_id: "",
    customer_id: "",
    quantity_sold: "",
    unit_price: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SaleFormData, string>>>({});

  useEffect(() => {
    fetchProductsAndCustomers();
  }, []);

  const fetchProductsAndCustomers = async () => {
    try {
      const [productsResponse, customersResponse] = await Promise.all([
        supabase.from("products").select("id, name, price, stock_quantity"),
        supabase.from("customers").select("id, name"),
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (customersResponse.error) throw customersResponse.error;

      setProducts(productsResponse.data || []);
      setCustomers(customersResponse.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products and customers.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string inputs to numbers for validation
    const validationData = {
      product_id: formData.product_id,
      customer_id: formData.customer_id,
      quantity_sold: parseInt(formData.quantity_sold) || 0,
      unit_price: parseFloat(formData.unit_price) || 0,
    };

    // Validate form data
    const validation = saleSchema.safeParse(validationData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof SaleFormData, string>> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof SaleFormData] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const quantity = validation.data.quantity_sold;
      const unitPrice = validation.data.unit_price;
      const totalValue = quantity * unitPrice;

      // First check if there's enough stock
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock_quantity, name")
        .eq("id", formData.product_id)
        .single();

      if (productError) throw productError;

      if (product.stock_quantity < quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock_quantity} units available for ${product.name}`,
          variant: "destructive",
        });
        return;
      }

      // Record the sale
      const { error: saleError } = await supabase.from("sales_records").insert([
        {
          product_id: validation.data.product_id,
          customer_id: validation.data.customer_id || null,
          quantity_sold: quantity,
          unit_price: unitPrice,
          total_value: totalValue,
        },
      ]);

      if (saleError) throw saleError;

      // Update product stock
      const newStock = product.stock_quantity - quantity;
      const { error: updateError } = await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", validation.data.product_id);

      if (updateError) throw updateError;

      // Show low stock warning if stock is below 10
      if (newStock < 10) {
        toast({
          title: "Low Stock Alert",
          description: `${product.name} now has only ${newStock} units left!`,
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: "Sale recorded successfully!",
      });

      navigate("/sales");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name as keyof SaleFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      product_id: productId,
      unit_price: product ? product.price.toString() : "",
    });
    // Clear errors for product_id and unit_price
    setErrors(prev => ({
      ...prev,
      product_id: undefined,
      unit_price: undefined
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/sales")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Record Sale</h1>
          <p className="text-muted-foreground">Add a new sale transaction</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Sale Information</CardTitle>
          <CardDescription>Enter the details for the sale transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product *</Label>
              <Select onValueChange={handleProductChange} required>
                <SelectTrigger className={errors.product_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ₹{product.price} (Stock: {product.stock_quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.product_id && (
                <p className="text-red-500 text-sm mt-1">{errors.product_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer (Optional)</Label>
              <Select onValueChange={(value) => setFormData({...formData, customer_id: value})}>
                <SelectTrigger className={errors.customer_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customer_id && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity_sold">Quantity *</Label>
                <Input
                  id="quantity_sold"
                  name="quantity_sold"
                  type="number"
                  min="1"
                  value={formData.quantity_sold}
                  onChange={handleChange}
                  className={errors.quantity_sold ? "border-red-500" : ""}
                />
                {errors.quantity_sold && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity_sold}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price *</Label>
                <Input
                  id="unit_price"
                  name="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={handleChange}
                  className={errors.unit_price ? "border-red-500" : ""}
                />
                {errors.unit_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.unit_price}</p>
                )}
              </div>
            </div>

            {formData.quantity_sold && formData.unit_price && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ₹{(parseFloat(formData.quantity_sold) * parseFloat(formData.unit_price)).toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Recording..." : "Record Sale"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/sales")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddSale;