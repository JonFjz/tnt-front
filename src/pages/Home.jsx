
import Starfield from '../components/StarFieldStart.jsx'

import GlassButton from '../components/GlassButton.jsx'
import { BsRocketTakeoff, BsPeople } from 'react-icons/bs'
// If you want the 3D version, import Kepler3D and use it below.
// import Kepler3D from '../components/Kepler3D.jsx'
import keplerPng from '../assets/images/kepler.png'

export default function Home() {
  return (
    <div className="screen">
      <Starfield />
      {/* <KeplerOBJ /> */}

      <div className="hero">
        <div className='mb-5'>
            <h1 className="title">A WORLD AWAY</h1>
            <p className="subtitle">
            Embark on your journey to uncharted worlds with AI-powered exoplanet analysis.
            </p>
        </div>
        <div className="buttons">
          <GlassButton
            to="/start"
            icon={BsRocketTakeoff}
            title="Start"
            subtitle="Launch Star Analyzer"
          />
          <GlassButton
            to="/team"
            icon={BsPeople}
            title="Team"
            subtitle="View Falcon Works"
          />
        </div>
      </div>

      
    </div>
  )
}
