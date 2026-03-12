import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import VoterAuth from './pages/VoterAuth';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import BoothAllocation from './pages/BoothAllocation';
import { Shield, Users, TrendingUp, Vote, Brain, MapPin } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    
    const navLinks = [
        { name: "Voter Login", path: "/", icon: Shield },
        { name: "Dashboard", path: "/dashboard", icon: TrendingUp },
        { name: "Admin Panel", path: "/admin", icon: Users },
        { name: "Booth Allocation", path: "/booth-allocation", icon: MapPin },
    ];

    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header with Indian flag theme */}
            <header className="bg-white shadow-md border-b-2 border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-saffron via-white to-green flex items-center justify-center shadow-lg border-4 border-white">
                                <Vote className="w-6 h-6 text-navy" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">
                                    <span className="text-saffron">AI</span>
                                    <span className="text-navy"> Voter</span>
                                    <span className="text-green">Auth</span>
                                </h1>
                                <p className="text-xs text-gray-500">Secure Democracy</p>
                            </div>
                        </Link>
                        
                        {/* Navigation */}
                        <nav className="flex space-x-2">
                            {navLinks.map(link => (
                                <Link 
                                    key={link.path}
                                    to={link.path} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        isActive(link.path)
                                            ? 'bg-gradient-to-r from-saffron to-green text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span className="hidden sm:block">{link.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Brain className="w-5 h-5 text-saffron mr-2" />
                        <span className="font-semibold">AI-Powered Electoral Security</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        © 2024 AI VoterAuth System | Securing Democratic Processes
                    </p>
                </div>
            </footer>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<VoterAuth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/booth-allocation" element={<BoothAllocation />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import VoterAuth from './pages/VoterAuth';
// import Admin from './pages/Admin';
// import Dashboard from './pages/Dashboard';
// import { Shield, Users, TrendingUp, Vote, Brain } from 'lucide-react';

// const Layout = ({ children }) => {
//     const location = useLocation();
    
//     const navLinks = [
//         { name: "Voter Login", path: "/", icon: Shield },
//         { name: "Dashboard", path: "/dashboard", icon: TrendingUp },
//         { name: "Admin Panel", path: "/admin", icon: Users },
//     ];

//     const isActive = (path) => {
//         if (path === "/") {
//             return location.pathname === "/";
//         }
//         return location.pathname === path;
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 flex flex-col">
//             {/* Header with Indian flag theme */}
//             <header className="bg-white shadow-md border-b-2 border-gray-200">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex items-center justify-between h-20">
//                         {/* Logo */}
//                         <Link to="/" className="flex items-center gap-3">
//                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-saffron via-white to-green flex items-center justify-center shadow-lg border-4 border-white">
//                                 <Vote className="w-6 h-6 text-navy" />
//                             </div>
//                             <div>
//                                 <h1 className="text-xl font-bold">
//                                     <span className="text-saffron">AI</span>
//                                     <span className="text-navy"> Voter</span>
//                                     <span className="text-green">Auth</span>
//                                 </h1>
//                                 <p className="text-xs text-gray-500">Secure Democracy</p>
//                             </div>
//                         </Link>
                        
//                         {/* Navigation */}
//                         <nav className="flex space-x-2">
//                             {navLinks.map(link => (
//                                 <Link 
//                                     key={link.path}
//                                     to={link.path} 
//                                     className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
//                                         isActive(link.path)
//                                             ? 'bg-gradient-to-r from-saffron to-green text-white shadow-md'
//                                             : 'text-gray-600 hover:bg-gray-100'
//                                     }`}
//                                 >
//                                     <link.icon className="w-4 h-4" />
//                                     <span className="hidden sm:block">{link.name}</span>
//                                 </Link>
//                             ))}
//                         </nav>
//                     </div>
//                 </div>
//             </header>

//             {/* Main Content */}
//             <main className="flex-1">
//                 {children}
//             </main>

//             {/* Footer */}
//             <footer className="bg-gray-800 text-white py-6">
//                 <div className="max-w-7xl mx-auto px-4 text-center">
//                     <div className="flex items-center justify-center mb-2">
//                         <Brain className="w-5 h-5 text-saffron mr-2" />
//                         <span className="font-semibold">AI-Powered Electoral Security</span>
//                     </div>
//                     <p className="text-gray-400 text-sm">
//                         © 2024 AI VoterAuth System | Securing Democratic Processes
//                     </p>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// function App() {
//     return (
//         <Router>
//             <Layout>
//                 <Routes>
//                     <Route path="/" element={<VoterAuth />} />
//                     <Route path="/dashboard" element={<Dashboard />} />
//                     <Route path="/admin" element={<Admin />} />
//                 </Routes>
//             </Layout>
//         </Router>
//     );
// }

// export default App;