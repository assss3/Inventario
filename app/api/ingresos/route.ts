import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { modeloId, pares } = await request.json()
  
  // Obtener el primer depósito disponible
  let deposito = await prisma.deposito.findFirst()
  
  // Si no existe ningún depósito, crear uno por defecto
  if (!deposito) {
    deposito = await prisma.deposito.create({
      data: { nombre: 'Principal' }
    })
  }
  
  const ingreso = await prisma.ingreso.create({
    data: {
      modeloId,
      pares: {
        create: pares.map((par: { talle: number; cantidad: number }) => 
          Array(par.cantidad).fill(null).map(() => ({ 
            talle: par.talle,
            depositoId: deposito.id
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