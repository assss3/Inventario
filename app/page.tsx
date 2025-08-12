'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Marca {
  id: number
  nombre: string
  modelos: Modelo[]
}

interface Modelo {
  id: number
  nombre: string
  marcaId: number
}

export default function Home() {
  const [marcas, setMarcas] = useState<Marca[]>([])


  useEffect(() => {
    fetchMarcas()
  }, [])

  const fetchMarcas = async () => {
    const res = await fetch('/api/marcas')
    const data = await res.json()
    setMarcas(data)
  }



  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          📝 Para crear marcas y modelos, ve a la sección de <a href="/admin" className="font-medium underline hover:text-blue-900">Administración</a>
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Marcas y Modelos</h2>
        <div className="space-y-4">
          {marcas.map(marca => (
            <div key={marca.id} className="border rounded p-4">
              <h3 className="font-medium text-lg mb-2">{marca.nombre}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {marca.modelos.map(modelo => (
                  <Link
                    key={modelo.id}
                    href={`/inventario/${modelo.id}`}
                    className="block p-3 border rounded hover:bg-gray-50 text-center"
                  >
                    {modelo.nombre}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}