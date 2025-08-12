'use client'

import { useState, useEffect } from 'react'
import BackButton from '@/app/components/BackButton'

interface Deudor {
  id: number
  talle: number
  comprador: string
  montoTotal: number
  montoPagado: number
  fechaVenta?: string
  ingreso: {
    modelo: {
      nombre: string
      marca: {
        nombre: string
      }
    }
  }
}

export default function Deudores() {
  const [deudores, setDeudores] = useState<Deudor[]>([])
  const [deudorSeleccionado, setDeudorSeleccionado] = useState<Deudor | null>(null)

  useEffect(() => {
    fetchDeudores()
  }, [])

  const fetchDeudores = async () => {
    const res = await fetch('/api/deudores')
    const data = await res.json()
    setDeudores(data)
  }

  const calcularFaltante = (total: number, pagado: number) => {
    return total - pagado
  }

  const actualizarPago = async (parId: number, datos: { montoPagado: number; pagado: string }) => {
    await fetch(`/api/pares/${parId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    fetchDeudores()
    setDeudorSeleccionado(null)
  }

  const marcarComoPagado = (deudor: Deudor, nuevoPago: number) => {
    const total = Number(deudor.montoTotal || 0)
    const pagado = nuevoPago >= total ? 'Completo' : 'Parcial'
    actualizarPago(deudor.id, { montoPagado: nuevoPago, pagado })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Deudores</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comprador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zapatilla
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Talle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Venta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Faltante
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deudores.map((deudor) => (
              <tr 
                key={deudor.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setDeudorSeleccionado(deudor)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {deudor.comprador}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {deudor.ingreso.modelo.marca.nombre} - {deudor.ingreso.modelo.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {deudor.talle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {deudor.fechaVenta ? new Date(deudor.fechaVenta).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${Number(deudor.montoTotal || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${Number(deudor.montoPagado || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  ${calcularFaltante(Number(deudor.montoTotal || 0), Number(deudor.montoPagado || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {deudores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay deudores registrados
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-blue-800 font-medium">Total deudores:</span>
          <span className="text-blue-900 font-bold">{deudores.length}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-blue-800 font-medium">Monto total adeudado:</span>
          <span className="text-red-600 font-bold">
            ${deudores.reduce((total, deudor) => 
              total + calcularFaltante(Number(deudor.montoTotal || 0), Number(deudor.montoPagado || 0)), 0
            ).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Modal de edición de pago */}
      {deudorSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">
              Actualizar pago - {deudorSeleccionado.comprador}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Zapatilla:</strong> {deudorSeleccionado.ingreso.modelo.marca.nombre} - {deudorSeleccionado.ingreso.modelo.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Talle:</strong> {deudorSeleccionado.talle}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total:</strong> ${Number(deudorSeleccionado.montoTotal || 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Pagado actual:</strong> ${Number(deudorSeleccionado.montoPagado || 0).toFixed(2)}
                </p>
                <p className="text-sm font-medium text-red-600">
                  <strong>Faltante:</strong> ${calcularFaltante(
                    Number(deudorSeleccionado.montoTotal || 0), 
                    Number(deudorSeleccionado.montoPagado || 0)
                  ).toFixed(2)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nuevo monto pagado</label>
                <input
                  type="number"
                  step="0.01"
                  min={Number(deudorSeleccionado.montoPagado || 0)}
                  max={Number(deudorSeleccionado.montoTotal || 0)}
                  defaultValue={Number(deudorSeleccionado.montoPagado || 0)}
                  className="w-full border rounded px-3 py-2"
                  id="nuevoPago"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const input = document.getElementById('nuevoPago') as HTMLInputElement
                    const nuevoPago = parseFloat(input.value)
                    if (nuevoPago >= Number(deudorSeleccionado.montoPagado || 0)) {
                      marcarComoPagado(deudorSeleccionado, nuevoPago)
                    }
                  }}
                  className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Actualizar Pago
                </button>
                <button
                  onClick={() => {
                    const total = Number(deudorSeleccionado.montoTotal || 0)
                    marcarComoPagado(deudorSeleccionado, total)
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Marcar Pagado
                </button>
              </div>
              
              <button
                onClick={() => setDeudorSeleccionado(null)}
                className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}