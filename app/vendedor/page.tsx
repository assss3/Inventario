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

export default function Vendedor() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchMarcas()
  }, [])

  const fetchMarcas = async () => {
    const res = await fetch('/api/marcas')
    const data = await res.json()
    setMarcas(data)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Panel Vendedor</h1>
          {user && <p className="text-gray-600">Bienvenido, {user.username}</p>}
        </div>
        
        <div className="flex gap-4">
          <a
            href="/clientes"
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Clientes
          </a>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Inventario de Zapatillas</h2>
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