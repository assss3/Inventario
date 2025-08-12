import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { nombre, telefono, email } = await request.json()
  
  const cliente = await prisma.cliente.update({
    where: { id: parseInt(params.id) },
    data: { nombre, telefono, email }
  })
  
  return NextResponse.json(cliente)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar que no tenga pares asociados
  const pares = await prisma.par.count({
    where: { clienteId: parseInt(params.id) }
  })
  
  if (pares > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un cliente con compras asociadas' }, { status: 400 })
  }
  
  await prisma.cliente.delete({
    where: { id: parseInt(params.id) }
  })
  
  return NextResponse.json({ success: true })
}