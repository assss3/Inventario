import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { nombre } = await request.json()
  
  const deposito = await prisma.deposito.update({
    where: { id: parseInt(params.id) },
    data: { nombre }
  })
  
  return NextResponse.json(deposito)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.deposito.delete({
    where: { id: parseInt(params.id) }
  })
  
  return NextResponse.json({ success: true })
}