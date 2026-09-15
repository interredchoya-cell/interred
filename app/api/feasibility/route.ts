import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import fs from 'fs/promises'
import path from 'path'

// Fallback JSON file path
const fallbackFile = path.join(process.cwd(), 'data', 'requests.json')

async function ensureDataDir() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  } catch (e) {
    // Ignore
  }
}

async function readFallbackData() {
  await ensureDataDir()
  try {
    const data = await fs.readFile(fallbackFile, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

async function writeFallbackData(data: any) {
  await ensureDataDir()
  await fs.writeFile(fallbackFile, JSON.stringify(data, null, 2))
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Attempt Prisma if DB url exists
    if (process.env.DATABASE_URL) {
      try {
        const newReq = await prisma.feasibilityRequest.create({ data: body })
        return NextResponse.json(newReq)
      } catch (dbError) {
        console.error('Prisma failed, falling back to JSON:', dbError)
      }
    }
    
    // Fallback to JSON
    const data = await readFallbackData()
    const newRequest = {
      id: Math.random().toString(36).substring(7),
      ...body,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
    data.push(newRequest)
    await writeFallbackData(data)
    
    return NextResponse.json(newRequest)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    // Simple admin PIN check (e.g. from header)
    const pin = req.headers.get('x-admin-pin')
    const adminPin = process.env.ADMIN_PIN || '1234'
    if (pin !== adminPin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (process.env.DATABASE_URL) {
      try {
        const requests = await prisma.feasibilityRequest.findMany({
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(requests)
      } catch (dbError) {
        console.error('Prisma failed, falling back to JSON:', dbError)
      }
    }
    
    // Fallback
    const data = await readFallbackData()
    data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const pin = req.headers.get('x-admin-pin')
    const adminPin = process.env.ADMIN_PIN || '1234'
    if (pin !== adminPin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await req.json()

    if (process.env.DATABASE_URL) {
      try {
        const updated = await prisma.feasibilityRequest.update({
          where: { id },
          data: { status }
        })
        return NextResponse.json(updated)
      } catch (dbError) {
        console.error('Prisma failed, falling back to JSON:', dbError)
      }
    }

    // Fallback
    const data = await readFallbackData()
    const index = data.findIndex((r: any) => r.id === id)
    if (index !== -1) {
      data[index].status = status
      await writeFallbackData(data)
      return NextResponse.json(data[index])
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const pin = req.headers.get('x-admin-pin')
    const adminPin = process.env.ADMIN_PIN || '1234'
    if (pin !== adminPin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    if (process.env.DATABASE_URL) {
      try {
        await prisma.feasibilityRequest.delete({ where: { id } })
        return NextResponse.json({ success: true })
      } catch (dbError) {
        console.error('Prisma failed, falling back to JSON:', dbError)
      }
    }

    // Fallback
    const data = await readFallbackData()
    const filtered = data.filter((r: any) => r.id !== id)
    await writeFallbackData(filtered)
    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 })
  }
}
