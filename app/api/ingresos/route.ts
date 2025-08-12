import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { modeloId, pares, depositoId } = await request.json()
  
  if (!depositoId) {
    return NextResponse.json({ error: 'Depósito requerido' }, { status: 400 })
  }
  
  const ingreso = await prisma.ingreso.create({
    data: {
      modeloId,
      pares: {
        create: pares.map((par: { talle: number; cantidad: number }) => 
          Array(par.cantidad).fill(null).map(() => ({ 
            talle: par.talle,
            depositoId
          }))
        ).flat()
      }
    },
    include: {
      pares: { include: { deposito: true } },
      modelo: { include: { marca: true } }
    }
  })
  
  return NextResponse.json(ingreso)
}