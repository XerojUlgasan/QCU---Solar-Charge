import React from "react";
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function Homepage() {
    const { isDarkMode } = useTheme();
    
    const features = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                </svg>
            ),
            title: "Solar-Powered Charging",
            description: "Clean energy from solar panels powers your device charging needs"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
            ),
            title: "Eco-Friendly",
            description: "Reduce your carbon footprint with renewable energy charging"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M12 6v6l4 2"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                </svg>
            ),
            title: "24/7 Availability",
            description: "Energy storage allows charging even during nighttime"
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                </svg>
            ),
            title: "RFID Access",
            description: "Secure RFID technology with 1 hour free charging weekly"
        }
    ];

    const stats = [
        { label: "Active Stations", value: "25+" },
        { label: "Monthly Users", value: "1,200+" },
        { label: "CO₂ Saved", value: "500kg" },
        { label: "Energy Generated", value: "2.5MWh" }
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={isDarkMode ? {backgroundColor: '#0b0e13'} : {backgroundColor: '#ffffff'}}>
            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="badge-green inline-block mb-4 w-fit" style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                backgroundColor: isDarkMode ? '#0e5429' : '#10b981',
                                color: isDarkMode ? '#ffffff' : '#ffffff',
                                border: isDarkMode ? 'none' : '1px solid #059669',
                                boxShadow: isDarkMode ? 'none' : '0 0 20px rgba(16, 185, 129, 0.2)'
                            }}>
                                Sustainable Technology
                            </span>
                            <h1 className={`font-bold mb-6 ${isDarkMode ? 'bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent'}`} style={{fontSize: '40px'}}>
                                QCU EcoCharge Station
                            </h1>
                            <p className="mb-8" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '18px'}}>
                                Charge your devices with clean, renewable solar energy. Our innovative charging stations 
                                provide convenient, eco-friendly power solutions across campus.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/overview#station-status" className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-10 rounded-md px-6 ${isDarkMode ? 'text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700' : 'text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl border border-emerald-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    Find Stations
                                </Link>
                                <Link to="/about" className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-transparent h-10 rounded-md px-6 ${isDarkMode ? 'text-white hover:bg-gray-800 border-gray-600' : 'text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                                        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                                    </svg>
                                    Learn More
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <img 
                                src="https://images.unsplash.com/photo-1652252421025-0392a97129a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsJTIwY2hhcmdpbmclMjBzdGF0aW9ufGVufDF8fHx8MTc1Nzg1ODg0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                alt="Solar charging station"
                                className="rounded-2xl shadow-2xl w-full"
                            />
                            <div className={`absolute -bottom-6 -left-6 p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-white text-gray-900' : 'bg-white text-gray-900 shadow-xl border-2 border-gray-200'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'}`} style={{boxShadow: isDarkMode ? 'none' : '0 0 10px rgba(16, 185, 129, 0.6)'}}></div>
                                    <span className="font-semibold" style={{color: isDarkMode ? '#1f2937' : '#1f2937'}}>Live Charging</span>
                                </div>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-600'}`}>Station ID: QCU-001</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12" style={{backgroundColor: isDarkMode ? '#0f141c' : '#f8fafc'}}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className={`font-bold mb-2 ${isDarkMode ? 'text-green-500' : 'text-emerald-600'}`} style={{fontSize: '28px', textShadow: isDarkMode ? 'none' : '0 0 10px rgba(16, 185, 129, 0.3)'}}>{stat.value}</div>
                                <div style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '16px'}}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '32px'}}>Why Choose QCU EcoCharge?</h2>
                        <p className="max-w-2xl mx-auto" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '18px'}}>
                            Our solar-powered charging stations combine sustainability with convenience, 
                            offering a reliable and eco-friendly way to keep your devices powered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className={`flex flex-col rounded-xl text-center hover:shadow-lg transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'hover:shadow-xl' : 'hover:shadow-2xl'}`} style={{
                                backgroundColor: isDarkMode ? '#0f141c' : '#ffffff', 
                                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db', 
                                padding: '20px',
                                boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}>
                                <div className={`mx-auto rounded-lg flex items-center justify-center text-white mb-4 ${isDarkMode ? '' : 'shadow-md'}`} style={{
                                    background: isDarkMode ? 'linear-gradient(90deg, #22c55e, #3b82f6)' : 'linear-gradient(90deg, #059669, #0891b2)', 
                                    width: '40px', 
                                    height: '40px',
                                    boxShadow: isDarkMode ? 'none' : '0 0 15px rgba(5, 150, 105, 0.3)'
                                }}>
                                    {feature.icon}
                                </div>
                                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '18px'}}>{feature.title}</h4>
                                <p style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '16px'}}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`py-20 px-4 text-white ${isDarkMode ? 'bg-gradient-to-r from-green-600 to-blue-600' : 'bg-gradient-to-r from-emerald-600 to-cyan-600'}`} style={{boxShadow: isDarkMode ? 'none' : 'inset 0 0 50px rgba(16, 185, 129, 0.1)'}}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-bold mb-4" style={{fontSize: '32px'}}>Ready to Start Charging Sustainably?</h2>
                    <p className="mb-8 opacity-90" style={{fontSize: '18px'}}>
                        Join thousands of users who have made the switch to eco-friendly charging.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/overview#station-status" className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border text-white border-white hover:bg-white h-10 rounded-md px-6 ${isDarkMode ? 'hover:text-green-600' : 'hover:text-emerald-600 shadow-sm hover:shadow-md'}`}>
                            View Locations
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Homepage;