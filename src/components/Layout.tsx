import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Package, Users, ShoppingCart, Truck, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Products", href: "/products", icon: Package },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Sales", href: "/sales", icon: ShoppingCart },
    { name: "Deliveries", href: "/deliveries", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
      <SidebarContent navigation={navigation} onSignOut={signOut} currentPath={location.pathname} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <SidebarContent navigation={navigation} onSignOut={signOut} currentPath={location.pathname} />
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, onSignOut, currentPath }: { navigation: any[], onSignOut: () => void, currentPath: string }) => (
  <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
    <div className="flex h-16 shrink-0 items-center">
      <Package className="h-8 w-8 text-primary" />
      <span className="ml-2 text-xl font-bold text-card-foreground">Mini ERP</span>
    </div>
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:text-card-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </li>
        <li className="mt-auto">
          <Button 
            variant="ghost" 
            onClick={onSignOut}
            className="w-full justify-start text-muted-foreground hover:text-card-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </li>
      </ul>
    </nav>
  </div>
);

export default Layout;