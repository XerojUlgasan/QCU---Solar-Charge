import react from "react"
import { NavLink, Link } from "react-router-dom"
import "../styles/Navbar.css"

function Navbar () {
    
    
    return (
        <div id="navbar">
            <span id="left">
                QCU EcoCharge
            </span>

            <span id="middle">
                <ul id="pages">
                    <li>
                        <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
                    </li>
                    <li>About</li>
                    <li>Overview</li>
                    <li>
                        <NavLink to="/contact" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Contact</NavLink>
                    </li>
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