import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

const CAMPOS = [
  { key: 'fecha',      label: 'Fecha',      required: true  },
  { key: 'monto',      label: 'Monto',      required: true  },
  { key: 'categoria',  label: 'Categoría',  required: false },
  { key: 'descripcion',label: 'Descripción',required: false },
]

// Mock para desarrollo sin webhook configurado
const MOCK_RESPONSE = {
  confianza: 'alta',
  mapeo: { fecha: 'Fecha', monto: 'Importe', categoria: 'Rubro', descripcion: 'Concepto' },
  columnas_disponibles: ['Fecha', 'Importe', 'Rubro', 'Concepto', 'Cuenta'],
  preview: [
    { fecha: '15/01/2025', monto: '1500', categoria: 'Comida y bebida', descripcion: 'Almuerzo' },
    { fecha: '16/01/2025', monto: '3200', categoria: 'Transporte',       descripcion: 'SUBE enero'  },
    { fecha: '17/01/2025', monto: '850',  categoria: 'Entretenimiento',  descripcion: 'Netflix'     },
  ],
  total_filas: 87,
  raw_data: [
    { Fecha: '15/01/2025', Importe: '1500', Rubro: 'Comida y bebida', Concepto: 'Almuerzo',    Cuenta: 'Efectivo' },
    { Fecha: '16/01/2025', Importe: '3200', Rubro: 'Transporte',       Concepto: 'SUBE enero', Cuenta: 'Débito'   },
    { Fecha: '17/01/2025', Importe: '850',  Rubro: 'Entretenimiento',  Concepto: 'Netflix',    Cuenta: 'Débito'   },
  ],
}

export default function ImportarExcel({ onClose, onImportComplete }) {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [step, setStep] = useState(1)

  // Paso 1
  const [file, setFile]           = useState(null)
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Paso 2
  const [mappingData, setMappingData] = useState(null)
  const [mapeoLocal, setMapeoLocal]   = useState({})
  const [importing, setImporting]     = useState(false)
  const [importError, setImportError] = useState('')

  // Paso 3
  const [result, setResult] = useState(null)

  // ─── Paso 1: selección y upload ──────────────────────────────────────────

  function handleFileSelect(f) {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext)) {
      setUploadError('Solo se aceptan archivos .xlsx o .xls')
      return
    }
    setUploadError('')
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setUploadError('')

    const webhookUrl = import.meta.env.VITE_N8N_IMPORT_WEBHOOK_URL
    const isMock = !webhookUrl || webhookUrl.includes('placeholder')

    try {
      let data
      if (isMock) {
        await new Promise(r => setTimeout(r, 1500))
        data = MOCK_RESPONSE
      } else {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('user_id', user.id)
        const res = await fetch(webhookUrl, { method: 'POST', body: formData })
        if (!res.ok) throw new Error('server_error')
        data = await res.json()
      }
      setMappingData(data)
      setMapeoLocal(data.mapeo || {})
      setStep(2)
    } catch {
      setUploadError('No se pudo analizar el archivo. Verificá que sea un Excel válido e intentá de nuevo.')
    }
    setUploading(false)
  }

  // ─── Paso 2: preview reactivo al cambio de mapeo ─────────────────────────

  function getPreviewRows() {
    if (!mappingData) return []
    // Si tenemos raw_data, recalculamos live según mapeoLocal
    if (mappingData.raw_data?.length) {
      return mappingData.raw_data.slice(0, 3).map(row => ({
        fecha:       mapeoLocal.fecha       ? (row[mapeoLocal.fecha]       ?? '—') : '—',
        monto:       mapeoLocal.monto       ? (row[mapeoLocal.monto]       ?? '—') : '—',
        categoria:   mapeoLocal.categoria   ? (row[mapeoLocal.categoria]   ?? '—') : '—',
        descripcion: mapeoLocal.descripcion ? (row[mapeoLocal.descripcion] ?? '—') : '—',
      }))
    }
    return mappingData.preview || []
  }

  async function handleConfirm() {
    if (!mapeoLocal.fecha || !mapeoLocal.monto) return
    setImporting(true)
    setImportError('')

    const confirmUrl = import.meta.env.VITE_N8N_IMPORT_CONFIRM_URL
    const isMock = !confirmUrl || confirmUrl.includes('placeholder')

    try {
      let data
      if (isMock) {
        await new Promise(r => setTimeout(r, 2000))
        const total = Math.min(mappingData.total_filas, 500)
        data = { importados: total - 2, errores: 2, filas_con_error: [
          { fila_numero: 12, razon_error: 'Monto no parseable', datos_originales: {} },
          { fila_numero: 34, razon_error: 'Fecha inválida',     datos_originales: {} },
        ]}
      } else {
        const res = await fetch(confirmUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            mapeo_confirmado: mapeoLocal,
            raw_data: mappingData.raw_data,
          }),
        })
        if (!res.ok) throw new Error('server_error')
        data = await res.json()
      }
      setResult(data)
      setStep(3)
    } catch {
      setImportError('Error al importar. Intentá de nuevo.')
    }
    setImporting(false)
  }

  function downloadErrorReport() {
    const lines = [
      'Fila,Razón del error,Datos originales',
      ...(result.filas_con_error || []).map(e =>
        `${e.fila_numero},"${e.razon_error}","${JSON.stringify(e.datos_originales).replace(/"/g, '""')}"`
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'errores_importacion.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  const previewRows = step === 2 ? getPreviewRows() : []
  const filasCap    = mappingData ? Math.min(mappingData.total_filas, 500) : 0

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 flex items-end md:items-center justify-center z-50 px-4 py-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="card-dark w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <h2 className="text-white font-bold text-base">Importar desde Excel</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              {[1, 2, 3].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    s < step  ? 'bg-green-500/25 text-green-400' :
                    s === step ? 'bg-[#FA133A] text-white' :
                                 'bg-white/10 text-white/30'
                  }`}>
                    {s < step ? '✓' : s}
                  </div>
                  <span className={`text-xs hidden sm:inline transition-colors ${
                    s === step ? 'text-white' : 'text-white/30'
                  }`}>
                    {s === 1 ? 'Subir' : s === 2 ? 'Confirmar mapeo' : 'Resultado'}
                  </span>
                  {i < 2 && <span className="text-white/15 text-xs">›</span>}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors text-sm flex-shrink-0">
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 p-5">

          {/* ── PASO 1 ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragging ? '#FA133A' : file ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)',
                  background:  dragging ? 'rgba(250,19,58,0.07)' : file ? 'rgba(34,197,94,0.05)' : 'transparent',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={e => handleFileSelect(e.target.files[0])}
                />
                {file ? (
                  <>
                    <div className="text-4xl mb-3">📊</div>
                    <p className="text-white font-semibold text-sm">{file.name}</p>
                    <p className="text-white/40 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB · Hacé click para cambiar</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-3">📂</div>
                    <p className="text-white font-semibold text-sm">Arrastrá tu archivo acá</p>
                    <p className="text-white/40 text-xs mt-2">o hacé click para seleccionarlo</p>
                    <p className="text-white/20 text-xs mt-3">Formatos: .xlsx y .xls · Máximo 500 filas</p>
                  </>
                )}
              </div>

              {uploadError && (
                <p className="text-xs text-[#FA133A] bg-[#FA133A]/10 px-3 py-2 rounded-xl">{uploadError}</p>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn-red w-full py-3 text-sm"
              >
                {uploading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analizando tu archivo…
                    </span>
                  : 'Analizar con IA →'
                }
              </button>
            </div>
          )}

          {/* ── PASO 2 ─────────────────────────────────────────── */}
          {step === 2 && mappingData && (
            <div className="space-y-5">

              {/* Banner de confianza */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{
                background: mappingData.confianza === 'alta' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${mappingData.confianza === 'alta' ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
              }}>
                <span className="text-base flex-shrink-0">{mappingData.confianza === 'alta' ? '✅' : '⚠️'}</span>
                <p className="text-xs leading-relaxed" style={{ color: mappingData.confianza === 'alta' ? '#4ade80' : '#fbbf24' }}>
                  {mappingData.confianza === 'alta'
                    ? 'Detectamos la estructura correctamente. Confirmá el mapeo para continuar.'
                    : 'No pudimos identificar algunas columnas con certeza. Revisá el mapeo antes de continuar.'
                  }
                </p>
              </div>

              {/* Advertencia > 500 filas */}
              {mappingData.total_filas > 500 && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <p className="text-xs text-yellow-400 leading-relaxed">
                    Tu archivo tiene <strong>{mappingData.total_filas}</strong> filas. Solo se importarán las primeras 500.
                  </p>
                </div>
              )}

              {/* Tabla de mapeo */}
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
                  Columnas del Excel → campos de GastIA
                </p>
                <div className="space-y-2">
                  {CAMPOS.map(campo => (
                    <div key={campo.key} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="w-24 flex-shrink-0 flex items-center gap-1">
                        <span className="text-white text-sm font-semibold">{campo.label}</span>
                        {campo.required && <span className="text-[#FA133A] text-xs leading-none">*</span>}
                      </div>
                      <span className="text-white/20 text-xs flex-shrink-0">→</span>
                      <select
                        value={mapeoLocal[campo.key] || ''}
                        onChange={e => setMapeoLocal(prev => ({ ...prev, [campo.key]: e.target.value || null }))}
                        className="select-dark flex-1 text-sm"
                      >
                        <option value="">— No importar —</option>
                        {mappingData.columnas_disponibles.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <p className="text-white/25 text-xs mt-2">* Obligatorio para importar</p>
              </div>

              {/* Preview reactivo */}
              {previewRows.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
                    Vista previa
                  </p>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                            {CAMPOS.map(c => (
                              <th key={c.key} className="text-left px-3 py-2.5 text-white/40 font-semibold uppercase tracking-wider whitespace-nowrap">
                                {c.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row, i) => (
                            <tr key={i} style={i < previewRows.length - 1 ? { borderBottom: '1px solid rgba(255,255,255,0.05)' } : {}}>
                              <td className="px-3 py-2.5 text-white/70 whitespace-nowrap">{row.fecha}</td>
                              <td className="px-3 py-2.5 text-white/70 whitespace-nowrap">{row.monto}</td>
                              <td className="px-3 py-2.5 text-white/70 whitespace-nowrap">{row.categoria}</td>
                              <td className="px-3 py-2.5 text-white/70 max-w-[160px] truncate">{row.descripcion}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-white/25 text-xs mt-2">
                    {filasCap} {filasCap === 1 ? 'fila' : 'filas'} a importar
                    {mappingData.total_filas > 500 && ` (de ${mappingData.total_filas} totales)`}
                  </p>
                </div>
              )}

              {importError && (
                <p className="text-xs text-[#FA133A] bg-[#FA133A]/10 px-3 py-2 rounded-xl">{importError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setStep(1); setImportError('') }}
                  className="flex-1 py-3 text-sm font-semibold rounded-xl transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  ← Volver
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={importing || !mapeoLocal.fecha || !mapeoLocal.monto}
                  className="flex-1 btn-red py-3 text-sm"
                >
                  {importing
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importando…
                      </span>
                    : `Confirmar e importar ${filasCap} filas →`
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3 ─────────────────────────────────────────── */}
          {step === 3 && result && (
            <div className="space-y-6 text-center py-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto"
                style={{ background: result.errores === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)' }}>
                {result.errores === 0 ? '✅' : '⚠️'}
              </div>

              <div>
                <p className="text-white font-black text-2xl">
                  {result.importados} {result.importados === 1 ? 'gasto' : 'gastos'} importados
                </p>
                {result.errores > 0 && (
                  <p className="text-yellow-400 text-sm mt-1.5">
                    {result.errores} {result.errores === 1 ? 'fila no pudo importarse' : 'filas no pudieron importarse'}
                  </p>
                )}
              </div>

              {result.errores > 0 && result.filas_con_error?.length > 0 && (
                <button
                  onClick={downloadErrorReport}
                  className="text-xs underline transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
                >
                  Descargar reporte de errores (.csv)
                </button>
              )}

              <button
                onClick={() => { onImportComplete(); onClose() }}
                className="btn-red w-full py-3 text-sm"
              >
                Ver mis gastos →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
