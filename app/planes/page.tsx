'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, Shield, Headphones, CheckCircle, Phone, ArrowRight, 
  Clock, Sparkles, Building2, Home as HomeIcon, Zap, Tag, Calendar, 
  MapPin, Check, ExternalLink, HelpCircle
} from 'lucide-react'

const WHATSAPP_NUMBER = '5493855374835'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? ''} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

type Plan = {
  id: string
  name: string
  category: string
  speed?: string
  price: string
  currency?: string
  period?: string
  features: string[]
  isRecommended?: boolean
  popularTag?: string
  buttonText?: string
  theme?: 'light' | 'dark'
  active?: boolean
  order?: number
}

type Promotion = {
  id: string
  title: string
  badge: string
  subtitle?: string
  description?: string
  discount?: string
  planId?: string
  startDate: string
  endDate: string
  buttonText?: string
  whatsappMessage?: string
  active: boolean
}

export default function PlanesPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPlans, resPromos] = await Promise.all([
          fetch('/api/plans'),
          fetch('/api/promotions')
        ])
        if (resPlans.ok) {
          const dataPlans = await resPlans.json()
          setPlans(dataPlans)
        }
        if (resPromos.ok) {
          const dataPromos = await resPromos.json()
          setPromotions(dataPromos)
        }
      } catch (e) {
        console.error('Error fetching planes/promotions', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleWhatsApp = (text?: string) => {
    const msg = text 
      ? encodeURIComponent(text) 
      : encodeURIComponent('Hola, quiero consultar por los planes de internet de Inter Red.')
    window.open(`${WHATSAPP_LINK}?text=${msg}`, '_blank')
  }

  // Filter valid active promotions
  const activePromotions = promotions.filter(p => {
    if (!p.active) return false
    const start = p.startDate ? new Date(p.startDate).getTime() : 0
    const end = p.endDate ? new Date(p.endDate).getTime() : Infinity
    return now >= start && now <= end
  })

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-red-500 selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <a href="/" className="flex items-center gap-2 shrink-0 select-none">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center">
                <span className="text-gray-950">INTER</span>
                <span className="text-[#E30613] ml-1">Red</span>
              </div>
            </a>

            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="/#hero"
                className="hidden sm:inline-block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                Inicio
              </a>
              <a
                href="/#beneficios"
                className="hidden md:inline-block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                Beneficios
              </a>
              <a
                href="/#cobertura"
                className="hidden sm:inline-block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
              >
                Verificar Cobertura
              </a>
              <button
                onClick={() => handleWhatsApp()}
                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#E30613] text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-md flex items-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Contactar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="pt-28 sm:pt-36 pb-12 sm:pb-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100 text-[#E30613] rounded-full text-xs sm:text-sm font-bold mb-4">
              <Zap className="w-4 h-4" /> Planes de Internet en Choya
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight mb-4">
              Elegí la Conexión <span className="text-[#E30613]">Perfecta</span> para Vos
            </h1>
            <p className="text-gray-600 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Planes de alta velocidad, conexión estable y soporte técnico local sin intermediarios.
            </p>
          </motion.div>
        </div>
      </header>

      {/* ACTIVE LIMITED-TIME PROMOTIONS BANNER */}
      {activePromotions.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          {activePromotions.map((promo) => {
            const diff = new Date(promo.endDate).getTime() - now
            const isExpired = diff <= 0
            const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
            const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24))
            const minutes = Math.max(0, Math.floor((diff / 1000 / 60) % 60))
            const seconds = Math.max(0, Math.floor((diff / 1000) % 60))

            if (isExpired) return null

            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-gradient-to-r from-gray-950 via-red-950 to-gray-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-red-500/40 overflow-hidden"
              >
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#E30613] text-white text-xs font-black tracking-wider uppercase rounded-full shadow-lg animate-pulse">
                        <Zap className="w-3.5 h-3.5" />
                        {promo.badge || 'OFERTA POR TIEMPO LIMITADO'}
                      </span>
                      {promo.discount && (
                        <span className="px-3.5 py-1 bg-yellow-400 text-gray-950 text-xs font-extrabold rounded-full shadow-md">
                          {promo.discount}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                      {promo.title}
                    </h2>

                    {promo.subtitle && (
                      <p className="text-red-400 text-base sm:text-lg font-semibold mb-3">
                        {promo.subtitle}
                      </p>
                    )}

                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
                      {promo.description}
                    </p>

                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-400" />
                      <span>Oferta válida hasta el <strong>{new Date(promo.endDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} hs</strong></span>
                    </div>
                  </div>

                  {/* COUNTDOWN TIMER & CTA */}
                  <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 text-center flex flex-col justify-between shadow-xl">
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-red-300 font-bold mb-4">
                        <Clock className="w-4 h-4 animate-spin text-red-400" style={{ animationDuration: '6s' }} />
                        La Promoción Finaliza En:
                      </div>

                      {/* Countdown Boxes */}
                      <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        <div className="bg-gray-900/90 rounded-xl p-2.5 sm:p-3 border border-white/10">
                          <span className="block text-2xl sm:text-3xl font-black text-white font-mono">{days}</span>
                          <span className="text-[10px] sm:text-xs uppercase text-gray-400 font-semibold">Días</span>
                        </div>
                        <div className="bg-gray-900/90 rounded-xl p-2.5 sm:p-3 border border-white/10">
                          <span className="block text-2xl sm:text-3xl font-black text-white font-mono">{hours.toString().padStart(2, '0')}</span>
                          <span className="text-[10px] sm:text-xs uppercase text-gray-400 font-semibold">Horas</span>
                        </div>
                        <div className="bg-gray-900/90 rounded-xl p-2.5 sm:p-3 border border-white/10">
                          <span className="block text-2xl sm:text-3xl font-black text-white font-mono">{minutes.toString().padStart(2, '0')}</span>
                          <span className="text-[10px] sm:text-xs uppercase text-gray-400 font-semibold">Min</span>
                        </div>
                        <div className="bg-gray-900/90 rounded-xl p-2.5 sm:p-3 border border-white/10">
                          <span className="block text-2xl sm:text-3xl font-black text-red-400 font-mono animate-pulse">{seconds.toString().padStart(2, '0')}</span>
                          <span className="text-[10px] sm:text-xs uppercase text-gray-400 font-semibold">Seg</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleWhatsApp(promo.whatsappMessage || `Hola! Quiero aprovechar la promoción: ${promo.title}`)}
                      className="w-full py-4 bg-[#25D366] hover:bg-green-600 text-white rounded-xl font-extrabold text-base sm:text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02]"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      {promo.buttonText || 'Aprovechar Promo por WhatsApp'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </section>
      )}

      {/* PLANS GRID */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Cargando planes actualizados...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative rounded-3xl p-8 sm:p-10 transition-all duration-300 flex flex-col h-full ${
                  plan.theme === 'dark' || plan.isRecommended
                    ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-red-950 text-white shadow-2xl border-2 border-red-500/40 hover:-translate-y-1.5'
                    : 'bg-white text-gray-900 shadow-xl border-2 border-gray-200 hover:border-red-300 hover:-translate-y-1'
                }`}
              >
                {/* Popular Badge */}
                {plan.isRecommended && (
                  <div className="absolute -top-4 right-6">
                    <span className="px-4 py-1.5 bg-[#E30613] text-white text-xs sm:text-sm font-extrabold rounded-full shadow-lg">
                      {plan.popularTag || '⭐ Más Elegido'}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-center gap-3.5 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    plan.theme === 'dark' || plan.isRecommended ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                  }`}>
                    {plan.name.toLowerCase().includes('empresa') ? (
                      <Building2 className="w-6 h-6" />
                    ) : (
                      <HomeIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                    <p className={`text-xs sm:text-sm ${
                      plan.theme === 'dark' || plan.isRecommended ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {plan.category} {plan.speed ? `• ${plan.speed}` : ''}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8 pb-6 border-b border-gray-100/10">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-bold ${
                      plan.theme === 'dark' || plan.isRecommended ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {plan.currency || '$'}
                    </span>
                    <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                    <span className={`text-sm ml-1 ${
                      plan.theme === 'dark' || plan.isRecommended ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {plan.period || '/mes'}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features?.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                        plan.theme === 'dark' || plan.isRecommended ? 'text-red-400' : 'text-green-500'
                      }`} />
                      <span className={plan.theme === 'dark' || plan.isRecommended ? 'text-gray-200' : 'text-gray-600'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleWhatsApp(`Hola! Me interesa contratar el ${plan.name} ($${plan.price}) de Inter Red.`)}
                  className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all shadow-lg flex items-center justify-center gap-3 ${
                    plan.theme === 'dark' || plan.isRecommended
                      ? 'bg-[#E30613] hover:bg-red-700 text-white hover:shadow-red-500/20'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  {plan.buttonText || 'Contratar Plan'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* COBERTURA BANNER */}
        <section className="mt-16 bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3.5 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              ¿No sabés si llegamos a tu casa?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">
              Verificá tu Cobertura en Choya en Segundos
            </h3>
            <p className="text-white/80 text-sm sm:text-base max-w-xl">
              Completá tu dirección o envíanos tu ubicación por WhatsApp para confirmarte la instalación inmediatamente.
            </p>
          </div>
          <a
            href="/#cobertura"
            className="shrink-0 px-8 py-4 bg-white text-[#E30613] rounded-2xl font-extrabold text-base hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Consultar Cobertura
          </a>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-white py-12 border-t border-gray-900">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="text-xl font-black tracking-tight mb-1">
              <span>INTER</span>
              <span className="text-[#E30613] ml-1">Red</span>
            </div>
            <p className="text-gray-500 text-xs">Internet de Alta Velocidad • Dpto. Choya, Santiago del Estero</p>
          </div>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Inter Red. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
