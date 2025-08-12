import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.ingreso.delete({
    where: { id: parseInt(params.id) }
  })
  
  return NextResponse.json({ success: true })
}