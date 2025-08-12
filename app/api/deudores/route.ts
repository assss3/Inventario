import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const deudores = await prisma.par.findMany({
    where: {
      pagado: 'Parcial',
      comprador: { not: null }
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
    },
    orderBy: {
      fechaVenta: 'desc'
    }
  })

  return NextResponse.json(deudores)
}