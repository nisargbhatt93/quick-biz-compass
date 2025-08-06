import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
}

const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock_quantity")
        .lt("stock_quantity", 10);

      if (error) throw error;
      setLowStockProducts(data || []);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
    }
  };

  if (lowStockProducts.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Low Stock Alert</AlertTitle>
      <AlertDescription>
        The following products have low stock (less than 10 units):
        <ul className="mt-2 list-disc list-inside">
          {lowStockProducts.map((product) => (
            <li key={product.id}>
              {product.name} - {product.stock_quantity} units remaining
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default LowStockAlert;