import React from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const ContactSection = () => {
  return (
    <section className="contact">
      <h2 className="section-title">Contact Us</h2>
      <div className="contact-content">
        <p className="section-text">
          <FaEnvelope className="contact-icon" />
          <span>Email: </span>
          <a href="mahadhyutaedtech@gmail.com">mahadhyutaedtech@gmail.com</a>
        </p>
        <p className="section-text">
          <FaPhone className="contact-icon" />
          <span>Phone: </span>
          <a href="+91 9452801761">+91 9452801761</a>
        </p>
        <p className="section-text">
          <FaMapMarkerAlt className="contact-icon" />
          <span>Address: </span>
          Bhubaneswar Odisha IRC Village Nayapalli, India - 751015
        </p>
      </div>
    </section>
  );
};

export default ContactSection;
