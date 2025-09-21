import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useGoogleLogin } from '../contexts/GoogleLoginContext';
import { useAuth } from '../contexts/AuthContext';
import "../styles/Contact.css";

function Contact() {
	const { showSuccess } = useNotification();
	const { openModal } = useGoogleLogin();
	const { user, isAuthenticated, signInWithGoogle } = useAuth();
	const [formData, setFormData] = useState({ subject: "", message: "" });

	// Get user's profile picture or fallback to generated avatar
	const getUserAvatar = (user) => {
		// Use Google profile picture if available
		if (user?.photoURL) {
			return user.photoURL;
		}
		// Fallback to generated avatar from display name
		if (user?.displayName) {
			const encodedName = encodeURIComponent(user.displayName);
			return `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff`;
		}
		return null;
	};


	function handleGoogleLoginClick() {
		openModal();
	}

	function handleSubmit(e){
		e.preventDefault();
		// mock submit - in the future this could send to an API with user's email
		const userEmail = user?.email || 'Unknown';
		showSuccess(`Message sent from ${userEmail}! We'll get back to you soon.`);
		setFormData({ subject: "", message: "" });
	}
  return (
		<div id="contact-page">
			<div className="container">
				<div className="header">
					<span className="badge-blue">Get In Touch</span>
					<h1 className="font-bold mb-6" style={{fontSize: '40px'}}>Contact Us</h1>
					<p className="subtitle">Have questions about our EcoCharge stations? Need technical support? We're here to help! Reach out to us through any of the channels below.</p>
        </div>

				<div className="grid">
					<div className="card left">
						<h3>Send us a Message</h3>
						<p className="desc">Fill out the form below and we'll get back to you as soon as possible.</p>
						{!isAuthenticated && (
							<div className="login-box">
								<p className="muted">Please log in to send us a message</p>
								<button className="google-btn" onClick={handleGoogleLoginClick}>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
										<circle cx="12" cy="7" r="4"></circle>
									</svg>
                      Login
								</button>
                  </div>
						)}

						{isAuthenticated && user && (
							<>
								<div className="user-box">
									<img 
										src={getUserAvatar(user)} 
										alt={user.displayName}
										onError={(e) => {
											// Fallback to generated avatar if profile picture fails to load
											if (user?.displayName) {
												const encodedName = encodeURIComponent(user.displayName);
												e.target.src = `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff`;
											}
										}}
									/>
                      <div>
										<p className="user-name">{user.displayName}</p>
										<p className="muted">{user.email}</p>
                      </div>
                    </div>
                    
								<form onSubmit={handleSubmit} className="contact-form">
									<div className="form-field">
										<label htmlFor="subject">Subject</label>
										<input id="subject" type="text" placeholder="What can we help you with?" value={formData.subject} onChange={(e)=>setFormData({...formData, subject:e.target.value})} required />
                      </div>
									<div className="form-field">
										<label htmlFor="message">Message</label>
										<textarea id="message" rows="6" placeholder="Please describe your question or issue in detail..." value={formData.message} onChange={(e)=>setFormData({...formData, message:e.target.value})} required />
                      </div>
									<button className="submit-btn" type="submit">Send Message</button>
                    </form>
                  </>
                )}
          </div>

					<div className="right-col">
						<div className="card">
							<div className="info">
								<div className="info-icon">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
										<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
										<circle cx="12" cy="10" r="3"></circle>
									</svg>
								</div>
								<div>
									<h4>Campus Location</h4>
									<p className="muted">Quezon City University</p>
									<p className="muted">673 Quirino Highway</p>
									<p className="muted">San Bartolome, Novaliches</p>
									<p className="muted">Quezon City, Philippines</p>
								</div>
                    </div>
                  </div>

						<div className="card">
							<div className="info">
								<div className="info-icon">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
										<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
									</svg>
								</div>
								<div>
									<h4>Phone Support</h4>
									<p className="muted">+63 (2) 8806-3549</p>
									<p className="muted">Mon-Fri: 8:00 AM - 5:00 PM</p>
									<p className="muted">Emergency: 24/7</p>
								</div>
							</div>
						</div>

						<div className="card">
							<div className="info">
								<div className="info-icon">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
										<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
										<polyline points="22,6 12,13 2,6"></polyline>
									</svg>
								</div>
								<div>
									<h4>Email Support</h4>
									<p className="muted">ecocharge@qcu.edu.ph</p>
									<p className="muted">support@qcu.edu.ph</p>
									<p className="muted">Response time: 2-4 hours</p>
								</div>
							</div>
						</div>

						<div className="card">
							<div className="info">
								<div className="info-icon">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
										<circle cx="12" cy="12" r="10"></circle>
										<polyline points="12,6 12,12 16,14"></polyline>
									</svg>
								</div>
								<div>
									<h4>Operating Hours</h4>
									<p className="muted">Charging Stations: 24/7</p>
									<p className="muted">Technical Support:</p>
									<p className="muted">Mon-Fri: 8:00 AM - 5:00 PM</p>
									<p className="muted">Sat: 9:00 AM - 3:00 PM</p>
								</div>
							</div>
						</div>
          </div>
          </div>
        </div>

      </div>
    );
  }
  
  export default Contact;