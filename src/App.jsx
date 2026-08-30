import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Clone, ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import './App.css'

function SmartwatchModel(props) {
  const { scene } = useGLTF('/models/ApplewatchClone1_13.glb')
  return <Clone object={scene} {...props} />
}

useGLTF.preload('/models/ApplewatchClone1_13.glb')

function Loader() {
  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      <boxGeometry args={[0.26, 0.26, 0.26]} />
      <meshStandardMaterial color="#4ee4c6" wireframe />
    </mesh>
  )
}

const bubblePoints = Array.from({ length: 58 }, (_, index) => {
  const angle = (index * 137.5 * Math.PI) / 180
  const radius = 13 + ((index * 17) % 37)
  return {
    id: index,
    left: 50 + Math.cos(angle) * radius,
    top: 50 + Math.sin(angle) * radius * 0.68,
    size: 0.28 + ((index * 11) % 12) / 10,
    delay: -((index * 0.29) % 5),
  }
})

function BubbleField() {
  return (
    <div className="bubble-field" aria-hidden="true">
      <div className="bubble-aura" />
      {bubblePoints.map((bubble) => (
        <span
          key={bubble.id}
          className="micro-bubble"
          style={{
            '--bubble-left': `${bubble.left}%`,
            '--bubble-top': `${bubble.top}%`,
            '--bubble-size': `${bubble.size}rem`,
            '--bubble-delay': `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function SensorLabel({ position, acronym, title, detail, reveal }) {
  return (
    <article
      className={`sensor-label ${position}`}
      style={{ '--sensor-reveal': reveal, '--sensor-shift': `${(1 - reveal) * 3.5}rem` }}
    >
      <p className="sensor-acronym">{acronym}</p>
      <h2>{title}</h2>
      <span />
      <p className="sensor-detail">{detail}</p>
    </article>
  )
}

function DataMetric({ children, reveal, delay = 0 }) {
  return (
    <li
      className="data-metric"
      style={{
        '--metric-reveal': reveal,
        '--metric-delay': `${delay}s`,
        '--metric-shift': `${(1 - reveal) * 1.5}rem`,
      }}
    >
      {children}
    </li>
  )
}

function WatchScene({ controlsRef }) {
  return (
    <Canvas shadows camera={{ position: [0.34, 0.18, 0.68], fov: 33 }} className="watch-canvas">
      <ambientLight intensity={0.82} />
      <directionalLight position={[2, 3, 2]} intensity={1.5} castShadow />
      <pointLight position={[-1.5, 0.7, 1]} intensity={1.32} color="#57e8ff" />
      <Suspense fallback={<Loader />}>
        <SmartwatchModel scale={6.15} position={[0, -0.04, 0]} rotation={[0.11, -0.43, 0.05]} />
        <Environment preset="city" />
      </Suspense>
      <ContactShadows position={[0, -0.36, 0]} opacity={0.56} blur={2.5} far={2.2} />
      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={false} enableRotate />
    </Canvas>
  )
}

export default function App() {
  const journeyRef = useRef(null)
  const controlsRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const updateProgress = () => {
      frame = 0
      const journey = journeyRef.current
      if (!journey) return
      const rect = journey.getBoundingClientRect()
      const distance = Math.max(journey.offsetHeight - window.innerHeight, 1)
      const nextProgress = Math.min(1, Math.max(0, -rect.top / distance))
      setProgress((current) => (Math.abs(current - nextProgress) > 0.002 ? nextProgress : current))
    }
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const clamp = (value) => Math.min(1, Math.max(0, value))
  const heroOpacity = clamp(1 - progress * 3.4)
  // Section 2 reaches full presence first, holds its own moment, then hands off to section 3.
  const sensorReveal = clamp((progress - 0.16) / 0.2)
  const watchSettle = clamp(progress / 0.42)
  const sectionTwoFade = 1 - clamp((progress - 0.8) / 0.16)
  const sectionThreeReveal = clamp((progress - 0.82) / 0.16)
  const sectionThreeSignal = clamp((progress - 0.86) / 0.1)
  const sectionThreeTransform = clamp((progress - 0.92) / 0.06)
  const sectionThreeFeatures = clamp((progress - 0.96) / 0.04)
  const zoomWatch = (direction) => {
    const controls = controlsRef.current
    if (!controls) return
    if (direction === 'in') controls.dollyOut(1.32)
    else controls.dollyIn(1.32)
    controls.update()
  }

  const resetWatch = () => controlsRef.current?.reset()

  return (
    <main className="journey" ref={journeyRef}>
      <div className="journey-sticky">
        <div className="journey-grid" aria-hidden="true" />
        <div className="ambient-light" aria-hidden="true" />

        <section className="hero-copy" style={{ '--hero-opacity': heroOpacity, '--hero-lift': `${progress * -4}rem` }}>
          <p className="hero-eyebrow">OpenWear - Laboratorio de salud wearable</p>
          <h1>Lo que tu reloj<span>s&iacute; puede revelar</span></h1>
          <p className="hero-description">Convierte se&ntilde;ales invisibles en una historia clara sobre tu cuerpo, tus h&aacute;bitos y tu bienestar.</p>
          <div className="hero-actions">
            <button type="button" onClick={() => zoomWatch('in')}>Acercar reloj</button>
            <button type="button" className="quiet-button" onClick={() => zoomWatch('out')}>Alejar reloj</button>
            <button type="button" className="quiet-button" onClick={resetWatch}>Restablecer vista</button>
          </div>
        </section>

        <div
          className="sensor-heading"
          style={{
            '--sensor-reveal': sensorReveal,
            '--sensor-shift': `${(1 - sensorReveal) * 2.5}rem`,
            '--section-two-fade': sectionTwoFade,
          }}
        >
          <p>Tu cuerpo, en tiempo real</p>
          <span>Cada lectura suma una pieza a tu bienestar.</span>
        </div>

        <div style={{ '--sensors-opacity': sensorReveal * sectionTwoFade }}><BubbleField /></div>
        <div
          className="watch-journey"
          style={{
            '--watch-x': `${69 - watchSettle * 19}%`,
            '--watch-scale': 0.76 + watchSettle * 0.24,
            '--watch-fade': sectionTwoFade,
            '--watch-blur': `${(1 - sectionTwoFade) * 18}px`,
          }}
        >
          <WatchScene controlsRef={controlsRef} />
        </div>

        <div className="sensors-layer" style={{ '--sensors-opacity': sensorReveal * sectionTwoFade }}>
          <SensorLabel position="sensor-ppg" acronym="PPG" title={<>Pulso &oacute;ptico</>} detail={<>Ritmo card&iacute;aco</>} reveal={sensorReveal} />
          <SensorLabel position="sensor-ecg" acronym="ECG" title="Electrocardiograma" detail={<>Actividad el&eacute;ctrica</>} reveal={sensorReveal} />
          <SensorLabel position="sensor-spo" acronym="SpO2" title={<>Ox&iacute;geno en sangre</>} detail={<>Saturaci&oacute;n estimada</>} reveal={sensorReveal} />
          <SensorLabel position="sensor-motion" acronym="3D" title="Movimiento" detail={<>Aceler&oacute;metro y giroscopio</>} reveal={sensorReveal} />
          <SensorLabel position="sensor-temp" acronym="TEMP" title="Temperatura" detail={<>Tendencias de tu mu&ntilde;eca</>} reveal={sensorReveal} />
        </div>

        <div
          className="sensor-zoom"
          style={{
            '--sensor-reveal': sensorReveal * sectionTwoFade,
            '--sensor-shift': `${(1 - sensorReveal) * 2}rem`,
          }}
        >
          <button type="button" aria-label="Alejar reloj" onClick={() => zoomWatch('out')}>-</button>
          <button type="button" aria-label="Restablecer vista" onClick={resetWatch}>Reset</button>
          <button type="button" aria-label="Acercar reloj" onClick={() => zoomWatch('in')}>+</button>
        </div>

        <p className="scroll-cue" style={{ '--hero-opacity': heroOpacity }}>Desliza para explorar</p>

        <section
          className="data-story"
          style={{
            '--data-reveal': sectionThreeReveal,
            '--data-shift': `${(1 - sectionThreeReveal) * 5}rem`,
            '--signal-reveal': sectionThreeSignal,
            '--transform-reveal': sectionThreeTransform,
            '--features-reveal': sectionThreeFeatures,
          }}
        >
          <div className="data-story-copy">
            <p className="data-story-eyebrow">Seccion 3</p>
            <h2>From Signal to Data</h2>
            <p className="data-story-lead">La c&aacute;mara entra al sensor. El smartwatch desaparece. Lo que queda es la se&ntilde;al en bruto y el camino para convertirla en datos legibles.</p>
          </div>

          <div className="signal-stage" aria-hidden="true">
            <div className="signal-card raw-signal">
              <span className="signal-label">RAW SIGNAL</span>
              <pre>__/\/\____/\___/\/\__</pre>
            </div>

            <div className="transformation-flow">
              <article className="signal-card filtering-card">
                <h3>Filtering</h3>
                <div className="signal-compare">
                  <pre>__/\/\_/\_/\/\___</pre>
                  <span className="signal-arrow">↓</span>
                  <pre>__/\/\__/\/\__/\/\__</pre>
                </div>
              </article>

              <article className="signal-card features-card">
                <h3>Feature extraction</h3>
                <div className="feature-graph">
                  <pre>{`Peak
 |
 /\\        /\\
/  \\______/  \\`}</pre>
                </div>
                <ul className="feature-metrics">
                  <DataMetric reveal={sectionThreeFeatures} delay={0}>Heart Rate</DataMetric>
                  <DataMetric reveal={sectionThreeFeatures} delay={0.08}>RR intervals</DataMetric>
                  <DataMetric reveal={sectionThreeFeatures} delay={0.16}>HRV</DataMetric>
                  <DataMetric reveal={sectionThreeFeatures} delay={0.24}>Motion</DataMetric>
                  <DataMetric reveal={sectionThreeFeatures} delay={0.32}>Respiration</DataMetric>
                </ul>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
