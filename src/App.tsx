import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import AddProduct from "@/pages/AddProduct";
import Customers from "@/pages/Customers";
import AddCustomer from "@/pages/AddCustomer";
import Sales from "@/pages/Sales";
import AddSale from "@/pages/AddSale";
import Deliveries from "@/pages/Deliveries";
import AddDelivery from "@/pages/AddDelivery";
import Auth from "@/pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/products/add" element={
              <ProtectedRoute>
                <Layout>
                  <AddProduct />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/customers/add" element={
              <ProtectedRoute>
                <Layout>
                  <AddCustomer />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute>
                <Layout>
                  <Sales />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/sales/add" element={
              <ProtectedRoute>
                <Layout>
                  <AddSale />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/deliveries" element={
              <ProtectedRoute>
                <Layout>
                  <Deliveries />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/deliveries/add" element={
              <ProtectedRoute>
                <Layout>
                  <AddDelivery />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
