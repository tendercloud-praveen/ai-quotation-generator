// import { useState } from 'react';
// import { Outlet, useLocation } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import Topbar from './Topbar';

// export default function AppLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();
//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
//       <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//       <div className="flex-1 flex flex-col min-w-0">
//         <Topbar onMenu={() => setSidebarOpen(true)} />
//         <main key={location.pathname} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto animate-fade-in">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* FIXED SIDEBAR */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN AREA */}
      <div className="lg:ml-64 min-h-screen">
        {/* TOPBAR */}
        <Topbar onMenu={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
