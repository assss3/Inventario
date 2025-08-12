import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { paresIds } = await request.json()
  
  // Obtener información de los pares
  const pares = await prisma.par.findMany({
    where: { id: { in: paresIds } },
    include: {
      ingreso: {
        include: {
          modelo: {
            include: { marca: true }
          }
        }
      }
    }
  })
  
  let montoTotal = 0
  const detalles: string[] = []
  
  // Calcular monto total y crear detalle
  for (const par of pares) {
    const montoAcumulado = Number(par.montoAcumulado || 0)
    const montoRetirado = Number(par.montoRetirado || 0)
    const disponible = montoAcumulado - montoRetirado
    
    if (disponible !== 0) {
      montoTotal += disponible
      const comprador = par.comprador ? ` - ${par.comprador}` : ''
      const signo = disponible >= 0 ? '$' : '-$'
      const monto = Math.abs(disponible)
      detalles.push(`${par.ingreso.modelo.marca.nombre} - ${par.ingreso.modelo.nombre} (Talle ${par.talle})${comprador}: ${signo}${monto.toFixed(2)}`)
    }
  }
  
  // Crear retiro
  const retiro = await prisma.retiro.create({
    data: {
      montoTotal,
      detalle: detalles.join(', ')
    }
  })
  
  // Actualizar pares y crear registros de retiro
  for (const par of pares) {
    const montoAcumulado = Number(par.montoAcumulado || 0)
    const montoRetirado = Number(par.montoRetirado || 0)
    const disponible = montoAcumulado - montoRetirado
    
    if (disponible !== 0) {
      // Actualizar monto retirado del par
      await prisma.par.update({
        where: { id: par.id },
        data: { montoRetirado: montoAcumulado }
      })
      
      // Crear registro de retiro
      await prisma.parRetiro.create({
        data: {
          retiroId: retiro.id,
          parId: par.id,
          monto: disponible
        }
      })
    }
  }
  
  return NextResponse.json(retiro)
}

export async function GET() {
  const retiros = await prisma.retiro.findMany({
    include: {
      pares: {
        include: {
          par: {
            include: {
              ingreso: {
                include: {
                  modelo: {
                    include: { marca: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { fechaRetiro: 'desc' }
  })
  
  return NextResponse.json(retiros)
}