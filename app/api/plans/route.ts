import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const plansFile = path.join(process.cwd(), 'data', 'plans.json')

async function ensureDataDir() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  } catch (e) {
    // Ignore
  }
}

async function readPlans() {
  await ensureDataDir()
  try {
    const data = await fs.readFile(plansFile, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

async function writePlans(data: any) {
  await ensureDataDir()
  await fs.writeFile(plansFile, JSON.stringify(data, null, 2))
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
    const plans = await readPlans()
    
    if (all) {
      return NextResponse.json(plans)
    }
    
    // Default: return only active plans sorted by order
    const activePlans = plans
      .filter((p: any) => p.active !== false)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    return NextResponse.json(activePlans)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los planes' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!verifyAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const plans = await readPlans()

    const newPlan = {
      id: body.id || 'plan-' + Math.random().toString(36).substring(2, 9),
      name: body.name || 'Nuevo Plan',
      category: body.category || 'General',
      speed: body.speed || '',
      price: body.price || '0',
      currency: body.currency || '$',
      period: body.period || '/mes',
      features: Array.isArray(body.features) ? body.features : [],
      isRecommended: Boolean(body.isRecommended),
      popularTag: body.popularTag || '',
      buttonText: body.buttonText || 'Contratar Plan',
      theme: body.theme || 'light',
      active: body.active !== undefined ? body.active : true,
      order: body.order !== undefined ? Number(body.order) : plans.length + 1
    }

    plans.push(newPlan)
    await writePlans(plans)

    return NextResponse.json(newPlan, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear el plan' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    if (!verifyAdmin(req)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const updatedPlan = await req.json()
    if (!updatedPlan.id) {
      return NextResponse.json({ error: 'ID de plan requerido' }, { status: 400 })
    }

    const plans = await readPlans()
    const index = plans.findIndex((p: any) => p.id === updatedPlan.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    plans[index] = {
      ...plans[index],
      ...updatedPlan
    }

    await writePlans(plans)
    return NextResponse.json(plans[index])
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el plan' }, { status: 500 })
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
      return NextResponse.json({ error: 'ID de plan requerido' }, { status: 400 })
    }

    const plans = await readPlans()
    const filtered = plans.filter((p: any) => p.id !== id)

    await writePlans(filtered)
    return NextResponse.json({ success: true, message: 'Plan eliminado' })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar el plan' }, { status: 500 })
  }
}
