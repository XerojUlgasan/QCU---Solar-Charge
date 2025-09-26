import React from 'react';

function About() {
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
      name: "Dr. Maria Santos",
      role: "Project Director",
      description: "Leading sustainable technology initiatives at QCU",
      initials: "DMS"
    },
    {
      name: "John Chen",
      role: "Lead Engineer",
      description: "Expert in solar energy systems and IoT integration",
      initials: "JC"
    },
    {
      name: "Sarah Kim",
      role: "UX Designer",
      description: "Designing user-friendly interfaces for charging stations",
      initials: "SK"
    },
    {
      name: "Alex Rodriguez",
      role: "Campus Coordinator",
      description: "Managing station deployment and user support",
      initials: "AR"
    },
    {
      name: "Emily Watson",
      role: "Software Developer",
      description: "Building the backend systems and mobile applications",
      initials: "EW"
    },
    {
      name: "Michael Torres",
      role: "Hardware Engineer",
      description: "Designing and implementing charging station hardware",
      initials: "MT"
    },
    {
      name: "Lisa Park",
      role: "Data Analyst",
      description: "Analyzing usage patterns and optimizing system performance",
      initials: "LP"
    },
    {
      name: "David Johnson",
      role: "Maintenance Specialist",
      description: "Ensuring optimal performance and reliability of stations",
      initials: "DJ"
    },
    {
      name: "Rachel Green",
      role: "Marketing Coordinator",
      description: "Promoting sustainable charging solutions across campus",
      initials: "RG"
    },
    {
      name: "James Wilson",
      role: "Research Assistant",
      description: "Supporting research and development of new features",
      initials: "JW"
    }
  ];

  return (
    <div className="min-h-screen py-20 px-4 text-white" style={{backgroundColor: '#0b0e13'}}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <span className="badge-green inline-block mb-4 w-fit" style={{
            padding: '6px 10px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '12px'
          }}>
            About QCU EcoCharge
          </span>
          <h1 className="font-bold mb-6" style={{fontSize: '40px'}}>Powering Tomorrow with Clean Energy</h1>
          <p className="max-w-3xl mx-auto" style={{color: '#9aa3b2', fontSize: '18px'}}>
            QCU EcoCharge Station represents our commitment to sustainable technology and environmental 
            responsibility. We're transforming how students and faculty charge their devices on campus.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-bold mb-6" style={{fontSize: '32px'}}>Our Mission</h2>
            <p className="mb-6" style={{color: '#9aa3b2', fontSize: '18px'}}>
              To provide sustainable, accessible, and convenient charging solutions that reduce our 
              environmental impact while meeting the growing energy needs of our campus community.
            </p>
            <p className="mb-6" style={{color: '#9aa3b2', fontSize: '18px'}}>
              Through innovative solar technology and smart RFID systems, we're creating a network 
              of charging stations that not only serve our immediate needs but also contribute to 
              a more sustainable future.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>100% renewable solar energy</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Smart RFID technology for easy access</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Real-time monitoring and maintenance</span>
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
          <h2 className="font-bold text-center mb-12" style={{fontSize: '32px'}}>Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-white flex flex-col rounded-xl text-center hover:shadow-lg transition-shadow" style={{backgroundColor: '#0f141c', border: '1px solid #1e2633', padding: '20px'}}>
                <div className="mx-auto rounded-lg flex items-center justify-center text-white mb-4" style={{background: 'linear-gradient(90deg, #22c55e, #3b82f6)', width: '40px', height: '40px'}}>
                  {value.icon}
                </div>
                <h4 className="font-semibold mb-2" style={{fontSize: '18px'}}>{value.title}</h4>
                <p style={{color: '#9aa3b2', fontSize: '16px'}}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="font-bold text-center mb-12" style={{fontSize: '32px'}}>Meet Our Team</h2>
          <div className="pyramid-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Row 1 - 1 member (Director) */}
            <div className="pyramid-row" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <div className="text-white flex flex-col rounded-lg text-center" style={{
                backgroundColor: '#0f141c', 
                border: '1px solid #1e2633', 
                padding: '16px',
                width: '220px'
              }}>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold mb-3" style={{background: 'linear-gradient(90deg, #22c55e, #3b82f6)'}}>
                  {team[0].initials}
                </div>
                <h4 className="font-semibold mb-2" style={{fontSize: '16px'}}>{team[0].name}</h4>
                <p className="font-medium text-green-500" style={{fontSize: '14px'}}>{team[0].role}</p>
              </div>
            </div>

            {/* Row 2 - 2 members (Lead roles) */}
            <div className="pyramid-row" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px'
            }}>
              {team.slice(1, 3).map((member, index) => (
                <div key={index} className="text-white flex flex-col rounded-lg text-center" style={{
                  backgroundColor: '#0f141c', 
                  border: '1px solid #1e2633', 
                  padding: '16px',
                  width: '220px'
                }}>
                  <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold mb-3" style={{background: 'linear-gradient(90deg, #22c55e, #3b82f6)'}}>
                    {member.initials}
                  </div>
                  <h4 className="font-semibold mb-2" style={{fontSize: '16px'}}>{member.name}</h4>
                  <p className="font-medium text-green-500" style={{fontSize: '14px'}}>{member.role}</p>
                </div>
              ))}
            </div>

            {/* Row 3 - 3 members (Core team) */}
            <div className="pyramid-row" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px'
            }}>
              {team.slice(3, 6).map((member, index) => (
                <div key={index} className="text-white flex flex-col rounded-lg text-center" style={{
                  backgroundColor: '#0f141c', 
                  border: '1px solid #1e2633', 
                  padding: '16px',
                  width: '220px'
                }}>
                  <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold mb-3" style={{background: 'linear-gradient(90deg, #22c55e, #3b82f6)'}}>
                    {member.initials}
                  </div>
                  <h4 className="font-semibold mb-2" style={{fontSize: '16px'}}>{member.name}</h4>
                  <p className="font-medium text-green-500" style={{fontSize: '14px'}}>{member.role}</p>
                </div>
              ))}
            </div>

            {/* Row 4 - 4 members (Support team) */}
            <div className="pyramid-row" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {team.slice(6, 10).map((member, index) => (
                <div key={index} className="text-white flex flex-col rounded-lg text-center" style={{
                  backgroundColor: '#0f141c', 
                  border: '1px solid #1e2633', 
                  padding: '16px',
                  width: '220px'
                }}>
                  <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold mb-3" style={{background: 'linear-gradient(90deg, #22c55e, #3b82f6)'}}>
                    {member.initials}
                  </div>
                  <h4 className="font-semibold mb-2" style={{fontSize: '16px'}}>{member.name}</h4>
                  <p className="font-medium text-green-500" style={{fontSize: '14px'}}>{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="rounded-2xl p-8 text-center" style={{backgroundColor: '#0f141c', border: '1px solid #1e2633'}}>
          <h2 className="font-bold mb-6" style={{fontSize: '32px'}}>Our Environmental Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="font-bold text-green-600 mb-2" style={{fontSize: '28px'}}>500kg</div>
              <div style={{color: '#9aa3b2', fontSize: '16px'}}>CO₂ Emissions Saved</div>
            </div>
            <div>
              <div className="font-bold text-blue-600 mb-2" style={{fontSize: '28px'}}>2.5MWh</div>
              <div style={{color: '#9aa3b2', fontSize: '16px'}}>Clean Energy Generated</div>
            </div>
            <div>
              <div className="font-bold text-purple-600 mb-2" style={{fontSize: '28px'}}>1,200+</div>
              <div style={{color: '#9aa3b2', fontSize: '16px'}}>Students Served</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;