
import React, { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { useGoogleLogin } from '../contexts/GoogleLoginContext';

function Navbar() {
    const { isDarkMode, toggleTheme } = useTheme();
    const { showSuccess } = useNotification();
    const { openModal } = useGoogleLogin();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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


    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleProfileDropdown = () => {
        setProfileDropdownOpen(!profileDropdownOpen);
    };

    const handleLogin = () => {
        setProfileDropdownOpen(false);
        openModal();
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setProfileDropdownOpen(false);
        // Clear both user and admin login states
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('adminLoggedIn');
        // Dispatch custom event to notify all pages
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        showSuccess('Successfully logged out!');
    };

    const isCurrentRoute = (route) => {
        return location.pathname === route;
    };

    // Check for existing login state on component mount
    useEffect(() => {
        const checkLoginState = () => {
            // Check if user is logged in from localStorage or other sources
            const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
            const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
            setIsLoggedIn(userLoggedIn || adminLoggedIn);
        };
        
        checkLoginState();
        
        // Listen for storage changes (when user logs in/out from other pages)
        const handleStorageChange = () => {
            checkLoginState();
        };

        // Listen for custom login events from pages
        const handleLoginEvent = () => {
            setIsLoggedIn(true);
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoggedIn', handleLoginEvent);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoggedIn', handleLoginEvent);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
                setProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileDropdownOpen]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
            <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
                isScrolled
                    ? isDarkMode 
                        ? 'bg-gray-900/80 border-gray-700' 
                        : 'bg-white/80 border-gray-200'
                    : isDarkMode
                        ? 'bg-gray-900 border-gray-700'
                        : 'bg-white border-gray-200'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                            </svg>
                        </div>
                        <span className={`font-semibold text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>QCU EcoCharge</span>
                    </Link>


                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.route}
                                to={item.route}
                                className={`px-4 py-2 rounded-md text-base font-medium transition-all flex items-center space-x-1 ${
                                    isCurrentRoute(item.route)
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : isDarkMode
                                            ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                            onClick={toggleTheme}
                            className={`p-3 rounded-md transition-all ${
                                isDarkMode 
                                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            {isDarkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                                </svg>
                            )}
                        </button>

                        {/* Profile dropdown */}
                        <div className="relative profile-dropdown">
                            <button
                                onClick={toggleProfileDropdown}
                                className={`p-3 rounded-md transition-all ${
                                    isDarkMode 
                                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </button>

                            {/* Dropdown menu */}
                            {profileDropdownOpen && (
                                <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50 ${
                                    isDarkMode 
                                        ? 'bg-gray-800 border border-gray-700' 
                                        : 'bg-white border border-gray-200'
                                }`}>
                                    <div className="py-1">
                                        {!isLoggedIn ? (
                                            <button
                                                onClick={handleLogin}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                            >
                                                Login
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleLogout}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                                    isDarkMode 
                                                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                            >
                                                Log out
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-3 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className={`justify-start flex items-center space-x-2 px-4 py-3 rounded-md text-base font-medium transition-all ${
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