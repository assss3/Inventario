import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const clientes = await prisma.cliente.findMany({
    include: {
      pares: {
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
    },
    orderBy: { nombre: 'asc' }
  })
  return NextResponse.json(clientes)
}

export async function POST(request: NextRequest) {
  const { nombre, telefono, email } = await request.json()
  
  const cliente = await prisma.cliente.create({
    data: { nombre, telefono, email }
  })
  
  return NextResponse.json(cliente)
}