'use client'

import { useState, useEffect } from 'react'
import BackButton from '@/app/components/BackButton'

interface Cliente {
  id: number
  nombre: string
  telefono?: string
  email?: string
  pares: Array<{
    id: number
    talle: number
    montoTotal?: number
    fechaVenta?: string
    ingreso: {
      modelo: {
        nombre: string
        marca: { nombre: string }
      }
    }
  }>
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', email: '' })
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    const res = await fetch('/api/clientes')
    const data = await res.json()
    setClientes(data)
  }

  const crearCliente = async () => {
    if (!nuevoCliente.nombre.trim()) {
      alert('El nombre es requerido')
      return
    }

    await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente)
    })

    setNuevoCliente({ nombre: '', telefono: '', email: '' })
    setMostrarFormulario(false)
    fetchClientes()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
        </div>
        
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nuevo Cliente
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4">Nuevo Cliente</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({...nuevoCliente, nombre: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="text"
                value={nuevoCliente.telefono}
                onChange={(e) => setNuevoCliente({...nuevoCliente, telefono: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={nuevoCliente.email}
                onChange={(e) => setNuevoCliente({...nuevoCliente, email: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={crearCliente}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Crear
            </button>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="bg-white p-6 rounded-lg shadow border">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{cliente.nombre}</h3>
              {cliente.telefono && <p className="text-sm text-gray-600">📞 {cliente.telefono}</p>}
              {cliente.email && <p className="text-sm text-gray-600">✉️ {cliente.email}</p>}
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Compras ({cliente.pares.length})</h4>
              
              {cliente.pares.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cliente.pares.map((par) => (
                    <div key={par.id} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">
                        {par.ingreso.modelo.marca.nombre} - {par.ingreso.modelo.nombre}
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Talle {par.talle}</span>
                        <span>${Number(par.montoTotal || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin compras</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}