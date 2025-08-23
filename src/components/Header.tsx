import { useState } from 'react'
import bugIcon from '../assets/bug-white-32.svg'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header style={{ paddingBottom: '20px' }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-light">
        <div className="container-fluid container">
          <a className="navbar-brand text-white d-flex align-items-center" href="#">
            <img src={bugIcon} alt="Bug Tracker" className="me-2" style={{ width: '32px', height: '32px' }} />
            <span className="title fw-bold">Issue Tracker</span>
          </a>
          <button 
            className="navbar-toggler border-white d-lg-none" 
            type="button" 
            onClick={toggleMenu}
            aria-controls="navbarNavDropdown" 
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* Desktop Menu */}
          <div className="navbar-collapse d-none d-lg-block" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active text-white fw-bold" aria-current="page" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light" href="#about">
                  Über
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light" href="mailto:peter.stroessler@bluewin.ch?subject=todoapp">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''} d-lg-none`}>
        <div className="mobile-menu-content">
          <ul className="navbar-nav text-center">
            <li className="nav-item">
              <a 
                className="nav-link active text-white fw-bold py-3" 
                aria-current="page" 
                href="#"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link text-light py-3" 
                href="#about"
                onClick={() => setIsMenuOpen(false)}
              >
                Über
              </a>
            </li>
            <li className="nav-item">
              <a 
                className="nav-link text-light py-3" 
                href="mailto:peter.stroessler@bluewin.ch?subject=todoapp"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakt
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header
