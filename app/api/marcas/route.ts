import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const marcas = await prisma.marca.findMany({
    include: { modelos: true }
  })
  return NextResponse.json(marcas)
}

export async function POST(request: NextRequest) {
  const { nombre } = await request.json()
  
  const marca = await prisma.marca.create({
    data: { nombre }
  })
  
  return NextResponse.json(marca)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }
  
  // Verificar que no tenga modelos
  const modelos = await prisma.modelo.count({
    where: { marcaId: parseInt(id) }
  })
  
  if (modelos > 0) {
    return NextResponse.json({ error: 'No se puede eliminar una marca que tiene modelos asociados' }, { status: 400 })
  }
  
  await prisma.marca.delete({
    where: { id: parseInt(id) }
  })
  
  return NextResponse.json({ success: true })
}