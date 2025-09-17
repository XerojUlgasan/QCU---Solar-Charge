import React from "react";
import { Link } from 'react-router-dom';

function Homepage() {
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
        <div className="min-h-screen text-white" style={{backgroundColor: '#0b0e13'}}>
            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="badge-green inline-block mb-4 w-fit" style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '12px'
                            }}>
                                Sustainable Technology
                            </span>
                            <h1 className="font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent" style={{fontSize: '40px'}}>
                                QCU EcoCharge Station
                            </h1>
                            <p className="mb-8" style={{color: '#9aa3b2', fontSize: '18px'}}>
                                Charge your devices with clean, renewable solar energy. Our innovative charging stations 
                                provide convenient, eco-friendly power solutions across campus.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/overview#station-status" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 text-white h-10 rounded-md px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    Find Stations
                                </Link>
                                <Link to="/about" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-transparent text-white hover:bg-gray-800 h-10 rounded-md px-6 border-gray-600">
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
                            <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-6 rounded-xl shadow-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-semibold">Live Charging</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Station ID: QCU-001</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12" style={{backgroundColor: '#0f141c'}}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="font-bold text-green-500 mb-2" style={{fontSize: '28px'}}>{stat.value}</div>
                                <div style={{color: '#9aa3b2', fontSize: '16px'}}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-bold mb-4" style={{fontSize: '32px'}}>Why Choose QCU EcoCharge?</h2>
                        <p className="max-w-2xl mx-auto" style={{color: '#9aa3b2', fontSize: '18px'}}>
                            Our solar-powered charging stations combine sustainability with convenience, 
                            offering a reliable and eco-friendly way to keep your devices powered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-white flex flex-col rounded-xl text-center hover:shadow-lg transition-shadow" style={{backgroundColor: '#0f141c', border: '1px solid #1e2633', padding: '20px'}}>
                                <div className="mx-auto rounded-lg flex items-center justify-center text-white mb-4" style={{background: 'linear-gradient(90deg, #22c55e, #3b82f6)', width: '40px', height: '40px'}}>
                                    {feature.icon}
                                </div>
                                <h4 className="font-semibold mb-2" style={{fontSize: '18px'}}>{feature.title}</h4>
                                <p style={{color: '#9aa3b2', fontSize: '16px'}}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-bold mb-4" style={{fontSize: '32px'}}>Ready to Start Charging Sustainably?</h2>
                    <p className="mb-8 opacity-90" style={{fontSize: '18px'}}>
                        Join thousands of users who have made the switch to eco-friendly charging.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/rfid" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-white text-green-600 hover:bg-gray-100 h-10 rounded-md px-6">
                            Get Your RFID Card
                        </Link>
                        <Link to="/overview#station-status" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border text-white border-white hover:bg-white hover:text-green-600 h-10 rounded-md px-6">
                            View Locations
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Homepage;