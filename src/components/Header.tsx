import bugIcon from '../assets/bug-white-32.svg'

function Header() {
  return (
    <header style={{ paddingBottom: '20px' }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-light">
        <div className="container-fluid container">
          <a className="navbar-brand text-white d-flex align-items-center" href="#">
            <img src={bugIcon} alt="Bug Tracker" className="me-2" style={{ width: '32px', height: '32px' }} />
            <span className="title fw-bold">Issue Tracker</span>
          </a>
          <button 
            className="navbar-toggler border-white" 
            type="button" 
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown" 
            aria-controls="navbarNavDropdown" 
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="navbar-collapse collapse" id="navbarNavDropdown">
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
    </header>
  )
}

export default Header
