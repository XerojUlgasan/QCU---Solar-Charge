import React from 'react';
import "../styles/Contact.css";

function Contact() {
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
						<div className="login-box">
							<p className="muted">Please log in to send us a message</p>
							<button className="google-btn">
								<span className="google-icon">◎</span>
								Continue with Google
							</button>
						</div>
					</div>

					<div className="card right">
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
				</div>
			</div>
		</div>
	);
}

export default Contact;