import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const deudores = await prisma.par.findMany({
    where: {
      pagado: 'Parcial',
      comprador: { not: null },
      montoTotal: { not: null },
      OR: [
        { montoAcumulado: null },
        { montoAcumulado: { lt: prisma.par.fields.montoTotal } }
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
      },
      cliente: true
    },
    orderBy: {
      fechaVenta: 'desc'
    }
  })

  // Filtrar en JavaScript para mayor precisión
  const deudoresFiltrados = deudores.filter(par => {
    const total = Number(par.montoTotal || 0)
    const acumulado = Number(par.montoAcumulado || 0)
    return total > acumulado
  })

  return NextResponse.json(deudoresFiltrados)
}