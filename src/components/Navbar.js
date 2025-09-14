import react from "react"
import "../styles/Navbar.css"

function Navbar () {
    
    
    return (
        <div id="navbar">
            <span id="left">
                QCU EcoCharge
            </span>

            <span id="middle">
                <ul id="pages">
                    <li>Home</li>
                    <li>About</li>
                    <li>Overview</li>
                    <li>Contact</li>
                    <li>Rate Us</li>
                    <li>Report a Problem</li>
                </ul>
            </span>

            <span id="right">
                TOGGLE BUTTON
            </span>
        </div>
    )
}

export default Navbar