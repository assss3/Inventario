'use client'

import { useState, useEffect } from 'react'
import BackButton from '@/app/components/BackButton'

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
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [nuevaMarca, setNuevaMarca] = useState('')
  const [nuevoDeposito, setNuevoDeposito] = useState('')
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', email: '' })
  const [editandoMarca, setEditandoMarca] = useState<Marca | null>(null)
  const [editandoDeposito, setEditandoDeposito] = useState<Deposito | null>(null)
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null)
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null)
  const [nuevoModelo, setNuevoModelo] = useState('')
  const [editandoModelo, setEditandoModelo] = useState<Modelo | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [marcasRes, depositosRes, clientesRes] = await Promise.all([
      fetch('/api/marcas'),
      fetch('/api/depositos'),
      fetch('/api/clientes')
    ])
    const marcasData = await marcasRes.json()
    setMarcas(marcasData)
    setDepositos(await depositosRes.json())
    setClientes(await clientesRes.json())
    
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

  const crearCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente)
    })
    setNuevoCliente({ nombre: '', telefono: '', email: '' })
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

  const eliminarCliente = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el cliente "${nombre}"?`)) {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error)
      }
    }
  }

  const editarCliente = async (id: number, datos: { nombre: string; telefono?: string; email?: string }) => {
    await fetch(`/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    setEditandoCliente(null)
    fetchData()
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
          
          <form onSubmit={crearCliente} className="space-y-2 mb-4">
            <input
              type="text"
              value={nuevoCliente.nombre}
              onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
              placeholder="Nombre"
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="tel"
              value={nuevoCliente.telefono}
              onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
              placeholder="Teléfono (opcional)"
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="email"
              value={nuevoCliente.email}
              onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
              placeholder="Email (opcional)"
              className="w-full border rounded px-3 py-2"
            />
            <button type="submit" className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
              Crear Cliente
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {clientes.map(cliente => (
              <div key={cliente.id} className="border rounded p-3">
                {editandoCliente?.id === cliente.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      defaultValue={cliente.nombre}
                      className="w-full border rounded px-2 py-1 text-sm"
                      onBlur={(e) => editarCliente(cliente.id, {
                        nombre: e.target.value,
                        telefono: cliente.telefono,
                        email: cliente.email
                      })}
                    />
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => setEditandoCliente(cliente)}
                      className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <div className="font-medium">{cliente.nombre}</div>
                      {cliente.telefono && <div className="text-xs text-gray-600">{cliente.telefono}</div>}
                      {cliente.email && <div className="text-xs text-gray-600">{cliente.email}</div>}
                    </div>
                    <button
                      onClick={() => eliminarCliente(cliente.id, cliente.nombre)}
                      className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 w-full"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}