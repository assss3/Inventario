'use client'

import { useState, useEffect } from 'react'
import BackButton from '@/app/components/BackButton'

interface Modelo {
  id: number
  nombre: string
  talles: number[]
}

interface Marca {
  id: number
  nombre: string
  modelos: Modelo[]
}

interface Deposito {
  id: number
  nombre: string
  marcas: Marca[]
  totalPares: number
}

export default function VistaDepositos() {
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [depositoSeleccionado, setDepositoSeleccionado] = useState<Deposito | null>(null)

  useEffect(() => {
    fetchDepositos()
  }, [])

  const fetchDepositos = async () => {
    const res = await fetch('/api/depositos/vista')
    const data = await res.json()
    setDepositos(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Vista de Depósitos</h1>
      </div>

      {!depositoSeleccionado ? (
        // Lista de depósitos
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depositos.map(deposito => (
            <div
              key={deposito.id}
              onClick={() => setDepositoSeleccionado(deposito)}
              className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-medium mb-2">{deposito.nombre}</h3>
              <div className="text-sm text-gray-600">
                <p>{deposito.totalPares} pares en total</p>
                <p>{deposito.marcas.length} marcas diferentes</p>
                <p>{deposito.marcas.reduce((total, marca) => total + marca.modelos.length, 0)} modelos</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Detalle del depósito seleccionado
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Depósito: {depositoSeleccionado.nombre}
            </h2>
            <button
              onClick={() => setDepositoSeleccionado(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Volver a depósitos
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-900">{depositoSeleccionado.totalPares}</div>
                <div className="text-sm text-blue-700">Total de pares</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">{depositoSeleccionado.marcas.length}</div>
                <div className="text-sm text-blue-700">Marcas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {depositoSeleccionado.marcas.reduce((total, marca) => total + marca.modelos.length, 0)}
                </div>
                <div className="text-sm text-blue-700">Modelos</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {depositoSeleccionado.marcas.map(marca => (
              <div key={marca.id} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4 text-gray-900 border-b pb-2">
                  {marca.nombre}
                </h3>
                
                <div className="space-y-4">
                  {marca.modelos.map(modelo => (
                    <div key={modelo.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-800 mb-2">
                        {modelo.nombre}
                      </h4>
                      
                      <div className="flex flex-wrap gap-2">
                        {modelo.talles.map(talle => (
                          <span
                            key={talle}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border"
                          >
                            Talle {talle}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        {modelo.talles.length} talle{modelo.talles.length !== 1 ? 's' : ''} disponible{modelo.talles.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {depositoSeleccionado.marcas.length === 0 && (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              Este depósito no tiene pares registrados
            </div>
          )}
        </div>
      )}
    </div>
  )
}