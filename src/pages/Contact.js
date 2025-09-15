import React, { useState } from 'react';
import "../styles/Contact.css";

function Contact() {
	const [user, setUser] = useState(null);
	const [formData, setFormData] = useState({ subject: "", message: "" });

	function handleGoogleLogin(){
		setUser({
			name: "John Doe",
			email: "student@qcu.edu.ph",
			avatar: "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff"
		});
	}

	function handleSubmit(e){
		e.preventDefault();
		// mock submit
		alert("Message sent! We'll get back to you soon.");
		setFormData({ subject: "", message: "" });
	}
  return (
		<div id="contact-page">
			<div className="container">
				<div className="header">
					<span className="badge">Get In Touch</span>
					<h1>Contact Us</h1>
					<p className="subtitle">Have questions about our EcoCharge stations? Need technical support? We're here to help! Reach out to us through any of the channels below.</p>
        </div>

				<div className="grid">
					<div className="card left">
						<h3>Send us a Message</h3>
						<p className="desc">Fill out the form below and we'll get back to you as soon as possible.</p>
						{!user && (
							<div className="login-box">
								<p className="muted">Please log in to send us a message</p>
								<button className="google-btn" onClick={handleGoogleLogin}>
									<span className="google-icon">◎</span>
                      Continue with Google
								</button>
                  </div>
						)}

						{user && (
							<>
								<div className="user-box">
									<img src={user.avatar} alt={user.name} />
                      <div>
										<p className="user-name">{user.name}</p>
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
								<div className="info-icon">📍</div>
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
								<div className="info-icon">📞</div>
								<div>
									<h4>Phone Support</h4>
									<p className="muted">+63 (2) 8806-3549</p>
									<p className="muted">Mon-Fri: 8:00 AM - 5:00 PM</p>
									<p className="muted">Emergency: 24/7</p>
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