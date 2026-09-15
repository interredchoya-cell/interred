import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const promoFile = path.join(process.cwd(), 'data', 'promotions.json')

async function ensureDataDir() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  } catch (e) {
    // Ignore
  }
}

async function readPromotions() {
  await ensureDataDir()
  try {
    const data = await fs.readFile(promoFile, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

async function writePromotions(data: any) {
  await ensureDataDir()
  await fs.writeFile(promoFile, JSON.stringify(data, null, 2))
}

function verifyAdmin(req: Request): boolean {
  const pin = req.headers.get('x-admin-pin')
  const adminPin = process.env.ADMIN_PIN || '1234'
  return pin === adminPin
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    const promos = await readPromotions()

    if (all) {
      return NextResponse.json(promos)
    }

    const now = new Date().getTime()
    // Return only active promos where now is between startDate and endDate
    const validPromos = promos.filter((p: any) => {
      if (!p.active) return false
      const start = p.startDate ? new Date(p.startDate).getTime() : 0
      const end = p.endDate ? new Date(p.endDate).getTime() : Infinity
      return now >= start && now <= end
    })

    return NextResponse.json(validPromos)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener las promociones' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!verifyAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const promos = await readPromotions()

    const newPromo = {
      id: body.id || 'promo-' + Math.random().toString(36).substring(2, 9),
      title: body.title || 'Nueva Promoción',
      badge: body.badge || '⚡ OFERTA LIMITADA',
      subtitle: body.subtitle || '',
      description: body.description || '',
      discount: body.discount || '',
      planId: body.planId || '',
      startDate: body.startDate || new Date().toISOString().slice(0, 16),
      endDate: body.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      buttonText: body.buttonText || 'Aprovechar Promo por WhatsApp',
      whatsappMessage: body.whatsappMessage || '',
      active: body.active !== undefined ? body.active : true,
      createdAt: new Date().toISOString()
    }

    promos.unshift(newPromo)
    await writePromotions(promos)

    return NextResponse.json(newPromo, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear la promoción' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    if (!verifyAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const updatedPromo = await req.json()
    if (!updatedPromo.id) {
      return NextResponse.json({ error: 'ID de promoción requerido' }, { status: 400 })
    }

    const promos = await readPromotions()
    const index = promos.findIndex((p: any) => p.id === updatedPromo.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Promoción no encontrada' }, { status: 404 })
    }

    promos[index] = {
      ...promos[index],
      ...updatedPromo
    }

    await writePromotions(promos)
    return NextResponse.json(promos[index])
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar la promoción' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    if (!verifyAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de promoción requerido' }, { status: 400 })
    }

    const promos = await readPromotions()
    const filtered = promos.filter((p: any) => p.id !== id)

    await writePromotions(filtered)
    return NextResponse.json({ success: true, message: 'Promoción eliminada' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar la promoción' }, { status: 500 })
  }
}
