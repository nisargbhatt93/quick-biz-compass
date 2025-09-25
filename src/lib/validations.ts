import { z } from 'zod';

// Customer validation schema
export const customerSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z.string()
    .trim()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .regex(/^[\+]?[0-9\s\-\(\)]{0,20}$/, "Invalid phone number format")
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  address: z.string()
    .trim()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal(""))
});

// Product validation schema
export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),
  sku: z.string()
    .trim()
    .regex(/^[A-Z0-9\-_]{0,50}$/, "SKU can only contain uppercase letters, numbers, hyphens, and underscores")
    .max(50, "SKU must be less than 50 characters")
    .optional()
    .or(z.literal("")),
  description: z.string()
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  price: z.number()
    .min(0.01, "Price must be greater than 0")
    .max(999999.99, "Price must be less than 1,000,000"),
  stock_quantity: z.number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative")
    .max(999999, "Stock quantity must be less than 1,000,000"),
  category: z.string()
    .trim()
    .max(50, "Category must be less than 50 characters")
    .optional()
    .or(z.literal(""))
});

// Sale validation schema
export const saleSchema = z.object({
  product_id: z.string()
    .uuid("Invalid product selection"),
  customer_id: z.string()
    .uuid("Invalid customer selection")
    .optional()
    .or(z.literal("")),
  quantity_sold: z.number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(999999, "Quantity must be less than 1,000,000"),
  unit_price: z.number()
    .min(0.01, "Unit price must be greater than 0")
    .max(999999.99, "Unit price must be less than 1,000,000")
});

// Delivery validation schema
export const deliverySchema = z.object({
  sales_record_id: z.string()
    .uuid("Please select a sale record"),
  delivery_address: z.string()
    .trim()
    .min(1, "Delivery address is required")
    .max(500, "Delivery address must be less than 500 characters"),
  delivery_status: z.enum(['pending', 'in_transit', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: "Invalid delivery status" })
  }),
  tracking_number: z.string()
    .trim()
    .max(100, "Tracking number must be less than 100 characters")
    .optional()
    .or(z.literal(""))
});

// Authentication validation schemas
export const signInSchema = z.object({
  email: z.string()
    .trim()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(1, "Password is required")
});

export const signUpSchema = z.object({
  email: z.string()
    .trim()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[@$!%*?&])/, "Password must contain at least one special character (@$!%*?&)"),
  username: z.string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores")
});

// Type exports
export type CustomerFormData = z.infer<typeof customerSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type SaleFormData = z.infer<typeof saleSchema>;
export type DeliveryFormData = z.infer<typeof deliverySchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;