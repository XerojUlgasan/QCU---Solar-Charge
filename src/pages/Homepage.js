import React from "react";
import "../styles/Homepage.css"

function Homepage() {

    return (
        <div id="homepage">
            <div id="l1">
                <div className="box" id="left">
                    <span>Sustainable Technology</span>
                    <h1>QCU EcoCharge Station</h1>
                    <p>Charge your devices with clean, renewable solar energy. Our innovative charging stations provide convenient, eco-friendly power solutions across campus.</p>
                    <div id="l1-button">
                        <button className="l1-buttons">Find Stations</button>
                        <button className="l1-buttons">Learn More</button>
                    </div>
                </div>
                <div className="box" id="right">
                    <img/>
                    <span>Card</span>
                </div>
            </div>

            <div id="l2">
                <div id="idk">
                    <span>
                        <h1>25+</h1>
                        <p>Active Station</p>
                    </span>
                    <span>
                        <h1>1,200+</h1>
                        <p>Monthly Users</p>
                    </span>
                    <span>
                        <h1>500kg</h1>
                        <p>CO₂ Saved</p>
                    </span>
                    <span>
                        <h1>2.5MWh</h1>
                        <p>Energy Generated</p>
                    </span>
                </div>

                <div id="words">
                    <h2>Why Choose QCU EcoCharge?</h2>
                    <p>Our solar-powered charging stations combine sustainability with convenience, offering a reliable and eco-friendly way to keep your devices powered.</p>
                </div>

                <div id="cards">
                    <div>
                        <img/>
                        <h4>Solar-Powered Charging</h4>
                        <p>Clean energy from solar panels powers your device charging needs</p>
                    </div>
                    <div>
                        <img/>
                        <h4>Solar-Powered Charging</h4>
                        <p>Clean energy from solar panels powers your device charging needs</p>
                    </div>
                    <div>
                        <img/>
                        <h4>Solar-Powered Charging</h4>
                        <p>Clean energy from solar panels powers your device charging needs</p>
                    </div>
                    <div>
                        <img/>
                        <h4>Solar-Powered Charging</h4>
                        <p>Clean energy from solar panels powers your device charging needs</p>
                    </div>
                </div>
            </div>

            <div id="l3">
                <h3>Ready to Start Charging Sustainably?</h3>
                <p>Join thousands of users who have made the switch to eco-friendly charging.</p>
                <div id="l3-buttons">
                    <button>Get your RFID card</button>
                    <button>View Location</button>
                </div>
            </div>
        </div>
    )
}

export default Homepage;