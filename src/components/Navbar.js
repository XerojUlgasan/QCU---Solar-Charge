
import React, { useState } from "react";
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { route: '/', label: 'Home' },
        { route: '/about', label: 'About' },
        { route: '/overview', label: 'Overview' },
        { route: '/contact', label: 'Contact' },
        { route: '/rate-us', label: 'Rate Us' },
        { route: '/report-problem', label: 'Report Problem' },
        { route: '/admin', label: 'Admin', isAdmin: true }
    ];

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const isCurrentRoute = (route) => {
        return location.pathname === route;
    };


    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                            </svg>
                        </div>
                        <span className="font-semibold text-lg text-white">QCU EcoCharge</span>
                    </Link>


                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.route}
                                to={item.route}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${
                                    isCurrentRoute(item.route)
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                {item.isAdmin && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                                    </svg>
                                )}
                                <span>{item.label}</span>
                                {item.isAdmin && (
                                    <span className="ml-1 bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-md font-medium">
                                        Admin
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>


                    <div className="flex items-center space-x-2">
                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                        >
                            {isDarkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <circle cx="12" cy="12" r="4"></circle>
                                    <path d="M12 2v2"></path>
                                    <path d="M12 20v2"></path>
                                    <path d="m4.93 4.93 1.41 1.41"></path>
                                    <path d="m17.66 17.66 1.41 1.41"></path>
                                    <path d="M2 12h2"></path>
                                    <path d="M20 12h2"></path>
                                    <path d="m6.34 17.66-1.41 1.41"></path>
                                    <path d="m19.07 4.93-1.41 1.41"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                                </svg>
                            )}
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden pb-4 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="flex flex-col space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.route}
                                to={item.route}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`justify-start flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    isCurrentRoute(item.route)
                                        ? 'bg-green-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                {item.isAdmin && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                                    </svg>
                                )}
                                <span>{item.label}</span>
                                {item.isAdmin && (
                                    <span className="ml-1 bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-md font-medium">
                                        Admin
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;