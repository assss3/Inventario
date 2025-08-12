'use client'

import { useState, useEffect } from 'react'
import BackButton from '@/app/components/BackButton'

interface DineroItem {
  id: number
  modelo: string
  talle: number
  fechaIngreso: string
  fechaVenta?: string
  montoPagado: number
  montoRetirado: number
  disponible: number
  pagado: string
  comprador?: string
}

interface Retiro {
  id: number
  fechaRetiro: string
  montoTotal: number
  detalle: string
  pares: Array<{
    monto: number
    par: {
      talle: number
      comprador?: string
      ingreso: {
        modelo: {
          nombre: string
          marca: { nombre: string }
        }
      }
    }
  }>
}

export default function Dinero() {
  const [dinero, setDinero] = useState<{ items: DineroItem[], total: number }>({ items: [], total: 0 })
  const [retiros, setRetiros] = useState<Retiro[]>([])
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [vistaActual, setVistaActual] = useState<'disponible' | 'historial'>('disponible')

  useEffect(() => {
    fetchDinero()
    fetchRetiros()
  }, [])

  const fetchDinero = async () => {
    const res = await fetch('/api/dinero')
    const data = await res.json()
    setDinero(data)
  }

  const fetchRetiros = async () => {
    const res = await fetch('/api/retiros')
    const data = await res.json()
    setRetiros(data)
  }

  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const seleccionarTodos = () => {
    setSeleccionados(dinero.items.map(item => item.id))
  }

  const limpiarSeleccion = () => {
    setSeleccionados([])
  }

  const realizarRetiro = async () => {
    if (seleccionados.length === 0) return
    
    if (confirm(`¿Confirmar retiro de $${montoSeleccionado.toFixed(2)}?`)) {
      await fetch('/api/retiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paresIds: seleccionados })
      })
      
      setSeleccionados([])
      fetchDinero()
      fetchRetiros()
    }
  }

  const montoSeleccionado = dinero.items
    .filter(item => seleccionados.includes(item.id))
    .reduce((sum, item) => sum + item.disponible, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Gestión de Dinero</h1>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setVistaActual('disponible')}
            className={`px-4 py-2 rounded ${vistaActual === 'disponible' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Disponible
          </button>
          <button
            onClick={() => setVistaActual('historial')}
            className={`px-4 py-2 rounded ${vistaActual === 'historial' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Historial
          </button>
        </div>
      </div>

      {vistaActual === 'disponible' ? (
        <>
          {/* Resumen */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className={`text-3xl font-bold ${
                  dinero.total >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>${dinero.total.toFixed(2)}</div>
                <div className={`text-sm ${
                  dinero.total >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>Total disponible</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-900">{dinero.items.length}</div>
                <div className="text-sm text-green-700">Pares con dinero</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-900">${montoSeleccionado.toFixed(2)}</div>
                <div className="text-sm text-blue-700">Seleccionado</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-900">{seleccionados.length}</div>
                <div className="text-sm text-blue-700">Pares seleccionados</div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={seleccionarTodos}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Seleccionar Todos
              </button>
              <button
                onClick={limpiarSeleccion}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Limpiar Selección
              </button>
            </div>
            
            <button
              onClick={realizarRetiro}
              disabled={seleccionados.length === 0 || dinero.total <= 0}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              {dinero.total <= 0 ? 'Retiros bloqueados (saldo negativo)' : `Retirar $${montoSeleccionado.toFixed(2)}`}
            </button>
          </div>

          {/* Lista de dinero disponible */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={seleccionados.length === dinero.items.length && dinero.items.length > 0}
                      onChange={seleccionados.length === dinero.items.length ? limpiarSeleccion : seleccionarTodos}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Talle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comprador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Venta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dinero.items.map((item) => (
                  <tr key={item.id} className={seleccionados.includes(item.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(item.id)}
                        onChange={() => toggleSeleccion(item.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.modelo}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.talle}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.comprador || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.fechaVenta ? new Date(item.fechaVenta).toLocaleDateString() : '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${
                      item.disponible >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${item.disponible.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.pagado === 'Completo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.pagado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Historial de retiros */
        <div className="space-y-4">
          {retiros.map((retiro) => (
            <div key={retiro.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">
                    Retiro #{retiro.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(retiro.fechaRetiro).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    Number(retiro.montoTotal) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Number(retiro.montoTotal).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {retiro.pares.length} pares
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Detalle:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {retiro.pares.map((parRetiro, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">
                        {parRetiro.par.ingreso.modelo.marca.nombre} - {parRetiro.par.ingreso.modelo.nombre} (Talle {parRetiro.par.talle})
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        {parRetiro.par.comprador && (
                          <span className="text-blue-600">{parRetiro.par.comprador}</span>
                        )}
                        <span className={`font-bold ${
                          Number(parRetiro.monto) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>${Number(parRetiro.monto).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {retiros.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay retiros registrados
            </div>
          )}
        </div>
      )}
    </div>
  )
}