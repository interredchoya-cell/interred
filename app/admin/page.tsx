'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Search, Phone, Trash2, Clock, ShieldCheck, 
  LogOut, ExternalLink, Plus, Edit2, Zap, Calendar, 
  Layers, Check, ArrowUpRight
} from 'lucide-react'

type FeasibilityRequest = {
  id: string
  name: string
  phone: string
  address: string
  latitude: number | null
  longitude: number | null
  status: string
  createdAt: string
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
  createdAt?: string
}

export default function AdminPage() {
  const [pin, setPin] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'requests' | 'plans' | 'promotions'>('requests')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Requests state
  const [requests, setRequests] = useState<FeasibilityRequest[]>([])
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'HAS_COVERAGE' | 'NO_COVERAGE' | 'CONTACTED'>('ALL')
  const [requestSearch, setRequestSearch] = useState('')

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([])
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [planSaving, setPlanSaving] = useState(false)

  // Promotions state
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false)
  const [promoSaving, setPromoSaving] = useState(false)
  const [now, setNow] = useState<number>(Date.now())

  // Keep now updated for live countdowns in admin
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchAllData = async (currentPin: string) => {
    setLoading(true)
    setError('')
    try {
      // 1. Fetch Requests
      const resReq = await fetch('/api/feasibility', {
        headers: { 'x-admin-pin': currentPin }
      })
      if (!resReq.ok) {
        if (resReq.status === 401) throw new Error('PIN incorrecto')
        throw new Error('Error al cargar solicitudes')
      }
      const dataReq = await resReq.json()
      setRequests(dataReq)

      // 2. Fetch Plans
      const resPlans = await fetch('/api/plans?all=true', {
        headers: { 'x-admin-pin': currentPin }
      })
      if (resPlans.ok) {
        const dataPlans = await resPlans.json()
        setPlans(dataPlans)
      }

      // 3. Fetch Promotions
      const resPromos = await fetch('/api/promotions?all=true', {
        headers: { 'x-admin-pin': currentPin }
      })
      if (resPromos.ok) {
        const dataPromos = await resPromos.json()
        setPromotions(dataPromos)
      }

      setIsAuthenticated(true)
      localStorage.setItem('admin_pin', currentPin)
    } catch (err: any) {
      setError(err.message)
      setIsAuthenticated(false)
      localStorage.removeItem('admin_pin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedPin = localStorage.getItem('admin_pin')
    if (savedPin) {
      setPin(savedPin)
      fetchAllData(savedPin)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAllData(pin)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPin('')
    setRequests([])
    setPlans([])
    setPromotions([])
    localStorage.removeItem('admin_pin')
  }

  // Requests functions
  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/feasibility', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        setRequests(requests.map(r => r.id === id ? { ...r, status } : r))
      }
    } catch (err) {
      alert('Error al actualizar estado')
    }
  }

  const deleteRequest = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta solicitud?')) return
    try {
      const res = await fetch(`/api/feasibility?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin }
      })
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== id))
      }
    } catch (err) {
      alert('Error al eliminar')
    }
  }

  // Plan functions
  const openNewPlanModal = () => {
    setEditingPlan({
      id: '',
      name: '',
      category: 'Para hogares',
      speed: '50 Megas',
      price: '35.000',
      currency: '$',
      period: '/mes',
      features: ['Streaming en HD', 'Conexión 24/7', 'Soporte local'],
      isRecommended: false,
      popularTag: '',
      buttonText: 'Contratar Plan',
      theme: 'light',
      active: true,
      order: plans.length + 1
    })
    setIsPlanModalOpen(true)
  }

  const openEditPlanModal = (plan: Plan) => {
    setEditingPlan({ ...plan, features: [...plan.features] })
    setIsPlanModalOpen(true)
  }

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlan) return
    setPlanSaving(true)
    try {
      const isNew = !editingPlan.id
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch('/api/plans', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify(editingPlan)
      })

      if (!res.ok) throw new Error('Error al guardar el plan')
      const saved = await res.json()

      if (isNew) {
        setPlans([...plans, saved])
      } else {
        setPlans(plans.map(p => p.id === saved.id ? saved : p))
      }
      setIsPlanModalOpen(false)
      setEditingPlan(null)
    } catch (err: any) {
      alert(err.message || 'Error al guardar')
    } finally {
      setPlanSaving(false)
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este plan?')) return
    try {
      const res = await fetch(`/api/plans?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin }
      })
      if (res.ok) {
        setPlans(plans.filter(p => p.id !== id))
      }
    } catch (err) {
      alert('Error al eliminar plan')
    }
  }

  const togglePlanActive = async (plan: Plan) => {
    const updated = { ...plan, active: !plan.active }
    try {
      const res = await fetch('/api/plans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify(updated)
      })
      if (res.ok) {
        setPlans(plans.map(p => p.id === plan.id ? updated : p))
      }
    } catch (err) {
      alert('Error al actualizar estado')
    }
  }

  // Promotion functions
  const openNewPromoModal = () => {
    const defaultStart = new Date().toISOString().slice(0, 16)
    const defaultEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    setEditingPromo({
      id: '',
      title: '¡Promo Especial por Tiempo Limitado!',
      badge: '⚡ OFERTA LIMITADA',
      subtitle: 'Instalación bonificada + Descuento exclusivo',
      description: 'Contratá tu plan ahora y obtené la instalación 100% bonificada + beneficio en tu primer abono.',
      discount: '25% OFF + Instalación Bonificada',
      planId: plans[0]?.id || '',
      startDate: defaultStart,
      endDate: defaultEnd,
      buttonText: 'Aprovechar Promo por WhatsApp',
      whatsappMessage: 'Hola! Quiero aprovechar la promoción por tiempo limitado de Inter Red.',
      active: true
    })
    setIsPromoModalOpen(true)
  }

  const openEditPromoModal = (promo: Promotion) => {
    setEditingPromo({ ...promo })
    setIsPromoModalOpen(true)
  }

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPromo) return
    setPromoSaving(true)
    try {
      const isNew = !editingPromo.id
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch('/api/promotions', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify(editingPromo)
      })

      if (!res.ok) throw new Error('Error al guardar la promoción')
      const saved = await res.json()

      if (isNew) {
        setPromotions([saved, ...promotions])
      } else {
        setPromotions(promotions.map(p => p.id === saved.id ? saved : p))
      }
      setIsPromoModalOpen(false)
      setEditingPromo(null)
    } catch (err: any) {
      alert(err.message || 'Error al guardar')
    } finally {
      setPromoSaving(false)
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta promoción?')) return
    try {
      const res = await fetch(`/api/promotions?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': pin }
      })
      if (res.ok) {
        setPromotions(promotions.filter(p => p.id !== id))
      }
    } catch (err) {
      alert('Error al eliminar promoción')
    }
  }

  const togglePromoActive = async (promo: Promotion) => {
    const updated = { ...promo, active: !promo.active }
    try {
      const res = await fetch('/api/promotions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin
        },
        body: JSON.stringify(updated)
      })
      if (res.ok) {
        setPromotions(promotions.map(p => p.id === promo.id ? updated : p))
      }
    } catch (err) {
      alert('Error al actualizar estado')
    }
  }

  // Time calculations
  const getPromoStatus = (promo: Promotion) => {
    if (!promo.active) return { label: 'Pausada', color: 'bg-gray-100 text-gray-700 border-gray-300' }
    const start = promo.startDate ? new Date(promo.startDate).getTime() : 0
    const end = promo.endDate ? new Date(promo.endDate).getTime() : Infinity
    if (now < start) return { label: 'Programada', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
    if (now > end) return { label: 'Finalizada / Expirada', color: 'bg-red-100 text-red-800 border-red-300' }
    return { label: '🟢 Activa en Vivo', color: 'bg-green-100 text-green-800 border-green-300 animate-pulse' }
  }

  const formatCountdown = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - now
    if (diff <= 0) return '00d 00h 00m 00s'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    const seconds = Math.floor((diff / 1000) % 60)
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
  }

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesStatus = requestFilter === 'ALL' || req.status === requestFilter
    const matchesSearch = requestSearch === '' || 
      req.name.toLowerCase().includes(requestSearch.toLowerCase()) ||
      req.phone.includes(requestSearch) ||
      req.address.toLowerCase().includes(requestSearch.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-[#E30613]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-500 mt-2">Ingresa tu PIN para acceder al sistema</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                className="w-full text-center text-3xl tracking-[1em] font-mono px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading || !pin}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Acceder al Panel'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/80 pb-24">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#E30613]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  INTER <span className="text-[#E30613]">Red</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-900 text-white rounded-md font-medium">ADMIN</span>
                </h1>
                <p className="text-xs text-gray-500">Panel de Control General</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/planes"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Ver /planes <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Ver Web <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 sm:space-x-4 border-t border-gray-100 pt-1 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Solicitudes de Cobertura
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {requests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'plans'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Gestión de Planes
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'plans' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {plans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'promotions'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              Promociones Limitadas
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'promotions' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {promotions.filter(p => p.active).length}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: SOLICITUDES DE COBERTURA */}
        {activeTab === 'requests' && (
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Cobertura</h2>
                <p className="text-sm text-gray-500">Consultas recibidas desde el formulario web</p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    placeholder="Buscar por nombre, tel, calle..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                  />
                </div>

                <select
                  value={requestFilter}
                  onChange={(e: any) => setRequestFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
                >
                  <option value="ALL">Todos los estados ({requests.length})</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="HAS_COVERAGE">Con Cobertura</option>
                  <option value="NO_COVERAGE">Sin Cobertura</option>
                  <option value="CONTACTED">Contactados</option>
                </select>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No hay solicitudes que coincidan</h3>
                <p className="text-gray-500 text-sm">Prueba ajustando los filtros o espera nuevas consultas.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {new Date(req.createdAt).toLocaleDateString('es-AR', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{req.name}</div>
                            <a 
                              href={`https://wa.me/549${req.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(req.name)},%20nos%20comunicamos%20de%20Inter%20Red%20por%20tu%20consulta%20de%20cobertura.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 mt-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {req.phone}
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-[260px] truncate">{req.address}</div>
                            {req.latitude && req.longitude ? (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${req.latitude},${req.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 mt-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                              >
                                <MapPin className="w-3 h-3" />
                                Ver GPS en Mapa <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 mt-1 block">Sin coordenadas</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={req.status}
                              onChange={(e) => updateStatus(req.id, e.target.value)}
                              className={`text-xs font-bold rounded-full px-3 py-1.5 border-0 focus:ring-2 focus:ring-offset-1 transition-colors cursor-pointer outline-none shadow-sm
                                ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500' : ''}
                                ${req.status === 'HAS_COVERAGE' ? 'bg-green-100 text-green-800 focus:ring-green-500' : ''}
                                ${req.status === 'NO_COVERAGE' ? 'bg-red-100 text-red-800 focus:ring-red-500' : ''}
                                ${req.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800 focus:ring-blue-500' : ''}
                              `}
                            >
                              <option value="PENDING">⏳ Pendiente</option>
                              <option value="HAS_COVERAGE">✅ Con Cobertura</option>
                              <option value="NO_COVERAGE">❌ Sin Cobertura</option>
                              <option value="CONTACTED">📞 Contactado</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => deleteRequest(req.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar solicitud"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: GESTIÓN DE PLANES */}
        {activeTab === 'plans' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Planes</h2>
                <p className="text-sm text-gray-500">Edita precios, velocidades, características y visibilidad de los planes</p>
              </div>

              <button
                onClick={openNewPlanModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E30613] text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-md transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Agregar Nuevo Plan
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`rounded-2xl border transition-all duration-200 relative flex flex-col p-6 shadow-sm hover:shadow-md ${
                    plan.theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-900 to-red-950 text-white border-red-500/30'
                      : 'bg-white text-gray-900 border-gray-200'
                  } ${!plan.active ? 'opacity-60 grayscale-[40%]' : ''}`}
                >
                  {/* Status & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        plan.active 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-200 text-gray-700 border-gray-300'
                      }`}>
                        {plan.active ? 'Activo' : 'Pausado'}
                      </span>
                      {plan.isRecommended && (
                        <span className="text-xs px-2.5 py-1 bg-[#E30613] text-white rounded-full font-bold shadow-sm">
                          {plan.popularTag || '⭐ Recomendado'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-mono">Orden #{plan.order || 1}</span>
                  </div>

                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className={`text-xs ${plan.theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.category} {plan.speed ? `• ${plan.speed}` : ''}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg opacity-70">{plan.currency || '$'}</span>
                      <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                      <span className="text-xs opacity-70 ml-1">{plan.period || '/mes'}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${plan.theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                      Características ({plan.features?.length || 0}):
                    </p>
                    <ul className="space-y-2">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.theme === 'dark' ? 'text-red-400' : 'text-green-600'}`} />
                          <span className={plan.theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-100/20 flex items-center justify-between gap-2">
                    <button
                      onClick={() => togglePlanActive(plan)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        plan.active
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300'
                      }`}
                    >
                      {plan.active ? 'Pausar' : 'Activar'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditPlanModal(plan)}
                        className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar plan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: PROMOCIONES POR TIEMPO LIMITADO */}
        {activeTab === 'promotions' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Promociones por Tiempo Limitado</h2>
                <p className="text-sm text-gray-500">Crea ofertas con fecha y hora de inicio/fin, temporizador y descuentos especiales</p>
              </div>

              <button
                onClick={openNewPromoModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E30613] text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-md transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Crear Promoción con Fecha/Hora
              </button>
            </div>

            {promotions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No hay promociones creadas</h3>
                <p className="text-gray-500 text-sm mb-6">Crea una promoción con fecha y hora para incentivar nuevas contrataciones.</p>
                <button
                  onClick={openNewPromoModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#E30613] text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Crear Primera Promoción
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {promotions.map((promo) => {
                  const status = getPromoStatus(promo)
                  const isFinished = new Date(promo.endDate).getTime() < now
                  const countdown = formatCountdown(promo.endDate)

                  return (
                    <div 
                      key={promo.id}
                      className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      {/* Top banner styling */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`text-xs px-3 py-1 rounded-full font-bold border ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-xs px-3 py-1 bg-red-100 text-[#E30613] rounded-full font-bold">
                            {promo.badge}
                          </span>
                          {promo.discount && (
                            <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-900 rounded-full font-bold">
                              🏷️ {promo.discount}
                            </span>
                          )}
                        </div>

                        {/* Live Countdown in Admin */}
                        {!isFinished && promo.active && (
                          <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold self-start lg:self-auto">
                            <Clock className="w-4 h-4 text-red-400 animate-pulse" />
                            <span>Expira en: {countdown}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="py-6 grid lg:grid-cols-3 gap-6 items-center">
                        <div className="lg:col-span-2">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{promo.title}</h3>
                          {promo.subtitle && (
                            <p className="text-sm font-medium text-red-600 mb-2">{promo.subtitle}</p>
                          )}
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">{promo.description}</p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>Inicio: <strong>{new Date(promo.startDate).toLocaleString('es-AR')}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-red-500" />
                              <span>Fin: <strong>{new Date(promo.endDate).toLocaleString('es-AR')}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Preview / WhatsApp */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Mensaje WhatsApp Preconfigurado:</span>
                          <p className="text-xs text-gray-700 italic bg-white p-3 rounded-lg border border-gray-200 mb-4">
                            "{promo.whatsappMessage || 'Hola! Quiero aprovechar la promoción de Inter Red.'}"
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Botón: <strong>{promo.buttonText}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                        <button
                          onClick={() => togglePromoActive(promo)}
                          className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-colors ${
                            promo.active
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                              : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300'
                          }`}
                        >
                          {promo.active ? 'Pausar Promoción' : 'Activar Promoción'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditPromoModal(promo)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Editar
                          </button>
                          <button
                            onClick={() => handleDeletePromo(promo.id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar promoción"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* MODAL: EDITAR / CREAR PLAN */}
      <AnimatePresence>
        {isPlanModalOpen && editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingPlan.id ? 'Editar Plan' : 'Crear Nuevo Plan'}
                  </h3>
                  <p className="text-xs text-gray-500">Configura precios, velocidades y beneficios visibles en la web</p>
                </div>
                <button 
                  onClick={() => setIsPlanModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre del Plan</label>
                    <input
                      type="text"
                      required
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      placeholder="Ej: Plan Básico, Plan Ultra"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Categoría / Subtítulo</label>
                    <input
                      type="text"
                      value={editingPlan.category}
                      onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value })}
                      placeholder="Ej: Para hogares, Uso intensivo"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Precio Mensual ($)</label>
                    <input
                      type="text"
                      required
                      value={editingPlan.price}
                      onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                      placeholder="Ej: 30.000"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Velocidad / Megas</label>
                    <input
                      type="text"
                      value={editingPlan.speed || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, speed: e.target.value })}
                      placeholder="Ej: 50 Megas"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Orden de Posición</label>
                    <input
                      type="number"
                      value={editingPlan.order || 1}
                      onChange={(e) => setEditingPlan({ ...editingPlan, order: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Diseño Visual / Tema</label>
                    <select
                      value={editingPlan.theme || 'light'}
                      onChange={(e: any) => setEditingPlan({ ...editingPlan, theme: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    >
                      <option value="light">Claro (Estándar)</option>
                      <option value="dark">Oscuro Premium (Destacado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Texto del Botón</label>
                    <input
                      type="text"
                      value={editingPlan.buttonText || 'Contratar Plan'}
                      onChange={(e) => setEditingPlan({ ...editingPlan, buttonText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Recommended toggle */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingPlan.isRecommended)}
                      onChange={(e) => setEditingPlan({ ...editingPlan, isRecommended: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-bold text-gray-900">Destacar como Plan Recomendado</span>
                  </label>

                  {editingPlan.isRecommended && (
                    <input
                      type="text"
                      value={editingPlan.popularTag || ''}
                      onChange={(e) => setEditingPlan({ ...editingPlan, popularTag: e.target.value })}
                      placeholder="Texto del badge (Ej: ⭐ Recomendado / Más Elegido)"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  )}
                </div>

                {/* Features editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Lista de Características y Beneficios
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingPlan({
                        ...editingPlan,
                        features: [...editingPlan.features, '']
                      })}
                      className="text-xs font-bold text-[#E30613] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Beneficio
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editingPlan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const newFeats = [...editingPlan.features]
                            newFeats[idx] = e.target.value
                            setEditingPlan({ ...editingPlan, features: newFeats })
                          }}
                          placeholder={`Beneficio ${idx + 1}`}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFeats = editingPlan.features.filter((_, i) => i !== idx)
                            setEditingPlan({ ...editingPlan, features: newFeats })
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsPlanModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={planSaving}
                    className="px-6 py-2.5 bg-[#E30613] text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {planSaving ? 'Guardando...' : 'Guardar Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDITAR / CREAR PROMOCIÓN CON FECHA Y HORA */}
      <AnimatePresence>
        {isPromoModalOpen && editingPromo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#E30613]" />
                    {editingPromo.id ? 'Editar Promoción' : 'Crear Promoción con Fecha y Hora'}
                  </h3>
                  <p className="text-xs text-gray-500">Define el tiempo exacto de vigencia con fecha y hora</p>
                </div>
                <button 
                  onClick={() => setIsPromoModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePromo} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Título de la Promoción</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.title}
                    onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                    placeholder="Ej: ¡Promo de Primavera 2026!"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Etiqueta / Badge Superior</label>
                    <input
                      type="text"
                      required
                      value={editingPromo.badge}
                      onChange={(e) => setEditingPromo({ ...editingPromo, badge: e.target.value })}
                      placeholder="Ej: ⚡ OFERTA LIMITADA"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Descuento / Beneficio</label>
                    <input
                      type="text"
                      value={editingPromo.discount || ''}
                      onChange={(e) => setEditingPromo({ ...editingPromo, discount: e.target.value })}
                      placeholder="Ej: 30% OFF + Instalación Bonificada"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold text-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Subtítulo / Bajada</label>
                  <input
                    type="text"
                    value={editingPromo.subtitle || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, subtitle: e.target.value })}
                    placeholder="Ej: Válido para nuevas contrataciones en Choya"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Descripción Detallada</label>
                  <textarea
                    rows={2}
                    value={editingPromo.description || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                    placeholder="Describe los términos, alcance o beneficios de la promo..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                {/* DATE AND TIME PICKERS */}
                <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#E30613]">
                    <Calendar className="w-4 h-4" />
                    Vigencia por Fecha y Hora Exacta
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">📅 Fecha y Hora de INICIO</label>
                      <input
                        type="datetime-local"
                        required
                        value={editingPromo.startDate}
                        onChange={(e) => setEditingPromo({ ...editingPromo, startDate: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">⏰ Fecha y Hora de FIN (Expiración)</label>
                      <input
                        type="datetime-local"
                        required
                        value={editingPromo.endDate}
                        onChange={(e) => setEditingPromo({ ...editingPromo, endDate: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mensaje para WhatsApp</label>
                  <input
                    type="text"
                    value={editingPromo.whatsappMessage || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, whatsappMessage: e.target.value })}
                    placeholder="Ej: Hola! Quiero aprovechar la promoción por tiempo limitado de Inter Red."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsPromoModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={promoSaving}
                    className="px-6 py-2.5 bg-[#E30613] text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {promoSaving ? 'Guardando...' : 'Guardar Promoción'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
