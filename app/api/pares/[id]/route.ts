import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { depositoId, disponible, pagado, comprador, montoTotal, montoPagado, fechaVenta, clienteId } = await request.json()
  
  // Obtener el par actual para calcular acumulado
  const parActual = await prisma.par.findUnique({
    where: { id: parseInt(params.id) }
  })
  
  // Calcular nuevo monto acumulado
  const montoAcumuladoActual = Number(parActual?.montoAcumulado || 0)
  const montoPagadoActual = Number(parActual?.montoPagado || 0)
  const nuevoMontoPagado = Number(montoPagado || 0)
  
  // Calcular nuevo monto acumulado de forma segura
  let nuevoMontoAcumulado = montoAcumuladoActual
  if (nuevoMontoPagado !== montoPagadoActual) {
    nuevoMontoAcumulado = montoAcumuladoActual + (nuevoMontoPagado - montoPagadoActual)
  }
  
  // Si es pago completo, convertir a parcial con monto total
  let pagadoFinal = pagado
  let montoPagadoFinal = nuevoMontoPagado
  let montoAcumuladoFinal = nuevoMontoAcumulado
  let disponibleFinal = disponible
  
  if (pagado === 'Completo' && montoTotal) {
    pagadoFinal = 'Parcial'
    montoPagadoFinal = 0
    montoAcumuladoFinal = Number(montoTotal)
    disponibleFinal = false
  } else if (pagado === 'Parcial') {
    montoPagadoFinal = 0
    disponibleFinal = false
  } else if (pagado === 'No pagado') {
    montoAcumuladoFinal = 0
    disponibleFinal = true
  }
  
  // Validar que los montos no excedan los límites
  if (Math.abs(montoAcumuladoFinal) > 99999999) {
    return NextResponse.json({ error: 'Monto excede el límite permitido' }, { status: 400 })
  }
  
  const par = await prisma.par.update({
    where: { id: parseInt(params.id) },
    data: {
      depositoId,
      disponible: disponibleFinal,
      pagado: pagadoFinal,
      comprador,
      montoTotal,
      montoPagado: montoPagadoFinal,
      montoAcumulado: montoAcumuladoFinal,
      fechaVenta: fechaVenta ? new Date(fechaVenta) : null,
      clienteId: clienteId || null
    }
  })
  
  return NextResponse.json(par)
}