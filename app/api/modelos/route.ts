import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const modelos = await prisma.modelo.findMany({
    include: { marca: true }
  })
  return NextResponse.json(modelos)
}

export async function POST(request: NextRequest) {
  const { nombre, marcaId } = await request.json()
  
  const modelo = await prisma.modelo.create({
    data: { nombre, marcaId },
    include: { marca: true }
  })
  
  return NextResponse.json(modelo)
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const { nombre } = await request.json()
  
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }
  
  const modelo = await prisma.modelo.update({
    where: { id: parseInt(id) },
    data: { nombre },
    include: { marca: true }
  })
  
  return NextResponse.json(modelo)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }
  
  // Verificar que no tenga ingresos
  const ingresos = await prisma.ingreso.count({
    where: { modeloId: parseInt(id) }
  })
  
  if (ingresos > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un modelo que tiene ingresos asociados' }, { status: 400 })
  }
  
  await prisma.modelo.delete({
    where: { id: parseInt(id) }
  })
  
  return NextResponse.json({ success: true })
}