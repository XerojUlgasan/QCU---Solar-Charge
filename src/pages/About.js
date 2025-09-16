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
    }
  ];

  return (
    <div className="min-h-screen py-20 px-4 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap mb-4 bg-green-100 text-green-800 border-transparent">
            About QCU EcoCharge
          </span>
          <h1 className="text-4xl font-bold mb-6">Powering Tomorrow with Clean Energy</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            QCU EcoCharge Station represents our commitment to sustainable technology and environmental 
            responsibility. We're transforming how students and faculty charge their devices on campus.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-400 mb-6">
              To provide sustainable, accessible, and convenient charging solutions that reduce our 
              environmental impact while meeting the growing energy needs of our campus community.
            </p>
            <p className="text-lg text-gray-400 mb-6">
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
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-800 text-white flex flex-col rounded-xl border border-gray-700 text-center hover:shadow-lg transition-shadow p-6">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white mb-4">
                  {value.icon}
                </div>
                <h4 className="text-lg font-semibold mb-2">{value.title}</h4>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-800 text-white flex flex-col rounded-xl border border-gray-700 text-center p-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {member.initials}
                </div>
                <h4 className="text-lg font-semibold mb-1">{member.name}</h4>
                <p className="font-medium text-green-500 mb-3">{member.role}</p>
                <p className="text-sm text-gray-400">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700">
          <h2 className="text-3xl font-bold mb-6">Our Environmental Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500kg</div>
              <div className="text-gray-400">CO₂ Emissions Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2.5MWh</div>
              <div className="text-gray-400">Clean Energy Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">1,200+</div>
              <div className="text-gray-400">Students Served</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;