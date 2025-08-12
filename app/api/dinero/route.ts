import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const pares = await prisma.par.findMany({
    where: {
      OR: [
        { pagado: 'Completo' },
        { pagado: 'Parcial' }
      ]
    },
    include: {
      ingreso: {
        include: {
          modelo: {
            include: {
              marca: true
            }
          }
        }
      }
    }
  })

  const dineroDisponible = pares.map(par => {
    const montoAcumulado = Number(par.montoAcumulado || 0)
    const montoRetirado = Number(par.montoRetirado || 0)
    const disponible = montoAcumulado - montoRetirado
    const montoTotal = Number(par.montoTotal || 0)
    
    // Si el monto acumulado es igual al total, es pago completo
    const estadoPago = (montoTotal > 0 && montoAcumulado >= montoTotal) ? 'Completo' : par.pagado

    return {
      id: par.id,
      modelo: `${par.ingreso.modelo.marca.nombre} - ${par.ingreso.modelo.nombre}`,
      talle: par.talle,
      fechaIngreso: par.ingreso.fechaIngreso,
      fechaVenta: par.fechaVenta,
      montoPagado: montoAcumulado,
      montoRetirado,
      disponible,
      pagado: estadoPago,
      comprador: par.comprador
    }
  }).filter(item => item.disponible !== 0)

  const total = dineroDisponible.reduce((sum, item) => sum + item.disponible, 0)

  return NextResponse.json({
    items: dineroDisponible,
    total
  })
}