import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  // En desktop: controla si el sidebar está colapsado (solo iconos) o expandido
  // En móvil: controla si el sidebar overlay está visible
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    // En desktop colapsa/expande; en móvil abre/cierra overlay
    if (window.innerWidth < 1024) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        open={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
      />
      <Navbar
        onToggle={handleToggle}
        sidebarCollapsed={collapsed}
      />
      <main className={`
        pt-16 transition-all duration-300
        ${collapsed ? 'lg:pl-16' : 'lg:pl-64'}
      `}>
        <div className="p-6 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
