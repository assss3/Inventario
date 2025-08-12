import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const depositos = await prisma.deposito.findMany({
    include: {
      pares: {
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
      }
    }
  })

  // Agrupar por depósito -> marca -> modelo -> talles
  const depositosAgrupados = depositos.map(deposito => {
    const marcasMap = new Map()
    
    deposito.pares.forEach(par => {
      const marca = par.ingreso.modelo.marca
      const modelo = par.ingreso.modelo
      
      if (!marcasMap.has(marca.id)) {
        marcasMap.set(marca.id, {
          id: marca.id,
          nombre: marca.nombre,
          modelos: new Map()
        })
      }
      
      const marcaData = marcasMap.get(marca.id)
      
      if (!marcaData.modelos.has(modelo.id)) {
        marcaData.modelos.set(modelo.id, {
          id: modelo.id,
          nombre: modelo.nombre,
          talles: []
        })
      }
      
      marcaData.modelos.get(modelo.id).talles.push(par.talle)
    })
    
    // Convertir Maps a arrays y ordenar talles
    const marcas = Array.from(marcasMap.values()).map(marca => ({
      id: marca.id,
      nombre: marca.nombre,
      modelos: Array.from(marca.modelos.values()).map(modelo => ({
        id: modelo.id,
        nombre: modelo.nombre,
        talles: [...new Set(modelo.talles)].sort((a, b) => a - b)
      }))
    }))
    
    return {
      id: deposito.id,
      nombre: deposito.nombre,
      marcas,
      totalPares: deposito.pares.length
    }
  })

  return NextResponse.json(depositosAgrupados)
}