import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const dynamic = 'force-dynamic'

export async function GET() {
  const depositos = await prisma.deposito.findMany()
  return NextResponse.json(depositos)
}

export async function POST(request: NextRequest) {
  const { nombre } = await request.json()
  
  const deposito = await prisma.deposito.create({
    data: { nombre }
  })
  
  return NextResponse.json(deposito)
}