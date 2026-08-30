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

function DataMetric({ children, reveal, delay = 0, active, onSelect }) {
  return (
    <li
      className={`data-metric${active ? ' is-active' : ''}`}
      style={{
        '--metric-reveal': reveal,
        '--metric-delay': `${delay}s`,
        '--metric-shift': `${(1 - reveal) * 1.5}rem`,
      }}
    >
      <button type="button" onClick={onSelect} aria-pressed={active}>{children}</button>
    </li>
  )
}

function SignalWave({ clean = false, active }) {
  const points = clean
    ? '0,78 28,78 42,78 53,44 64,24 75,44 86,78 118,78 135,78 148,43 160,24 172,44 184,78 220,78 236,78 250,43 262,24 274,44 288,78 340,78'
    : '0,92 12,46 20,78 30,18 40,71 50,33 61,83 72,45 83,100 94,54 107,88 121,30 132,75 143,46 157,112 169,61 182,91 195,37 208,80 222,48 235,104 248,57 263,87 276,39 290,77 302,49 316,98 330,64 340,81'

  return (
    <svg className={`signal-wave${active ? ' is-active' : ''}`} viewBox="0 0 340 130" preserveAspectRatio="none" aria-hidden="true">
      <polyline className="signal-wave-shadow" points={points} />
      <polyline className="signal-wave-line" points={points} />
    </svg>
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
  const [signalPlaying, setSignalPlaying] = useState(true)
  const [activeMetric, setActiveMetric] = useState('Ritmo card\u00edaco')
  const [modelOpen, setModelOpen] = useState(false)
  const [activeApproach, setActiveApproach] = useState(null)

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
  const sectionTwoFade = 1 - clamp((progress - 0.5) / 0.12)
  const sectionThreeReveal = clamp((progress - 0.54) / 0.1)
  const sectionThreeSignal = clamp((progress - 0.57) / 0.08)
  const sectionThreeTransform = clamp((progress - 0.62) / 0.08)
  const sectionThreeFeatures = clamp((progress - 0.67) / 0.07)
  const sectionThreeClose = 1 - clamp((progress - 0.84) / 0.06)
  const sectionFourReveal = clamp((progress - 0.87) / 0.05)
  const sectionFourModel = clamp((progress - 0.89) / 0.05)
  const sectionFourExit = 1 - clamp((progress - 0.965) / 0.03)
  const sectionFiveReveal = clamp((progress - 0.975) / 0.025)
  const metricDescriptions = {
    'Ritmo card\u00edaco': 'latidos por minuto',
    'Intervalos RR': 'tiempo entre latidos consecutivos',
    'Variabilidad card\u00edaca': 'cambios naturales entre cada latido',
    Movimiento: 'patrones de aceleracion y giro',
    'Respiraci\u00f3n': 'ritmo respiratorio estimado',
  }
  const approachDetails = {
    'Se\u00f1al': {
      title: 'La se\u00f1al original',
      description: 'La lectura empieza como una variacion de luz y movimiento. Conservamos su contexto antes de procesarla.',
      steps: ['Captura optica', 'Conversion a voltaje', 'Revision de calidad'],
    },
    Filtrado: {
      title: 'Limpieza de la lectura',
      description: 'Separamos el pulso util de las interferencias producidas por movimiento, contacto o luz ambiental.',
      steps: ['Detectar ruido', 'Atenuar interferencias', 'Conservar la forma del pulso'],
    },
    'Caracter\u00edsticas': {
      title: 'Caracteristicas fisiologicas',
      description: 'Convertimos la forma de la senal en variables que se pueden inspeccionar y comparar.',
      steps: ['Ritmo cardiaco', 'Variabilidad cardiaca', 'Intervalos RR', 'Movimiento', 'Patrones respiratorios'],
    },
    Algoritmo: {
      title: 'Modelo interpretable',
      description: 'El modelo combina las variables y sus limites para estimar un resultado sin ocultar el recorrido.',
      steps: ['Ponderar variables', 'Estimar el patron', 'Calcular confianza'],
    },
    Resultado: {
      title: 'Resultado con contexto',
      description: 'La puntuacion se presenta junto con los elementos que la forman, no como una respuesta aislada.',
      steps: ['Puntuacion estimada', 'Tendencia personal', 'Nivel de confianza'],
    },
    Evidencia: {
      title: 'Evidencia que respalda',
      description: 'Cada conclusion debe poder relacionarse con una senal, una variable y un criterio verificable.',
      steps: ['Senal trazable', 'Criterio visible', 'Conclusion revisable'],
    },
  }
  const selectedApproach = activeApproach ? approachDetails[activeApproach] : null
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
            '--data-reveal': sectionThreeReveal * sectionThreeClose,
            '--data-shift': `${(1 - sectionThreeReveal) * 5}rem`,
            '--data-collapse': 1 - sectionThreeClose,
            '--data-collapse-shift': `${(1 - sectionThreeClose) * -4}rem`,
            '--data-collapse-scale': 1 - (1 - sectionThreeClose) * 0.1,
            '--data-close-blur': `${(1 - sectionThreeClose) * 10}px`,
            '--signal-reveal': sectionThreeSignal,
            '--transform-reveal': sectionThreeTransform,
            '--features-reveal': sectionThreeFeatures,
            '--signal-play-state': signalPlaying ? 'running' : 'paused',
            pointerEvents: sectionThreeReveal > 0.85 && sectionThreeClose > 0.15 ? 'auto' : 'none',
          }}
          aria-hidden={sectionThreeReveal < 0.1 || sectionThreeClose < 0.1}
        >
          <div className="data-story-copy">
            <p className="data-story-eyebrow">Del pulso a la informaci&oacute;n</p>
            <h2>La se&ntilde;al cobra sentido.</h2>
            <p className="data-story-lead">La luz rebota bajo tu piel y crea una se&ntilde;al con ruido. El reloj la limpia, encuentra sus picos y revela las lecturas que importan.</p>
            <p className="data-insight"><span>Lectura activa</span>{activeMetric}: {metricDescriptions[activeMetric]}.</p>
          </div>

          <div className="signal-stage">
            <div className="signal-card raw-signal">
              <div className="signal-card-topline">
                <span className="signal-label">SE&Ntilde;AL EN BRUTO</span>
                <button type="button" className="signal-toggle" onClick={() => setSignalPlaying((playing) => !playing)}>
                  <span className="signal-toggle-dot" />{signalPlaying ? 'Pausar lectura' : 'Reanudar lectura'}
                </button>
              </div>
              <SignalWave active={signalPlaying} />
              <p className="signal-caption">Luz y movimiento convertidos en pulsos de voltaje.</p>
            </div>

            <div className="transformation-flow">
              <article className="signal-card filtering-card">
                <p className="card-step">01</p>
                <h3>Filtrado</h3>
                <div className="signal-compare">
                  <SignalWave active={signalPlaying} />
                  <span className="signal-arrow">&darr;</span>
                  <SignalWave clean active={signalPlaying} />
                </div>
              </article>

              <article className="signal-card features-card">
                <p className="card-step">02</p>
                <h3>Extracci&oacute;n de caracter&iacute;sticas</h3>
                <div className="feature-graph">
                  <SignalWave clean active={signalPlaying} />
                  <span className="peak-marker peak-one">Pico</span>
                  <span className="peak-marker peak-two">Pico</span>
                  <pre>{`Peak
 |
 /\\        /\\
/  \\______/  \\`}</pre>
                </div>
                <ul className="feature-metrics">
                  <DataMetric reveal={sectionThreeFeatures} delay={0} active={activeMetric === 'Ritmo card\u00edaco'} onSelect={() => setActiveMetric('Ritmo card\u00edaco')}>Ritmo card&iacute;aco</DataMetric>
                  <DataMetric reveal={sectionThreeFeatures} delay={0.08} active={activeMetric === 'Intervalos RR'} onSelect={() => setActiveMetric('Intervalos RR')}>Intervalos RR</DataMetric>
                  <DataMetric reveal={sectionThreeFeatures} delay={0.16} active={activeMetric === 'Variabilidad card\u00edaca'} onSelect={() => setActiveMetric('Variabilidad card\u00edaca')}>Variabilidad card&iacute;aca</DataMetric>
                  <DataMetric reveal={sectionThreeFeatures} delay={0.24} active={activeMetric === 'Movimiento'} onSelect={() => setActiveMetric('Movimiento')}>Movimiento</DataMetric>
                  <DataMetric reveal={sectionThreeFeatures} delay={0.32} active={activeMetric === 'Respiraci\u00f3n'} onSelect={() => setActiveMetric('Respiraci\u00f3n')}>Respiraci&oacute;n</DataMetric>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section
          className="model-story"
          style={{
            '--model-reveal': sectionFourReveal,
            '--model-shift': `${(1 - sectionFourReveal) * 4}rem`,
            '--model-open': modelOpen ? 1 : 0,
            '--model-core': sectionFourModel,
            '--model-exit': sectionFourExit,
            '--model-opacity': sectionFourReveal * sectionFourExit,
            '--model-flow-x': `${(1 - sectionFourExit) * -20}vw`,
            '--model-flow-scale': 1 + (1 - sectionFourExit) * 0.55,
            '--model-copy-x': `${(1 - sectionFourExit) * -2}rem`,
            '--model-exit-blur': `${(1 - sectionFourExit) * 12}px`,
            '--model-aura-scale': 0.75 + sectionFourModel * 0.25,
            '--model-tilt-x': `${(1 - sectionFourModel) * 24}deg`,
            '--model-tilt-z': `${(1 - sectionFourModel) * -4}deg`,
            '--model-output-opacity': modelOpen ? 1 : 0.35,
            '--model-output-shift': modelOpen ? '0rem' : '0.8rem',
            pointerEvents: sectionFourReveal > 0.85 && sectionFourExit > 0.2 ? 'auto' : 'none',
          }}
          aria-hidden={sectionFourReveal < 0.1}
        >
          <div className="model-copy">
            <p className="model-eyebrow">De se&ntilde;al a decisi&oacute;n</p>
            <h2>Una predicci&oacute;n tambi&eacute;n tiene un camino.</h2>
            <blockquote>El problema no es solo lo que predice el wearable. La pregunta es c&oacute;mo lo predice.</blockquote>
          </div>

          <div className="model-flow">
            <div className="model-node model-input">
              <span>Entrada</span>
              <strong>SE&Ntilde;AL EN BRUTO</strong>
              <i />
              <i />
              <i />
            </div>

            <span className="model-arrow">&darr;</span>

            <button type="button" className="ai-model" onClick={() => setModelOpen((open) => !open)} aria-expanded={modelOpen}>
              <span className="model-corner model-corner-one">?</span>
              <span className="model-corner model-corner-two">?</span>
              <span className="ai-model-label">MODELO DE IA</span>
              <span className="ai-model-hint">{modelOpen ? 'Ocultar proceso' : 'Explorar proceso'}</span>
            </button>

            <span className="model-arrow">&darr;</span>

            <div className="model-node model-output">
              <span>Salida estimada</span>
              <strong>Puntuaci&oacute;n de sue&ntilde;o: <b>82</b></strong>
              <p>Sue&ntilde;o profundo: <b>1 h 23 min</b></p>
            </div>
          </div>
        </section>

        <section
          className={`approach-story${activeApproach ? ' is-expanded' : ''}`}
          style={{
            '--approach-reveal': sectionFiveReveal,
            '--approach-shift': `${(1 - sectionFiveReveal) * 3}rem`,
            '--approach-scale': 0.92 + sectionFiveReveal * 0.08,
            '--approach-blur': `${(1 - sectionFiveReveal) * 12}px`,
            pointerEvents: sectionFiveReveal > 0.85 ? 'auto' : 'none',
          }}
          aria-hidden={sectionFiveReveal < 0.1}
        >
          <div className="approach-copy">
            <p className="approach-eyebrow">Enfoque OpenWear</p>
            <h2>Del dato a la evidencia.</h2>
            <p>Una lectura responsable deja ver cada paso: desde la se&ntilde;al que entra hasta la evidencia que respalda el resultado.</p>
          </div>

          <div className="approach-map">
            {['Se\u00f1al', 'Filtrado', 'Caracter\u00edsticas', 'Algoritmo', 'Resultado', 'Evidencia'].map((step, index) => (
              <button
                key={step}
                type="button"
                className={`approach-step${activeApproach === step ? ' is-active' : ''}`}
                onClick={() => setActiveApproach(step)}
                aria-pressed={activeApproach === step}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>{step}
              </button>
            ))}
          </div>

          <aside className="approach-panel">
            {selectedApproach ? (
              <>
                <span className="approach-panel-label">{activeApproach}</span>
                <h3>{selectedApproach.title}</h3>
                <p>{selectedApproach.description}</p>
                <ol className={activeApproach === 'Caracter\u00edsticas' ? 'approach-process feature-list' : 'approach-process'}>
                  {selectedApproach.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </>
            ) : (
              <p className="approach-empty">Selecciona un paso para abrir su recorrido y ver qu&eacute; aporta al resultado.</p>
            )}
          </aside>
        </section>
      </div>
    </main>
  )
}
