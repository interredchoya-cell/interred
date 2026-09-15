'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Wifi, Shield, Headphones, Zap, MapPin, CheckCircle, Send, Phone, ArrowRight, Star, Users, Clock, ChevronDown, Building2, Home as HomeIcon, Monitor, Gamepad2, Instagram, Facebook } from 'lucide-react'

const WHATSAPP_NUMBER = '5493855374835'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? ''} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className ?? ''}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [coverageName, setCoverageName] = useState('')
  const [coveragePhone, setCoveragePhone] = useState('')
  const [coverageAddress, setCoverageAddress] = useState('')
  const [coverageLocation, setCoverageLocation] = useState<{lat: number, lng: number} | null>(null)
  const [coverageStatus, setCoverageStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [plans, setPlans] = useState<any[]>([
    {
      id: 'plan-basico',
      name: 'Plan Básico',
      category: 'Para hogares',
      price: '30.000',
      currency: '$',
      period: '/mes',
      features: [
        'Ideal para hogares',
        'Streaming en HD sin cortes',
        'Trabajo remoto fluido',
        'Videollamadas estables',
        'Navegación rápida',
        'Soporte técnico local'
      ],
      isRecommended: false,
      theme: 'light'
    },
    {
      id: 'plan-empresarial',
      name: 'Plan Empresarial',
      category: 'Uso intensivo',
      price: '50.000',
      currency: '$',
      period: '/mes',
      features: [
        'Para empresas y uso intensivo',
        'Streaming en 4K sin interrupciones',
        'Múltiples dispositivos simultáneos',
        'Ideal para comercios y oficinas',
        'Gaming online fluido',
        'Prioridad en soporte técnico',
        'Velocidad superior garantizada'
      ],
      isRecommended: true,
      popularTag: '⭐ Recomendado',
      theme: 'dark'
    }
  ])
  const [promotions, setPromotions] = useState<any[]>([])
  const [now, setNow] = useState<number>(Date.now())
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        const [resP, resPr] = await Promise.all([
          fetch('/api/plans'),
          fetch('/api/promotions')
        ])
        if (resP.ok) {
          const dataP = await resP.json()
          if (dataP && dataP.length > 0) setPlans(dataP)
        }
        if (resPr.ok) {
          const dataPr = await resPr.json()
          setPromotions(dataPr)
        }
      } catch (e) {
        // Fallback to initial state
      }
    }
    fetchDynamicData()
  }, [])

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoverageLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('No pudimos obtener tu ubicación. Por favor revisa los permisos de tu navegador o celular.')
        }
      )
    } else {
      alert('Tu navegador no soporta geolocalización.')
    }
  }

  const handleCoverageCheck = async () => {
    if (!coverageAddress?.trim() || !coverageName?.trim() || !coveragePhone?.trim()) return
    setCoverageStatus('loading')
    try {
      const res = await fetch('/api/feasibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: coverageName.trim(),
          phone: coveragePhone.trim(),
          address: coverageAddress.trim(),
          latitude: coverageLocation?.lat,
          longitude: coverageLocation?.lng
        })
      })
      if (!res.ok) throw new Error('Error guardando la solicitud')
      setCoverageStatus('success')
    } catch (err) {
      console.error(err)
      setCoverageStatus('error')
    }
  }

  const handleWhatsAppCoverage = () => {
    const locText = coverageLocation ? ` (GPS: ${coverageLocation.lat}, ${coverageLocation.lng})` : ''
    const msg = encodeURIComponent(`Hola, mi nombre es ${coverageName}. Quiero verificar cobertura en ${coverageAddress.trim()}${locText}.`)
    window.open(`${WHATSAPP_LINK}?text=${msg}`, '_blank')
  }

  const handleWhatsApp = (plan?: string) => {
    const msg = plan
      ? encodeURIComponent(`Hola, me interesa el ${plan} de Inter Red. Quisiera más información.`)
      : encodeURIComponent('Hola, quiero más información sobre los servicios de Inter Red.')
    window.open(`${WHATSAPP_LINK}?text=${msg}`, '_blank')
  }

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const navItems = [
    { label: 'Inicio', id: 'hero' },
    { label: 'Beneficios', id: 'beneficios' },
    { label: 'Cobertura', id: 'cobertura' },
    { label: 'Planes', id: 'planes' },
    { label: 'Contacto', id: 'contacto' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button onClick={() => scrollToSection('hero')} className="flex items-center gap-2 shrink-0 select-none">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center">
                <span className={`transition-colors duration-200 ${isScrolled ? 'text-gray-950' : 'text-white'}`}>INTER</span>
                <span className="text-[#E30613] ml-1">Red</span>
              </div>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems?.map((item: any) => (
                <button
                  key={item?.id}
                  onClick={() => scrollToSection(item?.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isScrolled ? 'text-gray-700 hover:text-red-600 hover:bg-red-50' : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item?.label}
                </button>
              ))}
              <button
                onClick={() => handleWhatsApp()}
                className="ml-3 px-5 py-2.5 bg-[#E30613] text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Contactanos
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
              aria-label="Menu"
            >
              <div className="space-y-1.5">
                <span className={`block w-6 h-0.5 transition-all duration-300 ${isScrolled ? 'bg-gray-800' : 'bg-white'} ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 transition-all duration-300 ${isScrolled ? 'bg-gray-800' : 'bg-white'} ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 transition-all duration-300 ${isScrolled ? 'bg-gray-800' : 'bg-white'} ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems?.map((item: any) => (
                <button
                  key={item?.id}
                  onClick={() => scrollToSection(item?.id)}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  {item?.label}
                </button>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); handleWhatsApp() }}
                className="w-full mt-2 px-4 py-3 bg-[#E30613] text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Contactanos por WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="hero" ref={heroRef} className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-gray-950 pt-20 pb-16 lg:py-28">
        {/* Background: cinematic dark with red glow orbs & subtle grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-gray-950" />
          {/* Subtle grid pattern for desktop texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
          {/* Glowing ambient lights */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] lg:w-[1100px] h-[400px] sm:h-[550px] bg-red-600/10 rounded-full blur-[140px] sm:blur-[180px]" />
          <div className="absolute -bottom-20 left-10 w-[350px] lg:w-[500px] h-[350px] bg-red-950/20 rounded-full blur-[120px]" />
          <div className="absolute top-10 right-10 w-[300px] lg:w-[450px] h-[300px] bg-red-700/10 rounded-full blur-[120px]" />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-md mb-6 sm:mb-8 shadow-lg shadow-red-950/30">
              <MapPin className="w-4 h-4 text-[#E30613] shrink-0" />
              <span className="text-white/95 text-xs sm:text-sm font-medium tracking-wide">Departamento Choya, Santiago del Estero</span>
            </div>
          </motion.div>

          {/* Heading with responsive line balancing */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-black text-white tracking-tight leading-[1.12] sm:leading-[1.1] mb-6 max-w-4xl lg:max-w-5xl"
          >
            Internet de{' '}
            <span className="text-[#E30613] inline-block drop-shadow-[0_0_35px_rgba(227,6,19,0.35)]">
              Alta Velocidad
            </span>{' '}
            <span className="inline sm:block md:inline">para tu Zona</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-gray-300/90 mb-8 sm:mb-10 max-w-2xl lg:max-w-3xl leading-relaxed font-normal"
          >
            Conectate al mundo digital con fibra óptica, ultra baja latencia y la mayor estabilidad garantizada para tu hogar y negocio.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none"
          >
            <button
              onClick={() => handleWhatsApp()}
              className="w-full sm:w-auto group px-8 sm:px-10 py-4 bg-[#E30613] text-white rounded-xl text-base sm:text-lg font-bold hover:bg-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-red-500/30 flex items-center justify-center gap-3 hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Quiero Conectarme</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('planes')}
              className="w-full sm:w-auto px-8 sm:px-10 py-4 border border-white/20 hover:border-white/40 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <span>Ver Planes</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Stats bar - expansive & clean for PC / mobile */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 sm:mt-16 w-full max-w-xl lg:max-w-3xl"
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-6 bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl">
              {[
                { value: '24/7', label: 'SOPORTE', sub: 'Dedicado' },
                { value: '99.5%', label: 'UPTIME', sub: 'Garantizado' },
                { value: 'Local', label: 'COBERTURA', sub: 'Todo Choya' },
              ]?.map((stat: any, i: number) => (
                <div key={i} className={`text-center px-1 sm:px-4 ${i !== 0 ? 'border-l border-white/10' : ''}`}>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">{stat?.value}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400 uppercase font-medium tracking-wider mt-1">{stat?.label}</div>
                  <div className="text-[10px] sm:text-xs text-[#E30613] font-bold mt-0.5">{stat?.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:block pointer-events-none"
        >
          <ChevronDown className="w-7 h-7 text-white/40" />
        </motion.div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-red-100 text-[#E30613] rounded-full text-sm font-semibold mb-4">¿Por qué Inter Red?</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Tu Conexión, Nuestra <span className="text-[#E30613]">Prioridad</span></h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Tecnología de punta con el respaldo de un equipo local que conoce tu zona</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Wifi, title: 'Última Tecnología', desc: 'Equipos de última generación que garantizan una conexión estable y potente, sin importar la distancia.', color: 'bg-red-500' },
              { icon: Shield, title: 'Conexión Estable', desc: 'Red diseñada para mantener tu conexión activa y estable las 24 horas, los 7 días de la semana.', color: 'bg-blue-500' },
              { icon: Headphones, title: 'Soporte Local', desc: 'Somos tus vecinos. Atención personalizada y respuesta rápida porque estamos en tu zona.', color: 'bg-green-500' },
              { icon: MapPin, title: 'Cobertura', desc: 'Red optimizada específicamente para el Departamento Choya. Conocemos cada rincón de la zona.', color: 'bg-purple-500' },
              { icon: Clock, title: 'Instalación Rápida', desc: 'En pocos días estás conectado. Sin obras, sin cables enterrados, sin complicaciones.', color: 'bg-cyan-500' },
            ]?.map((item: any, i: number) => {
              const Icon = item?.icon ?? Wifi
              return (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className="group relative bg-white rounded-2xl p-6 sm:p-10 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-red-200 h-full">
                    <div className={`w-14 h-14 ${item?.color ?? 'bg-red-500'} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item?.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{item?.desc}</p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* VERIFICADOR DE COBERTURA */}
      <section id="cobertura" className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-red-950" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <span className="inline-block px-4 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold mb-4">Verificá tu Cobertura</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">¿Llegamos a <span className="text-[#E30613]">tu zona</span>?</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Ingresá tu dirección y verificamos si tenemos cobertura en tu ubicación. Te respondemos al instante por WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                {[
                  { icon: MapPin, text: 'Cobertura en expansión' },
                  { icon: Clock, text: 'Respuesta en minutos' },
                  { icon: CheckCircle, text: 'Sin compromiso' },
                ]?.map((item: any, i: number) => {
                  const Icon = item?.icon ?? CheckCircle
                  return (
                    <div key={i} className="flex items-center gap-2 text-gray-300">
                      <Icon className="w-5 h-5 text-red-400 shrink-0" />
                      <span className="text-sm">{item?.text}</span>
                    </div>
                  )
                })}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="glass-dark rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#E30613] rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Consulta de Cobertura</h3>
                    <p className="text-gray-400 text-sm">Departamento Choya, Sgo. del Estero</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {coverageStatus === 'success' ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h4 className="text-white font-bold text-lg mb-2">¡Solicitud Enviada!</h4>
                      <p className="text-gray-300 text-sm mb-6">Hemos registrado tu consulta. Nuestro equipo analizará la cobertura y te confirmaremos a la brevedad.</p>
                      <button
                        onClick={handleWhatsAppCoverage}
                        className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <WhatsAppIcon className="w-5 h-5" />
                        Hablar ahora por WhatsApp
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-1.5">Tu Nombre</label>
                          <input
                            type="text"
                            value={coverageName}
                            onChange={(e) => setCoverageName(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-1.5">Teléfono</label>
                          <input
                            type="text"
                            value={coveragePhone}
                            onChange={(e) => setCoveragePhone(e.target.value)}
                            placeholder="Ej: 3854123456"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1.5">Tu Dirección</label>
                        <input
                          type="text"
                          value={coverageAddress}
                          onChange={(e) => setCoverageAddress(e.target.value)}
                          placeholder="Ej: Calle San Martín 123, Choya"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                        />
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={getLocation}
                          type="button"
                          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all border ${
                            coverageLocation 
                              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                              : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {coverageLocation ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Ubicación GPS Guardada
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              Obtener mi ubicación actual (Preciso)
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={handleCoverageCheck}
                        disabled={!coverageAddress?.trim() || !coverageName?.trim() || !coveragePhone?.trim() || coverageStatus === 'loading'}
                        className="w-full py-4 mt-2 bg-[#E30613] text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {coverageStatus === 'loading' ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Verificar Cobertura
                          </>
                        )}
                      </button>
                      {coverageStatus === 'error' && (
                        <p className="text-red-400 text-xs text-center">Hubo un error al guardar. Por favor intenta de nuevo.</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="py-20 sm:py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-red-100 text-[#E30613] rounded-full text-sm font-semibold mb-4">Nuestros Planes</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Elegí el Plan <span className="text-[#E30613]">Ideal</span> para Vos</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Planes pensados para cada necesidad, con la mejor relación precio-calidad de la zona</p>
          </AnimatedSection>

          {/* ACTIVE PROMOTIONS WITH LIVE COUNTDOWN */}
          {promotions
            .filter((p: any) => {
              if (!p.active) return false
              const start = p.startDate ? new Date(p.startDate).getTime() : 0
              const end = p.endDate ? new Date(p.endDate).getTime() : Infinity
              return now >= start && now <= end
            })
            .map((promo: any) => {
              const diff = new Date(promo.endDate).getTime() - now
              const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
              const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24))
              const minutes = Math.max(0, Math.floor((diff / 1000 / 60) % 60))
              const seconds = Math.max(0, Math.floor((diff / 1000) % 60))

              return (
                <AnimatedSection key={promo.id} className="mb-12">
                  <div className="relative bg-gradient-to-r from-gray-950 via-red-950 to-gray-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-red-500/40 overflow-hidden">
                    <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-7">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#E30613] text-white text-xs font-black uppercase rounded-full shadow-lg animate-pulse">
                            <Zap className="w-3.5 h-3.5" />
                            {promo.badge || 'OFERTA LIMITADA'}
                          </span>
                          {promo.discount && (
                            <span className="px-3.5 py-1 bg-yellow-400 text-gray-950 text-xs font-extrabold rounded-full">
                              {promo.discount}
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                          {promo.title}
                        </h3>
                        {promo.subtitle && (
                          <p className="text-red-400 text-sm sm:text-base font-semibold mb-2">{promo.subtitle}</p>
                        )}
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">{promo.description}</p>
                      </div>

                      <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-red-300 font-bold mb-3">
                          <Clock className="w-4 h-4 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
                          Finaliza en:
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className="bg-gray-900/90 rounded-xl p-2 border border-white/10">
                            <span className="block text-xl sm:text-2xl font-black text-white font-mono">{days}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Días</span>
                          </div>
                          <div className="bg-gray-900/90 rounded-xl p-2 border border-white/10">
                            <span className="block text-xl sm:text-2xl font-black text-white font-mono">{hours.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Horas</span>
                          </div>
                          <div className="bg-gray-900/90 rounded-xl p-2 border border-white/10">
                            <span className="block text-xl sm:text-2xl font-black text-white font-mono">{minutes.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Min</span>
                          </div>
                          <div className="bg-gray-900/90 rounded-xl p-2 border border-white/10">
                            <span className="block text-xl sm:text-2xl font-black text-red-400 font-mono animate-pulse">{seconds.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Seg</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleWhatsApp(promo.whatsappMessage || `Hola! Quiero aprovechar la promoción: ${promo.title}`)}
                          className="w-full py-3 bg-[#25D366] hover:bg-green-600 text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          {promo.buttonText || 'Aprovechar Promo'}
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}

          {/* DYNAMIC PLANS GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan: any, i: number) => {
              const isDark = plan.theme === 'dark' || plan.isRecommended
              return (
                <AnimatedSection key={plan.id || i} delay={i * 0.1}>
                  <div className={`relative rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border-2 ${
                    isDark 
                      ? 'bg-gradient-to-br from-gray-900 to-red-950 border-red-500/30 text-white' 
                      : 'bg-white border-gray-200 hover:border-red-300 text-gray-900'
                  }`}>
                    {plan.isRecommended && (
                      <div className="absolute -top-4 right-6">
                        <span className="px-4 py-1.5 bg-[#E30613] text-white text-sm font-bold rounded-full shadow-lg">
                          {plan.popularTag || '⭐ Recomendado'}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isDark ? 'bg-red-500/20 text-red-400' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {plan.name?.toLowerCase().includes('empresa') ? (
                          <Building2 className="w-6 h-6" />
                        ) : (
                          <HomeIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {plan.category} {plan.speed ? `• ${plan.speed}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{plan.currency || '$'}</span>
                        <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{plan.period || '/mes'}</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features?.map((feat: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-red-400' : 'text-green-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleWhatsApp(`Hola, me interesa el ${plan.name} ($${plan.price}) de Inter Red.`)}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                        isDark 
                          ? 'bg-[#E30613] text-white hover:bg-red-700 shadow-lg hover:shadow-xl animate-pulse-glow' 
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      {plan.buttonText || 'Contratar Plan'}
                    </button>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#E30613]" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-[#E30613] to-red-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">¿Listo para conectarte?</h2>
            <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              Unite a la comunidad de Inter Red y disfrutá de internet de alta velocidad con el mejor servicio local.
            </p>
            <button
              onClick={() => handleWhatsApp()}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white text-[#E30613] rounded-xl text-lg font-bold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <WhatsAppIcon className="w-6 h-6" />
              Escribinos por WhatsApp
              <ArrowRight className="w-5 h-5" />
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-gray-950 text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="text-3xl font-black tracking-tight flex items-center mb-6 select-none">
                <span className="text-white">INTER</span>
                <span className="text-[#E30613] ml-1">Red</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Internet por antenas de alta velocidad en el Departamento Choya, Santiago del Estero. Tu conexión, nuestra prioridad.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/interred.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/interred.ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Enlaces</h4>
              <ul className="space-y-3">
                {navItems?.map((item: any) => (
                  <li key={item?.id}>
                    <button
                      onClick={() => scrollToSection(item?.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item?.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Contacto</h4>
              <div className="space-y-4">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors"
                >
                  <WhatsAppIcon className="w-5 h-5 shrink-0" />
                  <span>385 5374835</span>
                </a>
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Departamento Choya,<br />Santiago del Estero, Argentina</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 Inter Red. Todos los derechos reservados.</p>
            <p className="text-gray-600 text-xs">Internet por antenas • Choya, Santiago del Estero</p>
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOATING BUTTON */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 animate-pulse-glow"
        aria-label="Contactar por WhatsApp"
        style={{ animationDuration: '3s' }}
      >
        <WhatsAppIcon className="w-8 h-8 text-white" />
      </a>
    </div>
  )
}
