import { Link } from "react-router-dom";
import "../styles/theme.css";

function Home() {
  return (
    <div className="home-page">
      <header className="navbar">
        <Link className="logo" to="/">
          <span>♻</span> CleanNeighbour
        </Link>

        <nav>
          <Link to="/login">Login</Link>
          <Link className="nav-button" to="/register">Register</Link>
        </nav>
      </header>

      <main>
        <section className="welcome">
          <div className="welcome-text">
            <p className="small-heading">A COMMUNITY CLEANUP PROJECT</p>
            <h1>Let's keep our neighbourhood clean.</h1>
            <p className="intro">
              CleanNeighbour helps residents report illegal dumping and follow
              cleanup progress in their area.
            </p>

          </div>

          <div className="report-card welcome-card">
            <div className="report-icon">🌱</div>
            <h2>Welcome to CleanNeighbour</h2>
            <p>
              Please log in or register to access the community reporting
              dashboard.
            </p>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-title">
            <p className="small-heading">HOW IT WORKS</p>
            <h2>Three simple steps</h2>
          </div>

          <div className="steps">
            <article className="step-card">
              <span className="step-number">1</span>
              <h3>Create an account</h3>
              <p>Register with your name and email or phone number.</p>
            </article>

            <article className="step-card">
              <span className="step-number">2</span>
              <h3>Report a waste issue</h3>
              <p>After signing in, add a photo, area and short description.</p>
            </article>

            <article className="step-card">
              <span className="step-number">3</span>
              <h3>Check the status</h3>
              <p>Follow the report and see when it is marked resolved.</p>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <span>CleanNeighbour</span>
      </footer>
    </div>
  );
}

export default Home;
