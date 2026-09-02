import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Clone, ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import Logo from './assets/Logo.jpg.png'
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
  const heroOpacity = clamp(1 - progress * 4.8)
  const sensorReveal = clamp((progress - 0.11) / 0.14)
  const watchSettle = clamp(progress / 0.28)
  const sectionTwoFade = 1 - clamp((progress - 0.32) / 0.08)
  const sectionThreeReveal = clamp((progress - 0.36) / 0.07)
  const sectionThreeSignal = clamp((progress - 0.38) / 0.06)
  const sectionThreeTransform = clamp((progress - 0.41) / 0.06)
  const sectionThreeFeatures = clamp((progress - 0.44) / 0.05)
  const sectionThreeClose = 1 - clamp((progress - 0.55) / 0.04)
  const sectionFourReveal = clamp((progress - 0.57) / 0.04)
  const sectionFourModel = clamp((progress - 0.59) / 0.04)
  const sectionFourExit = 1 - clamp((progress - 0.65) / 0.03)
  const sectionFiveReveal = clamp((progress - 0.66) / 0.03)
  const sectionFiveExit = 1 - clamp((progress - 0.74) / 0.03)
  const sectionSixReveal = clamp((progress - 0.75) / 0.03)
  const sectionSixCompare = clamp((progress - 0.77) / 0.04)
  const sectionSixExit = 1 - clamp((progress - 0.85) / 0.03)
  const sectionSevenReveal = clamp((progress - 0.86) / 0.03)
  const sectionSevenHeart = clamp((progress - 0.88) / 0.03)
  const sectionSevenSteps = clamp((progress - 0.90) / 0.04)
  const sectionSevenExit = 1 - clamp((progress - 0.94) / 0.03)
  const sectionEightReveal = clamp((progress - 0.96) / 0.03)
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
            '--approach-opacity': sectionFiveReveal * sectionFiveExit,
            '--approach-shift': `${(1 - sectionFiveReveal) * 3 - (1 - sectionFiveExit) * 3}rem`,
            '--approach-scale': 0.92 + sectionFiveReveal * 0.08,
            '--approach-blur': `${(1 - sectionFiveReveal) * 12 + (1 - sectionFiveExit) * 12}px`,
            pointerEvents: sectionFiveReveal > 0.85 && sectionFiveExit > 0.15 ? 'auto' : 'none',
          }}
          aria-hidden={sectionFiveReveal < 0.1 || sectionFiveExit < 0.1}
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

        <section
          className="validation-story"
          style={{
            '--val-opacity': sectionSixReveal * sectionSixExit,
            '--val-shift': `${(1 - sectionSixReveal) * 3 - (1 - sectionSixExit) * 3}rem`,
            '--val-blur': `${(1 - sectionSixReveal) * 10 + (1 - sectionSixExit) * 10}px`,
            '--val-compare': sectionSixCompare,
            pointerEvents: sectionSixReveal > 0.85 && sectionSixExit > 0.15 ? 'auto' : 'none',
          }}
          aria-hidden={sectionSixReveal < 0.1 || sectionSixExit < 0.1}
        >
          <div className="val-copy">
            <p className="val-eyebrow">Validaci&oacute;n del sue&ntilde;o</p>
            <h2>Comparar contra una referencia.</h2>
            <p>Los relojes estiman el sue&ntilde;o, pero el m&eacute;todo considerado referencia es la <strong>Polisomnograf&iacute;a (PSG)</strong>, un estudio cl&iacute;nico con sensores especializados.</p>
          </div>
          
          <div className="val-comparison">
            <div className="val-track psg-track">
              <h3>PSG (Realidad)</h3>
              <ul>
                <li>Despierto</li>
                <li className="link-arrow">&darr;</li>
                <li>N2</li>
                <li className="link-arrow">&darr;</li>
                <li>N3</li>
                <li className="link-arrow">&darr;</li>
                <li>REM</li>
              </ul>
            </div>
            
            <div className="val-vs">
              <div className="val-agreement-circle">
                <svg viewBox="0 0 100 100" className="progress-ring">
                  <circle className="progress-ring-bg" cx="50" cy="50" r="45" />
                  <circle className="progress-ring-fill" cx="50" cy="50" r="45" />
                </svg>
                <div className="val-agreement-text">
                  <strong>82%</strong>
                  <small>Agreement</small>
                </div>
              </div>
            </div>

            <div className="val-track wearable-track">
              <h3>Wearable (Estimaci&oacute;n)</h3>
              <ul>
                <li>Despierto</li>
                <li className="link-arrow">&darr;</li>
                <li>Sue&ntilde;o ligero</li>
                <li className="link-arrow">&darr;</li>
                <li>Sue&ntilde;o profundo</li>
                <li className="link-arrow">&darr;</li>
                <li>REM</li>
              </ul>
            </div>
          </div>
          <p className="val-disclaimer">Este n&uacute;mero no se inventa. Sale del an&aacute;lisis real de datos.</p>
        </section>

        <section
          className="heart-story"
          style={{
            '--heart-opacity': sectionSevenReveal * sectionSevenExit,
            '--heart-shift': `${(1 - sectionSevenReveal) * 3 - (1 - sectionSevenExit) * 3}rem`,
            '--heart-steps': sectionSevenSteps,
            pointerEvents: sectionSevenReveal > 0.85 && sectionSevenExit > 0.15 ? 'auto' : 'none',
          }}
          aria-hidden={sectionSevenReveal < 0.1 || sectionSevenExit < 0.1}
        >
          <div className="heart-content">
            <div className="heart-visuals">
              <div className="heart-header">
                <p className="heart-eyebrow">Coraz&oacute;n</p>
                <h2>El pulso bajo la lupa.</h2>
              </div>
              
              <div className="heart-3d-wrapper">
                <div className="heart-3d">
                  <svg viewBox="0 0 32 29.6" className="heart-icon">
                    <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
                    c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
                  </svg>
                  <div className="heart-glow"></div>
                </div>
                <div className="heart-ecg-line">
                  <svg viewBox="0 0 340 100" preserveAspectRatio="none">
                    <polyline className="ecg-shadow continuous" points="0,50 30,50 40,20 50,80 60,50 150,50 160,20 170,80 180,50 270,50 280,20 290,80 300,50 340,50" />
                    <polyline className="ecg-path continuous" points="0,50 30,50 40,20 50,80 60,50 150,50 160,20 170,80 180,50 270,50 280,20 290,80 300,50 340,50" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="heart-copy">
              <div className="heart-pipeline">
                  <div className="pipeline-step step-1"><span>ECG</span> Detectar picos R</div>
                  <div className="pipeline-arrow arrow-1">&darr;</div>
                  <div className="pipeline-step step-2"><span>RR</span> Calcular intervalos RR</div>
                  <div className="pipeline-arrow arrow-2">&darr;</div>
                  <div className="pipeline-step step-3"><span>Ritmo</span> Analizar ritmo</div>
                  <div className="pipeline-arrow arrow-3">&darr;</div>
                  
                  <div className="rhythm-cards step-4">
                    <div className="rhythm-card regular">
                      <h3>Regular rhythm</h3>
                      <p>RR SD 24 ms</p>
                    </div>
                    <div className="rhythm-card irregular">
                      <h3>Irregular rhythm</h3>
                      <p>RR SD 121 ms</p>
                    </div>
                  </div>
              </div>
              
              <p className="medical-disclaimer">
              <span className="alert-icon">!</span>
              No diagnosticamos enfermedades. Analizamos patrones asociados con irregularidad.
            </p>
          </div>
          </div>
        </section>

        <section
          className="finale-story"
          style={{
            '--finale-opacity': sectionEightReveal,
            '--finale-shift': `${(1 - sectionEightReveal) * 3}rem`,
            pointerEvents: sectionEightReveal > 0.85 ? 'auto' : 'none',
          }}
          aria-hidden={sectionEightReveal < 0.1}
        >
          <div className="finale-logo">
             <img src={Logo} alt="OpenWear Logo" />
          </div>
          <div className="finale-stack">
            <div className="stack-item">WEARABLE</div>
            <div className="stack-line"></div>
            <div className="stack-item">SENSOR</div>
            <div className="stack-line"></div>
            <div className="stack-item">SIGNAL</div>
            <div className="stack-line"></div>
            <div className="stack-item">ALGORITHM</div>
            <div className="stack-line"></div>
            <div className="stack-item">RESULT</div>
            <div className="stack-line"></div>
            <div className="stack-item">EVIDENCE</div>
            <div className="stack-line"></div>
            <div className="stack-item highlight">HOW RELIABLE?</div>
          </div>
        </section>
      </div>
    </main>
  )
}
