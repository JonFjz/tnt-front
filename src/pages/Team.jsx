// src/pages/TeamPage.jsx
import React from "react"
import { useNavigate } from "react-router-dom"
import Starfield from "../components/StarFieldStart.jsx"
import "./TeamPage.css"
import FalconLogo from "../assets/images/falcon_works_logo.png"
import Luri from "../assets/images/Luri.jpg"
import Zana from "../assets/images/Zana.jpg"
import Drin from "../assets/images/Drini.jpg"
import Jon from "../assets/images/Joni.jpg"
import Olt from "../assets/images/Olt.jpg"

export default function TeamPage() {
   const navigate = useNavigate();
  return (
    <main className="team-page">
      {/* Starfield background */}
      <div className="background-layer">
        <Starfield />
        <div className="bg-fade-overlay" />
      </div>
      <div className="hamburger-icon" onClick={() => navigate('/')}>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </div>

      {/* Foreground content */}
      <div className="content-layer">
        {/* === HERO / INTRO === */}
        <section className="hero-section glass-block">
          <div className="hero-header">
            <img src={FalconLogo} alt="Falcon Works" className="hero-image" />
            <div className="hero-text">
            <h1 className="hero-title">
              Falcon Works <span className="accent-dot">✦</span>
            </h1>
            <p className="hero-tagline">
              Turning starlight into discovery
            </p>
            </div>
          </div>

          <p className="hero-desc">
            We’re building an AI-powered pipeline that scans raw space
            telescope data and flags possible exoplanets — planets orbiting
            other stars. The mission is simple: accelerate discovery so humans
            can spend more time doing science instead of digging through noise.
          </p>
        </section>

        {/* === TEAM GRID === */}
        <section className="section-block">
          <header className="section-header">
            <h2 className="section-title">
              <span className="section-bar" /> The Team
              
            </h2>
           
          </header>

          <div className="team-grid">
            {/* Member 1 */}
            <article 
              className="member-card glass-card clickable-card"
              onClick={() => window.open('https://www.linkedin.com/in/luri-morina-b49aa2281/', '_blank')}
            >
              <div className="member-top">
                <div className="avatar-circle">
                  <img
                    src={Luri}
                    alt="Luri Morina"
                    className="avatar-img"
                  />
                </div>
                <div className="member-id">
                  <div className="member-name">Luri Morina</div>
                  <div className="member-role">Team Lead · Backend/Astro Research</div>
                </div>
              </div>
              <p className="member-bio">
                Responsible for overall system architecture. Designed the backend pipeline, data flow, and model integration workflow. Built the core infrastructure that connects raw mission data (TESS / Kepler) to analysis, classification, storage, and delivery to the frontend in a usable form.
              </p>
            </article>

            {/* Member 2 */}
            <article 
              className="member-card glass-card clickable-card"
              onClick={() => window.open('https://www.linkedin.com/in/zana-misini-572394332/', '_blank')}
            >
              <div className="member-top">
                <div className="avatar-circle">
                  <img
                    src={Zana}
                    alt="Zana Misini"
                    className="avatar-img"
                  />
                </div>
                <div className="member-id">
                  <div className="member-name">Zana Misini</div>
                  <div className="member-role">Machine Learning Lead</div>
                </div>
              </div>
              <p className="member-bio">
                Leads the ML side. Trained and evaluated our exoplanet detection models on NASA mission data, optimized transit classification, tuned model performance, and established a repeatable training process so models can be trained by anyone.
              </p>
            </article>

            {/* Member 3 */}
            <article 
              className="member-card glass-card clickable-card"
              onClick={() => window.open('https://www.linkedin.com/in/drinduka/', '_blank')}
            >
              <div className="member-top">
                <div className="avatar-circle">
                  <img
                    src={Drin}
                    alt="Drin Duka"
                    className="avatar-img"
                  />
                </div>
                <div className="member-id">
                  <div className="member-name">Drin Duka</div>
                  <div className="member-role">Backend / AI</div>
                </div>
              </div>
              <p className="member-bio">
                Implemented the light curve processing layer. Developed the code that ingests telescope flux data, cleans it, extracts features, and prepares it for ML. This is what turns “brightness over time” into “is there a planet here or not.
              </p>
            </article>

            {/* Member 4 */}
            <article 
              className="member-card glass-card clickable-card"
              onClick={() => window.open('https://www.linkedin.com/in/jon-fejzullahu-507899177/', '_blank')}
            >
              <div className="member-top">
                <div className="avatar-circle">
                  <img
                    src={Jon}
                    alt="Jon Fejzullahu"
                    className="avatar-img"
                  />
                </div>
                <div className="member-id">
                  <div className="member-name">Jon Fejzullahu</div>
                  <div className="member-role">Data Ops / Dev Ops</div>
                </div>
              </div>
              <p className="member-bio">
                Built the operational backbone. Focused on data handling, pipeline reliability, and deployment. Made sure large datasets can move, be processed, and be served efficiently. Ensured the system can scale and stay stable.
              </p>
            </article>

            {/* Member 5 */}
            <article 
              className="member-card glass-card clickable-card"
              onClick={() => window.open('https://www.linkedin.com/in/olt-imeri/', '_blank')}
            >
              <div className="member-top">
                <div className="avatar-circle">
                  <img
                    src={Olt}
                    alt="Olt Imeri"
                    className="avatar-img"
                  />
                </div>
                <div className="member-id">
                  <div className="member-name">Olt Imeri</div>
                  <div className="member-role">UI / UX</div>
                </div>
              </div>
              <p className="member-bio">
                Designed and built the user interface. Created the React-based platform that lets users explore stars, view light curves, train models, and interpret AI results. Focused on usability, clarity, and explaining complex astrophysics concepts to non-experts through visualization and tooltips.
              </p>
            </article>
          </div>
        </section>

        {/* === ABOUT THE PROJECT === */}
        <section className="section-block">
          <header className="section-header">
            <h2 className="section-title">
              <span className="section-bar" /> About this Project
            </h2>
          </header>

          <div className="info-grid">
            <article className="info-card glass-card">
              <h3 className="info-title">What we're doing</h3>
              <p className="info-body">
                We’re building a web platform that turns NASA TESS/Kepler light curves into real-time exoplanet candidates. Under the hood, robust preprocessing and ML models flag likely transits. No PhD is required. Pick the star you are interested in and run the analysis to see if it has a planet.
              </p>
            </article>

            <article className="info-card glass-card">
              <h3 className="info-title">Why it matters</h3>
              <p className="info-body">
                Astronomy drowns in data; promising worlds get buried in the noise. By automating triage and making the pipeline transparent and reproducible, we cut time to discovery, reduce false positives, and open serious exoplanet hunting to students, researchers, and citizen scientists alike.
              </p>
            </article>

            <article className="info-card glass-card">
              <h3 className="info-title">Where it's going next</h3>
              <p className="info-body">
                The next step is training a “foundation model” for stellar time-series—LLM-style learning over massive light-curve corpora—so the system gets better with every star. Next steps: multi-mission generalization, active learning from user feedback, anomaly discovery, and one-click follow-up packages for telescope time.
              </p>
            </article>
          </div>
        </section>

        {/* === GIT REPOS === */}
        <section className="section-block">
          <header className="section-header">
            <h2 className="section-title">
              <span className="section-bar" /> See Git Repos
            </h2>
           
          </header>

          <div className="repo-grid">
            

            <article className="repo-card glass-card">
              <div className="repo-head">
                <div className="repo-name">falconworks-api</div>
                <div className="repo-tag">backend service</div>
              </div>
              <p className="repo-desc">
                REST API that serves searches light curves, runs the pipeline and runs the ML models. The core of the exoplanet detection system and model training
              </p>
              <a
                className="link-button"
                href="https://github.com/JonFjz/tnt-back.git"
                target="_blank"
                rel="noopener noreferrer"
              >
                View repo
                <span className="arrow">↗</span>
              </a>
            </article>

            <article className="repo-card glass-card">
              <div className="repo-head">
                <div className="repo-name">falconworks-ui</div>
                <div className="repo-tag">react frontend</div>
              </div>
              <p className="repo-desc">
                Interactive dashboard: star selector, signal viewer, custom
                training controls.
              </p>
              <a
                className="link-button"
                href="https://github.com/JonFjz/tnt-front.git"
                target="_blank"
                rel="noopener noreferrer"
              >
                View repo
                <span className="arrow">↗</span>
              </a>
            </article>
          </div>
        </section>

        {/* === LEARNING RESOURCES === */}
        <section className="section-block last-section">
          <header className="section-header">
            <h2 className="section-title">
              <span className="section-bar" /> Learn more about exoplanet
              hunting (References)
            </h2>
          </header>

          <div className="resources-grid">
            <article className="resource-card glass-card">
              <h3 className="resource-title">Transit Method (How we detect)</h3>
              <p className="resource-desc">
                When a planet crosses in front of its star, the star gets a
                tiny bit dimmer. Measuring that dip over time is how most
                exoplanets are confirmed.
              </p>
              <a
                className="link-button"
                href="https://exoplanets.nasa.gov/alien-worlds/ways-to-find-a-planet/#transit"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read more
                <span className="arrow">↗</span>
              </a>
            </article>

            <article className="resource-card glass-card">
              <h3 className="resource-title">TESS Mission Overview</h3>
              <p className="resource-desc">
                NASA’s Transiting Exoplanet Survey Satellite scans almost the
                whole sky for short-period planets around bright nearby stars.
              </p>
              <a
                className="link-button"
                href="https://heasarc.gsfc.nasa.gov/docs/tess/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mission page
                <span className="arrow">↗</span>
              </a>
            </article>

            <article className="resource-card glass-card">
              <h3 className="resource-title">Kepler / K2 Legacy Data</h3>
              <p className="resource-desc">
                Kepler stared at one patch of sky for years and produced the
                light curves that basically started the modern exoplanet boom.
              </p>
              <a
                className="link-button"
                href="https://archive.stsci.edu/kepler/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Data archive
                <span className="arrow">↗</span>
              </a>
            </article>

            <article className="resource-card glass-card">
              <h3 className="resource-title">NASA Exoplanet Archive</h3>
              <p className="resource-desc">
                Catalog of confirmed planets and candidates. You can browse
                real discovered systems, not sci-fi.
              </p>
              <a
                className="link-button"
                href="https://exoplanetarchive.ipac.caltech.edu/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Browse planets
                <span className="arrow">↗</span>
              </a>
            </article>

             <article className="resource-card glass-card">
              <h3 className="resource-title">Mikulski Archive for Space Telescopes</h3>
              <p className="resource-desc">
                The MAST Portal lets you search multiple collections of astronomical datasets all in one place. Use this tool to find astronomical data, publications, and images.
              </p>
              <a
                className="link-button"
                href="https://mast.stsci.edu/portal/Mashup/Clients/Mast/Portal.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Browse Stars
                <span className="arrow">↗</span>
              </a>
            </article>

             <article className="resource-card glass-card">
              <h3 className="resource-title">FITS Image Viewer</h3>
              <p className="resource-desc">
                FITS Image Software Packages for image viewing, analysis, and format conversion


                <br /><br /><br /><br /><br /><br />
              </p>
              <a
                className="link-button"
                href="https://fits.gsfc.nasa.gov/fits_viewer.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                See tools
                <span className="arrow">↗</span>
              </a>
            </article>
            
             <article className="resource-card glass-card">
              <h3 className="resource-title">Exoplanet detection using machine learning</h3>
              <p className="resource-desc">
                This research article gives a great overview of exoplanetary detection methods as well as machine learning aimed at exoplanetary classification and a survey of the literature in the field as it stood in 2021.
              </p>
              <a
                className="link-button"
                href="https://academic.oup.com/mnras/article/513/4/5505/6472249?login=false"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read more
                <span className="arrow">↗</span>
              </a>
            </article>
            <article className="resource-card glass-card">
              <h3 className="resource-title">Assessment of Ensemble-Based Machine Learning Algorithms for Exoplanet Identification</h3>
              <p className="resource-desc">
                This research article takes a good look at some of the machine learning techniques that have resulted in high accuracy using the datasets above. It also explores some of the pre-processing techniques that help achieve higher accuracy.
              </p>
              <a
                className="link-button"
                href="https://www.mdpi.com/2079-9292/13/19/3950"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read more
                <span className="arrow">↗</span>
              </a>
            </article>

            <article className="resource-card glass-card">
              <h3 className="resource-title">ExoMast</h3>
              <p className="resource-desc">
               exo.Mast is a fast, easy way to find exoplanet data from Kepler, K2, Hubble, TESS and JWST.
              </p>
              <a
                className="link-button"
                href="https://exo.mast.stsci.edu/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Search
                <span className="arrow">↗</span>
              </a>
            </article>
           
            <article className="resource-card glass-card">
              <h3 className="resource-title">Youtube playlist</h3>
              <p className="resource-desc">
                A curated Youtube playlist with videos explaining exoplanet detection methods, missions, and more.
              </p>
              <a
                className="link-button"
                href="https://www.youtube.com/watch?v=6s1LlzMNp78&list=PLQ4EOjmxKXM6qEeu8DbnnKjFyx5F_EJ9h"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
                <span className="arrow">↗</span>
              </a>
            </article>
          </div>
        </section>


        <footer className="footer-note">
          <p>
            Falcon Works — searching for small shadows in big skies.
          </p>
        </footer>
      </div>
    </main>
  )
}
