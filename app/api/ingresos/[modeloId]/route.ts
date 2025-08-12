import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { modeloId: string } }
) {
  const ingresos = await prisma.ingreso.findMany({
    where: { modeloId: parseInt(params.modeloId) },
    include: {
      pares: { include: { deposito: true } },
      modelo: { include: { marca: true } }
    },
    orderBy: { fechaIngreso: 'desc' }
  })
  
  return NextResponse.json(ingresos)
}