'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import BackButton from '@/app/components/BackButton'

interface Par {
  id: number
  talle: number
  depositoId: number
  disponible: boolean
  pagado: string
  comprador?: string
  montoTotal?: number
  montoPagado?: number
  montoAcumulado?: number
  fechaVenta?: string
  clienteId?: number
  deposito: { id: number; nombre: string }
  cliente?: { id: number; nombre: string }
}

interface Deposito {
  id: number
  nombre: string
}

interface Ingreso {
  id: number
  fechaIngreso: string
  pares: Par[]
  modelo: {
    id: number
    nombre: string
    marca: { nombre: string }
  }
}

export default function InventarioModelo() {
  const params = useParams()
  const modeloId = params.modeloId as string
  
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [paresIngreso, setParesIngreso] = useState<{talle: number, cantidad: number}[]>(
    Array.from({ length: 25 }, (_, i) => ({ talle: i + 20, cantidad: 0 }))
  )
  const [parSeleccionado, setParSeleccionado] = useState<Par | null>(null)
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [clientes, setClientes] = useState<{ id: number; nombre: string }[]>([])
  const [filtroDeposito, setFiltroDeposito] = useState<number | null>(null)
  const [filtroCliente, setFiltroCliente] = useState<number | null>(null)

  useEffect(() => {
    fetchIngresos()
    fetchDepositos()
    fetchClientes()
  }, [modeloId])

  const fetchIngresos = async () => {
    const res = await fetch(`/api/ingresos/${modeloId}`)
    const data = await res.json()
    setIngresos(data)
  }

  const fetchDepositos = async () => {
    const res = await fetch('/api/depositos')
    const data = await res.json()
    setDepositos(data)
  }

  const fetchClientes = async () => {
    const res = await fetch('/api/clientes')
    const data = await res.json()
    setClientes(data)
  }

  const eliminarIngreso = async (ingresoId: number, fecha: string, cantidadPares: number) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el ingreso del ${fecha} con ${cantidadPares} pares?`)) {
      await fetch(`/api/ingresos/delete/${ingresoId}`, { method: 'DELETE' })
      fetchIngresos()
    }
  }

  const actualizarCantidad = (talle: number, cantidad: number) => {
    setParesIngreso(prev => 
      prev.map(par => par.talle === talle ? { ...par, cantidad } : par)
    )
  }

  const registrarIngreso = async () => {
    const paresConCantidad = paresIngreso.filter(par => par.cantidad > 0)
    if (paresConCantidad.length > 0) {
      await fetch('/api/ingresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modeloId: parseInt(modeloId),
          pares: paresConCantidad
        })
      })
      setParesIngreso(Array.from({ length: 25 }, (_, i) => ({ talle: i + 20, cantidad: 0 })))
      fetchIngresos()
    }
  }

  const actualizarPar = async (parId: number, datos: Partial<Par>) => {
    await fetch(`/api/pares/${parId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    fetchIngresos()
    setParSeleccionado(null)
  }

  const procesarDevolucion = async (parId: number) => {
    if (confirm('¿Está seguro de procesar la devolución? Esta acción no se puede deshacer.')) {
      const res = await fetch('/api/devoluciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parId })
      })
      
      if (res.ok) {
        const data = await res.json()
        const mensaje = data.yaRetirado 
          ? `Devolución procesada. Se descontará $${data.montoDevuelto.toFixed(2)} del dinero disponible.`
          : `Devolución procesada. Se eliminó $${data.montoDevuelto.toFixed(2)} del dinero pendiente de retiro.`
        alert(mensaje)
        fetchIngresos()
        setParSeleccionado(null)
      } else {
        alert('Error al procesar la devolución')
      }
    }
  }

  const ingresosFiltrados = ingresos.map(ingreso => ({
    ...ingreso,
    pares: ingreso.pares.filter(par => {
      const cumpleDeposito = !filtroDeposito || par.depositoId === filtroDeposito
      const cumpleCliente = !filtroCliente || par.clienteId === filtroCliente
      return cumpleDeposito && cumpleCliente
    })
  })).filter(ingreso => ingreso.pares.length > 0)

  const getParClass = (par: Par) => {
    let classes = 'par-item '
    
    // Detectar si es devolución
    const esDevolucion = par.comprador?.startsWith('DEVOLUCIÓN')
    
    if (esDevolucion) {
      classes += 'devolucion '
    } else {
      if (par.disponible) classes += 'disponible '
      else classes += 'no-disponible '
      
      const restante = Number(par.montoTotal || 0) - Number(par.montoAcumulado || 0)
      
      if (par.pagado === 'Completo') classes += 'pagado-completo '
      else if (par.pagado === 'Parcial') {
        if (restante === 0) classes += 'pagado-total '
        else classes += 'pagado-parcial '
      }
    }
    
    return classes
  }

  const ordenarPares = (pares: Par[]) => {
    return [...pares].sort((a, b) => {
      const restanteA = Number(a.montoTotal || 0) - Number(a.montoAcumulado || 0)
      const restanteB = Number(b.montoTotal || 0) - Number(b.montoAcumulado || 0)
      
      // Asignar prioridad: 1=disponibles, 2=no disponibles con restante, 3=no disponibles sin restante
      const prioridadA = a.disponible ? 1 : (restanteA > 0 ? 2 : 3)
      const prioridadB = b.disponible ? 1 : (restanteB > 0 ? 2 : 3)
      
      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB
      }
      
      return a.talle - b.talle
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        {ingresos.length > 0 && (
          <h1 className="text-2xl font-bold">
            {ingresos[0].modelo.marca.nombre} - {ingresos[0].modelo.nombre}
          </h1>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Registrar Nuevo Ingreso</h2>
        
        <div className="grid grid-cols-5 gap-4 mb-6">
          {paresIngreso.map(par => (
            <div key={par.talle} className="flex flex-col items-center">
              <label className="text-sm font-medium mb-1">Talle {par.talle}</label>
              <input
                type="number"
                min="0"
                value={par.cantidad}
                onChange={(e) => actualizarCantidad(par.talle, parseInt(e.target.value) || 0)}
                className="w-16 text-center border rounded px-2 py-1"
              />
            </div>
          ))}
        </div>
        
        <button
          onClick={registrarIngreso}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Registrar Ingreso
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2 items-center">
            <label className="font-medium">Depósito:</label>
            <select
              value={filtroDeposito || ''}
              onChange={(e) => setFiltroDeposito(e.target.value ? parseInt(e.target.value) : null)}
              className="border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {depositos.map(deposito => (
                <option key={deposito.id} value={deposito.id}>{deposito.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label className="font-medium">Cliente:</label>
            <select
              value={filtroCliente || ''}
              onChange={(e) => setFiltroCliente(e.target.value ? parseInt(e.target.value) : null)}
              className="border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {ingresosFiltrados.map(ingreso => (
          <div key={ingreso.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Ingreso del {new Date(ingreso.fechaIngreso).toLocaleDateString()}
              </h3>
              <button
                onClick={() => eliminarIngreso(
                  ingreso.id, 
                  new Date(ingreso.fechaIngreso).toLocaleDateString(),
                  ingreso.pares.length
                )}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Eliminar Ingreso
              </button>
            </div>
            
            <div className="grid-container">
              {ordenarPares(ingreso.pares).map(par => (
                <div
                  key={par.id}
                  className={getParClass(par)}
                  onClick={() => setParSeleccionado(par)}
                  title={`Talle ${par.talle} - ${par.deposito.nombre} - ${par.disponible ? 'Disponible' : 'No disponible'} - ${par.pagado}${par.pagado === 'Parcial' && par.montoTotal && par.montoPagado ? ` (Pagado: $${Number(par.montoPagado).toFixed(2)} de $${Number(par.montoTotal).toFixed(2)})` : ''}${par.comprador ? ` - ${par.comprador}` : ''}`}
                >
                  <div className="text-center w-full">
                    <div className="font-bold text-sm">{par.talle}</div>
                    {par.pagado === 'Parcial' && (
                      <div className="text-xs mt-1 w-full overflow-hidden">
                        {par.comprador && (
                          <div className="truncate font-medium">
                            {par.comprador.split(' ')[0]}
                          </div>
                        )}
                        {par.montoTotal && (
                          <div className={`text-xs ${
                            (Number(par.montoTotal) - Number(par.montoAcumulado || 0)) === 0 
                              ? 'text-red-700 font-bold' 
                              : 'text-gray-600'
                          }`}>
                            ${(Number(par.montoTotal) - Number(par.montoAcumulado || 0)).toFixed(0)} rest.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {parSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className={`text-lg font-medium mb-4 ${
              parSeleccionado.comprador?.startsWith('DEVOLUCIÓN') ? 'text-gray-600' : ''
            }`}>
              {parSeleccionado.comprador?.startsWith('DEVOLUCIÓN') ? 'Ver Devolución' : 'Editar Par'} - Talle {parSeleccionado.talle}
            </h3>
            
            {/* Resumen actual para pagos parciales */}
            {parSeleccionado.pagado === 'Parcial' && parSeleccionado.montoTotal && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">Estado Actual:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">${Number(parSeleccionado.montoTotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restante:</span>
                    <span className="font-medium text-blue-600">
                      ${(Number(parSeleccionado.montoTotal) - Number(parSeleccionado.montoAcumulado || 0)).toFixed(2)}
                    </span>
                  </div>
                  {Number(parSeleccionado.montoAcumulado || 0) > 0 && (
                    <div className="flex justify-between border-t pt-1">
                      <span>Ya pagado:</span>
                      <span className="font-medium text-red-600">
                        ${Number(parSeleccionado.montoAcumulado).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Depósito</label>
                  <select
                    value={parSeleccionado.depositoId}
                    onChange={(e) => setParSeleccionado({...parSeleccionado, depositoId: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                  >
                    {depositos.map(deposito => (
                      <option key={deposito.id} value={deposito.id}>{deposito.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Estado actual</label>
                  <div className={`w-full border rounded px-3 py-2 ${
                    parSeleccionado.disponible ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {parSeleccionado.disponible ? 'Disponible' : 'No disponible'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Pago</label>
                  <select
                    value={parSeleccionado.pagado}
                    onChange={(e) => setParSeleccionado({...parSeleccionado, pagado: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="No pagado">No pagado</option>
                    <option value="Parcial">Parcial</option>
                    <option value="Completo">Completo</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                
                {(parSeleccionado.pagado === 'Parcial' || parSeleccionado.pagado === 'Completo') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cliente *</label>
                      <select
                        value={parSeleccionado.clienteId || ''}
                        onChange={(e) => {
                          const clienteId = e.target.value ? parseInt(e.target.value) : undefined
                          const cliente = clientes.find(c => c.id === clienteId)
                          setParSeleccionado({
                            ...parSeleccionado, 
                            clienteId,
                            comprador: cliente?.nombre || ''
                          })
                        }}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="">Seleccionar cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fecha de venta (opcional)</label>
                      <input
                        type="date"
                        value={parSeleccionado.fechaVenta ? parSeleccionado.fechaVenta.split('T')[0] : ''}
                        onChange={(e) => setParSeleccionado({...parSeleccionado, fechaVenta: e.target.value ? e.target.value + 'T00:00:00.000Z' : undefined})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-4 space-y-4">
              
              {parSeleccionado.pagado === 'Completo' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Monto total cobrado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={parSeleccionado.montoTotal || ''}
                    onChange={(e) => setParSeleccionado({...parSeleccionado, montoTotal: parseFloat(e.target.value) || undefined})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
              
              {parSeleccionado.pagado === 'Parcial' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Monto total</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={parSeleccionado.montoTotal || ''}
                      onChange={(e) => setParSeleccionado({...parSeleccionado, montoTotal: parseFloat(e.target.value) || undefined})}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nuevo pago 
                      {parSeleccionado.montoTotal && (
                        <span className="text-xs text-gray-500">
                          (máx: ${(Number(parSeleccionado.montoTotal) - Number(parSeleccionado.montoAcumulado || 0)).toFixed(2)})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={parSeleccionado.montoTotal ? Number(parSeleccionado.montoTotal) - Number(parSeleccionado.montoAcumulado || 0) : undefined}
                      value={parSeleccionado.montoPagado || ''}
                      onChange={(e) => {
                        const valor = parseFloat(e.target.value) || 0
                        const restante = Number(parSeleccionado.montoTotal || 0) - Number(parSeleccionado.montoAcumulado || 0)
                        const montoPagado = valor > restante ? restante : valor
                        setParSeleccionado({...parSeleccionado, montoPagado: montoPagado || undefined})
                      }}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Ingrese el monto del nuevo pago"
                    />
                    {parSeleccionado.montoTotal && parSeleccionado.montoPagado && (
                      <div className="mt-1 text-sm">
                        <span className="text-gray-600">Quedaría restante: </span>
                        <span className="font-medium text-blue-600">
                          ${(Number(parSeleccionado.montoTotal) - Number(parSeleccionado.montoAcumulado || 0) - Number(parSeleccionado.montoPagado)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Botones solo si no es devolución */}
            {!parSeleccionado.comprador?.startsWith('DEVOLUCIÓN') ? (
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    if ((parSeleccionado.pagado === 'Parcial' || parSeleccionado.pagado === 'Completo') && !parSeleccionado.clienteId) {
                      alert('Debe seleccionar un cliente para registrar el pago')
                      return
                    }
                    actualizarPar(parSeleccionado.id, parSeleccionado)
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Guardar
                </button>
                
                {!parSeleccionado.disponible && (
                  <button
                    onClick={() => procesarDevolucion(parSeleccionado.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Devolver
                  </button>
                )}
                
                <button
                  onClick={() => setParSeleccionado(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setParSeleccionado(null)}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}