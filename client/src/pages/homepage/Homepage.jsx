import React, { useState, useEffect, lazy, Suspense, memo } from "react";
import { Link } from "react-router-dom";
import {
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "../../css/HomePage.css";

// Memoized components for sections that don't change
const MemoizedFooter = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About</h3>
          <p>
            Your complete invoice management solution for modern businesses.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/auth">Login</Link>
            </li>
            <li>
              <Link to="/auth">Sign Up</Link>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#about">About Us</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <ul>
            <li>
              <FaEnvelope className="footer-icon" />
              <span>mahadhyutaedtech@gmail.com</span>
            </li>
            <li>
              <FaPhone className="footer-icon" />
              <span>+91 9452801761</span>
            </li>
            <li>
              <FaMapMarkerAlt className="footer-icon" />
              <span>
                Bhubaneswar Odisha IRC Village Nayapalli,
                <br />
                India - 751015
              </span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="social-icon" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin className="social-icon" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="social-icon" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-text">
          &copy; All rights reserved by MahadhyutaEdTech
        </p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/cookies">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
});

// Lazy load components that are not initially visible
const LazyAboutSection = lazy(() => import("./AboutSection"));
const LazyContactSection = lazy(() => import("./ContactSection"));

// Optimized image component with lazy loading
const OptimizedImage = memo(({ src, alt, className, priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <div className={`image-placeholder ${className}`} />}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? "loaded" : "loading"}`}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
});

// Feature box component
const FeatureBox = memo(({ title, text, imageSrc, imageAlt }) => (
  <div className="feature-box">
    <h3 className="feature-title">{title}</h3>
    <p className="feature-text">{text}</p>
    <OptimizedImage src={imageSrc} alt={imageAlt} className="feature-image" />
  </div>
));

// Add this after other component definitions and before the Home component
const CompanyDetails = memo(() => (
  <section className="company-details">
    <div className="company-content">
      <h2 className="company-title">About Our Company</h2>
      <div className="company-stats">
        <div className="stat-item">
          <span className="stat-value">5000+</span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">98%</span>
          <span className="stat-label">Customer Satisfaction</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">24/7</span>
          <span className="stat-label">Customer Support</span>
        </div>
      </div>
      <div className="company-description">
        <p>
          MahadhyutaEdTech is a leading provider of innovative billing
          solutions, committed to simplifying financial management for
          businesses worldwide.MahadhyutaEdTech, a leader in technology
          innovation focused on AI and ML projects for the education sector. Our
          solutions empower students with cutting-edge tools, enhancing learning
          experiences and outcomes. Join us in shaping the future of education
          through technology and innovation.
        </p>
      </div>
    </div>
  </section>
));

const Home = () => {
  const [isVisible, setIsVisible] = useState({
    about: false,
    contact: false,
  });

  // Use IntersectionObserver to detect when sections come into view
  useEffect(() => {
    document.body.classList.add("home-page");

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const aboutObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible((prev) => ({ ...prev, about: true }));
        aboutObserver.disconnect();
      }
    }, observerOptions);

    const contactObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible((prev) => ({ ...prev, contact: true }));
        contactObserver.disconnect();
      }
    }, observerOptions);

    const aboutSection = document.getElementById("about-section");
    const contactSection = document.getElementById("contact-section");

    if (aboutSection) aboutObserver.observe(aboutSection);
    if (contactSection) contactObserver.observe(contactSection);

    return () => {
      document.body.classList.remove("home-page");
      aboutObserver.disconnect();
      contactObserver.disconnect();
    };
  }, []);

  return (
    <div className="home-page-wrapper">
      <div className="home-container">
        {/* Navigation Bar */}
        <nav className="navbar">
          <h1 className="logo">My Billing App</h1>
          <div className="nav-links">
            <Link to="/auth" className="nav-button">
              Login
            </Link>
            <Link to="/auth" className="nav-button">
              Signup
            </Link>
          </div>
        </nav>

        {/* Hero Section - Prioritize loading for above-the-fold content */}
        <header className="hero">
          <OptimizedImage
            src="invoice.jpg"
            alt="invoice"
            className="hero-image"
            priority={true}
          />
          <div className="hero-content">
            <h2 className="hero-title">Welcome to My Billing App</h2>
            <p className="hero-text">
              A simple and secure way to manage your invoices and learning.
            </p>
            <Link to="/auth" className="hero-button">
              Get Started
            </Link>
          </div>
        </header>

        {/* Features Section - Memoized components */}
        <section className="features">
          <FeatureBox
            title="Secure Authentication"
            text="Login with OTP and email verification for enhanced security."
            imageSrc="authentication.jpg"
            imageAlt="Secure Authentication"
          />
          <FeatureBox
            title="Invoice Management"
            text="Easily track and manage your billing invoices."
            imageSrc="invoice_management.jpg"
            imageAlt="Invoice Management"
          />
          <FeatureBox
            title="Database Management"
            text="Manage your database and resources in one place."
            imageSrc="Database.jpg"
            imageAlt="Database Management"
          />
        </section>

        {/* About Section - Lazy loaded */}
        <div id="about-section">
          {isVisible.about && (
            <Suspense
              fallback={
                <div className="loading-section">Loading about section...</div>
              }
            >
              <LazyAboutSection />
            </Suspense>
          )}
        </div>

        {/* Interactive Showcase Section */}
        <section className="interactive-showcase">
          <div className="showcase-content">
            <div className="showcase-text">
              <h2 className="showcase-title">Powerful Invoice Management</h2>
              <ul className="feature-list">
                {[
                  { id: 1, text: "Create professional invoices in minutes" },
                  { id: 2, text: "Track payments in real-time" },
                  { id: 3, text: "Automated payment reminders" },
                ].map((item) => (
                  <li
                    key={item.id}
                    className="feature-item"
                    onMouseEnter={(e) => e.target.classList.add("active")}
                    onMouseLeave={(e) => e.target.classList.remove("active")}
                  >
                    <span className="feature-number">0{item.id}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="showcase-image-wrapper">
              <OptimizedImage
                src="invoice_2.jpg"
                alt="Invoice Management Interface"
                className="showcase-image"
              />
              <div className="image-overlay">
                <div className="stat-card">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Faster Processing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Details Section */}
        <CompanyDetails />

        {/* Contact Section - Lazy loaded */}
        <div id="contact-section">
          {isVisible.contact && (
            <Suspense
              fallback={
                <div className="loading-section">
                  Loading contact section...
                </div>
              }
            >
              <LazyContactSection />
            </Suspense>
          )}
        </div>

        {/* Footer - Memoized */}
        <MemoizedFooter />
      </div>
    </div>
  );
};

export default Home;
