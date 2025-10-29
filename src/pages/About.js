import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function About() {
  const { isDarkMode } = useTheme();
  
  const values = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      ),
      title: "Sustainability",
      description: "Committed to reducing carbon footprint through renewable energy solutions"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <circle cx="9" cy="7" r="4"></circle>
        </svg>
      ),
      title: "Community",
      description: "Building a community of environmentally conscious students and faculty"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
          <circle cx="12" cy="8" r="6"></circle>
        </svg>
      ),
      title: "Innovation",
      description: "Pioneering smart technology for accessible and efficient charging"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path>
        </svg>
      ),
      title: "Accessibility",
      description: "Making clean energy charging available to everyone on campus"
    }
  ];

  const team = [
    {
      name: "Xeroj N. Ulgasan",
      role: "Project Manager/Programmer",
      description: "Leading sustainable technology initiatives at QCU",
      initials: "XU",
      image: "/images/team/maria-santos.png"
    },
    {
      name: "Ernesto C. Agustin III",
      role: "Programmer",
      description: "Expert in solar energy systems and IoT integration",
      initials: "EA",
      image: "/images/team/ErnestoAgustin.png"
    },
    {
      name: "John Kenneth Ramos",
      role: "System Analyst/Quality Assurance",
      description: "Designing user-friendly interfaces for charging stations",
      initials: "KR",
      image: "/images/team/sarah-kim.png"
    },
    {
      name: "Ace Jester Almase",
      role: "Technical Writer",
      description: "Managing station deployment and user support",
      initials: "AA",
      image: "/images/team/alex-rodriguez.png"
    },
    {
      name: "Karl Dominique Sarcia",
      role: "Researcher",
      description: "Building the backend systems and mobile applications",
      initials: "KS",
      image: "/images/team/emily-watson.png"
    },
    {
      name: "John Rod Chester Orogo",
      role: "Technical Writer",
      description: "Analyzing usage patterns and optimizing system performance",
      initials: "JO",
      image: "/images/team/lisa-park.png"
    },
    {
      name: "Carl Jeus S. Cacho",
      role: "UI/UX Designer",
      description: "Ensuring optimal performance and reliability of stations",
      initials: "CC",
      image: "/images/team/david-johnson.png"
    },
    {
      name: "Antonio Delas Eras",
      role: "UI/UX Designer",
      description: "Promoting sustainable charging solutions across campus",
      initials: "AE",
      image: "/images/team/rachel-green.png"
    },
    {
      name: "Karl Vergara",
      role: "Researcher",
      description: "Supporting research and development of new features",
      initials: "KV",
      image: "/images/team/james-wilson.png"
    }
  ];

  return (
    <div className={`min-h-screen py-20 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{backgroundColor: isDarkMode ? '#0b0e13' : '#ffffff'}}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
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
            About QCU EcoCharge
          </span>
          <h1 className={`font-bold mb-6 ${isDarkMode ? 'text-white' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent'}`} style={{fontSize: '40px'}}>Powering Tomorrow with Clean Energy</h1>
          <p className="max-w-3xl mx-auto" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '18px'}}>
            QCU EcoCharge Station represents our commitment to sustainable technology and environmental 
            responsibility. We're transforming how students and faculty charge their devices on campus.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className={`font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '32px'}}>Our Mission</h2>
            <p className="mb-6" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '18px'}}>
              To provide sustainable, accessible, and convenient charging solutions that reduce our 
              environmental impact while meeting the growing energy needs of our campus community.
            </p>
            <p className="mb-6" style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '18px'}}>
              Through innovative solar technology, we're creating a network 
              of charging stations that not only serve our immediate needs but also contribute to 
              a more sustainable future.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'}`} style={{boxShadow: isDarkMode ? 'none' : '0 0 8px rgba(16, 185, 129, 0.6)'}}></div>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>100% renewable solar energy</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${isDarkMode ? 'bg-green-500' : 'bg-emerald-500'}`} style={{boxShadow: isDarkMode ? 'none' : '0 0 8px rgba(16, 185, 129, 0.6)'}}></div>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Real-time monitoring and maintenance</span>
              </div>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1678898629065-2e542be3b903?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlY28lMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1Nzg1ODg0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Eco technology"
              className="rounded-xl shadow-lg w-full"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className={`font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '32px'}}>Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
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
                  {value.icon}
                </div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '18px'}}>{value.title}</h4>
                                <p style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '16px'}}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className={`font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '32px'}}>Meet Our Team</h2>
          <div className="team-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {team.map((member, index) => (
              <div key={index} className={`flex flex-col rounded-xl text-center hover:shadow-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isDarkMode ? 'hover:shadow-xl' : 'hover:shadow-2xl'}`} style={{
                backgroundColor: isDarkMode ? '#0f141c' : '#ffffff', 
                border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db', 
                padding: '16px',
                minHeight: '160px',
                boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <div className="mx-auto w-36 h-36 rounded-full overflow-hidden mb-4" style={{
                  background: isDarkMode ? 'linear-gradient(90deg, #22c55e, #3b82f6)' : 'linear-gradient(90deg, #10b981, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold" style={{display: 'none'}}>
                    {member.initials}
                  </div>
                </div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '19px'}}>{member.name}</h4>
                <p className={`font-medium mb-3 ${isDarkMode ? 'text-green-500' : 'text-emerald-600'}`} style={{fontSize: '17px'}}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className={`rounded-2xl p-8 text-center ${isDarkMode ? 'hover:shadow-xl' : 'hover:shadow-2xl'} transition-all duration-300`} style={{
          backgroundColor: isDarkMode ? '#0f141c' : '#ffffff', 
          border: isDarkMode ? '1px solid #1e2633' : '2px solid #d1d5db',
          boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h2 className={`font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '32px'}}>Our Environmental Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className={`font-bold mb-2 ${isDarkMode ? 'text-green-600' : 'text-emerald-600'}`} style={{fontSize: '28px'}}>500kg</div>
              <div style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '16px'}}>CO₂ Emissions Saved</div>
            </div>
            <div>
              <div className={`font-bold mb-2 ${isDarkMode ? 'text-blue-600' : 'text-blue-500'}`} style={{fontSize: '28px'}}>2.5MWh</div>
              <div style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '16px'}}>Clean Energy Generated</div>
            </div>
            <div>
              <div className={`font-bold mb-2 ${isDarkMode ? 'text-purple-600' : 'text-purple-500'}`} style={{fontSize: '28px'}}>1,200+</div>
              <div style={{color: isDarkMode ? '#9aa3b2' : '#1f2937', fontSize: '16px'}}>Students Served</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;