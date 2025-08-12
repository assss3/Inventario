'use client'

import { useState, useEffect } from 'react'
import BackButton from '@/app/components/BackButton'
import AuthGuard from '@/app/components/AuthGuard'

interface Marca {
  id: number
  nombre: string
  modelos?: Modelo[]
}

interface Modelo {
  id: number
  nombre: string
  marcaId: number
}

interface Cliente {
  id: number
  nombre: string
  telefono?: string
  email?: string
}

interface Deposito {
  id: number
  nombre: string
}

export default function Admin() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [nuevaMarca, setNuevaMarca] = useState('')
  const [nuevoDeposito, setNuevoDeposito] = useState('')
  const [editandoMarca, setEditandoMarca] = useState<Marca | null>(null)
  const [editandoDeposito, setEditandoDeposito] = useState<Deposito | null>(null)

  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null)
  const [nuevoModelo, setNuevoModelo] = useState('')
  const [editandoModelo, setEditandoModelo] = useState<Modelo | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [marcasRes, depositosRes] = await Promise.all([
      fetch('/api/marcas'),
      fetch('/api/depositos')
    ])
    const marcasData = await marcasRes.json()
    setMarcas(marcasData)
    setDepositos(await depositosRes.json())
    
    // Actualizar marca seleccionada si existe
    if (marcaSeleccionada) {
      const marcaActualizada = marcasData.find((m: Marca) => m.id === marcaSeleccionada.id)
      setMarcaSeleccionada(marcaActualizada || null)
    }
  }

  const crearMarca = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/marcas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevaMarca })
    })
    setNuevaMarca('')
    fetchData()
  }

  const crearDeposito = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/depositos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoDeposito })
    })
    setNuevoDeposito('')
    fetchData()
  }



  const eliminarMarca = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la marca "${nombre}"?`)) {
      const res = await fetch(`/api/marcas?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error)
      }
    }
  }

  const eliminarDeposito = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el depósito "${nombre}"?`)) {
      await fetch(`/api/depositos/${id}`, { method: 'DELETE' })
      fetchData()
    }
  }





  const editarDeposito = async (id: number, nombre: string) => {
    await fetch(`/api/depositos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    })
    setEditandoDeposito(null)
    fetchData()
  }

  const crearModelo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!marcaSeleccionada) return
    
    await fetch('/api/modelos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoModelo, marcaId: marcaSeleccionada.id })
    })
    setNuevoModelo('')
    fetchData()
  }

  const editarModelo = async (id: number, nombre: string) => {
    await fetch(`/api/modelos?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    })
    setEditandoModelo(null)
    fetchData()
  }

  const eliminarModelo = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el modelo "${nombre}"?`)) {
      const res = await fetch(`/api/modelos?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error)
      }
    }
  }

  return (
    <AuthGuard requiredRole="admin">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Administración</h1>
        </div>
        <div className="flex gap-2">
          <a
            href="/dinero"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Dinero
          </a>
          <a
            href="/vista-depositos"
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Ver Depósitos
          </a>
          <a
            href="/deudores"
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Ver Deudores
          </a>
          <button
            onClick={() => {
              localStorage.removeItem('user')
              window.location.href = '/login'
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gestión de Marcas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Gestión de Marcas</h2>
          
          <form onSubmit={crearMarca} className="flex gap-2 mb-4">
            <input
              type="text"
              value={nuevaMarca}
              onChange={(e) => setNuevaMarca(e.target.value)}
              placeholder="Nueva marca"
              className="flex-1 border rounded px-3 py-2"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Crear
            </button>
          </form>

          <div className="space-y-2">
            {marcas.map(marca => (
              <div key={marca.id} className="border rounded">
                <div className="flex items-center justify-between p-2">
                  <button
                    onClick={() => setMarcaSeleccionada(marcaSeleccionada?.id === marca.id ? null : marca)}
                    className="flex-1 text-left hover:bg-gray-50 p-1 rounded"
                  >
                    {marca.nombre} {marca.modelos && `(${marca.modelos.length} modelos)`}
                  </button>
                  <button
                    onClick={() => eliminarMarca(marca.id, marca.nombre)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
                
                {marcaSeleccionada?.id === marca.id && (
                  <div className="border-t p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Modelos de {marca.nombre}</h4>
                    
                    <form onSubmit={crearModelo} className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={nuevoModelo}
                        onChange={(e) => setNuevoModelo(e.target.value)}
                        placeholder="Nuevo modelo"
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        required
                      />
                      <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                        Crear
                      </button>
                    </form>
                    
                    <div className="space-y-1">
                      {marca.modelos?.map(modelo => (
                        <div key={modelo.id} className="flex items-center justify-between p-2 bg-white border rounded">
                          {editandoModelo?.id === modelo.id ? (
                            <input
                              type="text"
                              defaultValue={modelo.nombre}
                              onBlur={(e) => editarModelo(modelo.id, e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && editarModelo(modelo.id, e.currentTarget.value)}
                              className="flex-1 border rounded px-2 py-1 text-sm"
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditandoModelo(modelo)}
                              className="flex-1 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm"
                            >
                              {modelo.nombre}
                            </span>
                          )}
                          <button
                            onClick={() => eliminarModelo(modelo.id, modelo.nombre)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gestión de Depósitos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Gestión de Depósitos</h2>
          
          <form onSubmit={crearDeposito} className="flex gap-2 mb-4">
            <input
              type="text"
              value={nuevoDeposito}
              onChange={(e) => setNuevoDeposito(e.target.value)}
              placeholder="Nuevo depósito"
              className="flex-1 border rounded px-3 py-2"
              required
            />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Crear
            </button>
          </form>

          <div className="space-y-2">
            {depositos.map(deposito => (
              <div key={deposito.id} className="flex items-center justify-between p-2 border rounded">
                {editandoDeposito?.id === deposito.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      defaultValue={deposito.nombre}
                      onBlur={(e) => editarDeposito(deposito.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && editarDeposito(deposito.id, e.currentTarget.value)}
                      className="flex-1 border rounded px-2 py-1"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span onClick={() => setEditandoDeposito(deposito)} className="cursor-pointer flex-1">
                    {deposito.nombre}
                  </span>
                )}
                <button
                  onClick={() => eliminarDeposito(deposito.id, deposito.nombre)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Gestión de Clientes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Gestión de Clientes</h2>
          
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">La gestión de clientes se ha movido a una sección dedicada</p>
            <a
              href="/clientes"
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 inline-block"
            >
              Ir a Gestión de Clientes
            </a>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}