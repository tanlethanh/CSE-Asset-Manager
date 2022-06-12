import React from 'react';
import '../../styles/headerfooter.css'
import { useNavigate } from 'react-router-dom';

export function Header(props) {
    const navigate = useNavigate();

    return (
        <header id="header">
            <ul>
                <li className="header-left">
                    <a className="text-logo">
                        <em className="text-logo-1">Asset</em>
                        <em className="text-logo-2">cse</em>
                    </a>
                </li>
                <li className="header-right">

                    <div className="nav-btn" onClick={() => {
                        props.setChecklist(false)
                        navigate("../", { replace: true })
                    }}>Home</div>

                    <div className="nav-btn" onClick={() => {
                        props.setChecklist(false)
                        navigate("../dashboard", { replace: true })
                    }}>Dash board</div>

                    <a
                        className="nav-btn"
                        onClick={
                            () => {
                                props.setChecklist(!props.checklist)
                            }
                        }>
                        <i className="fa-solid fa-box-open"></i>
                    </a>
                </li>
            </ul>
        </header>
    )
}

export function Footer() {
    const navigate = useNavigate();
    return (
        <footer className="footer">
            <div className="top_footer">
                <div className="info">
                    <h3 className="footer-title">Information</h3>
                    <p>...</p>
                </div>
                <div className="navi">
                    <h3 className="footer-title">Navigation</h3>
                    <div className="item item_btn" onClick={() => {
                        navigate("../", { replace: true })
                    }}>
                        <i className="fa-solid fa-angle-right"></i>
                        <p>Home page</p>
                    </div>
                    <div className="item item_btn" onClick={() => {
                        navigate("../dashboard", { replace: true })
                    }}>
                        <i className="fa-solid fa-angle-right"></i>
                        <p>Dash board </p>
                    </div>
                </div>
                <div className="contact">
                    <h3 className="footer-title">Contact</h3>
                    <a className="item">
                        <i className="fa-solid fa-location-dot"></i>
                        <p>602 H6</p>
                    </a>
                    <a className="item">
                        <i className="fa-solid fa-envelope"></i>
                        <p>admin@hcmut.edu.vn</p>
                    </a>
                </div>
            </div>
            <div className="bot_footer">
                <div className="social">
                    <i className="fa-brands fa-facebook-square"></i>
                    <i className="fa-brands fa-twitter-square"></i>
                    <i className="fa-brands fa-instagram-square"></i>
                    <i className="fa-brands fa-linkedin"></i>
                </div>
                <div className="another">
                    <h4 className="left">Allright Reserved ...</h4>
                    <div className="right">
                        <h4>Disclaimer</h4>
                        <h4>Privacy Policy</h4>
                        <h4>Term Of Use</h4>
                    </div>
                </div>
            </div>
        </footer>
    )
}

