import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { parId } = await request.json()
  
  // Obtener información del par
  const par = await prisma.par.findUnique({
    where: { id: parId },
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
  
  if (!par) {
    return NextResponse.json({ error: 'Par no encontrado' }, { status: 404 })
  }
  
  const montoAcumulado = Number(par.montoAcumulado || 0)
  const montoRetirado = Number(par.montoRetirado || 0)
  const montoDisponible = montoAcumulado - montoRetirado
  
  // Solo crear devolución negativa si el monto ya fue retirado
  if (montoRetirado > 0) {
    // Crear par con monto negativo (devolución)
    await prisma.par.create({
      data: {
        ingresoId: par.ingresoId,
        talle: par.talle,
        depositoId: par.depositoId,
        disponible: false,
        pagado: 'Parcial',
        comprador: `DEVOLUCIÓN - ${par.comprador}`,
        montoTotal: -montoAcumulado,
        montoPagado: 0,
        montoAcumulado: -montoAcumulado,
        montoRetirado: 0,
        fechaVenta: new Date(),
        clienteId: par.clienteId
      }
    })
  }
  // Si no fue retirado, simplemente se elimina el registro positivo (reseteo del par original)
  
  // Resetear el par original a estado inicial
  await prisma.par.update({
    where: { id: parId },
    data: {
      disponible: true,
      pagado: 'No pagado',
      comprador: null,
      montoTotal: null,
      montoPagado: null,
      montoAcumulado: 0,
      montoRetirado: 0,
      fechaVenta: null,
      clienteId: null
    }
  })
  
  return NextResponse.json({ 
    success: true, 
    montoDevuelto: montoAcumulado,
    yaRetirado: montoRetirado > 0
  })
}