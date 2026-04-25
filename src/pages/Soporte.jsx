import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const TEMAS = [
  'No puedo registrar un movimiento',
  'Error en el dashboard o gráficos',
  'Problema con mis cuentas',
  'No puedo iniciar sesión',
  'Quiero eliminar mi cuenta',
  'Otro',
]

export default function Soporte() {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [tema, setTema] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!tema || !descripcion.trim()) return
    setError('')
    setLoading(true)

    const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT

    if (endpoint && !endpoint.includes('placeholder')) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email, tema, descripcion }),
        })
        if (res.ok) {
          setEnviado(true)
        } else {
          setError('No se pudo enviar. Intentá de nuevo.')
        }
      } catch {
        setError('Error de conexión. Intentá de nuevo.')
      }
    } else {
      const asunto = encodeURIComponent(`[GastIA Soporte] ${tema}`)
      const cuerpo = encodeURIComponent(
        `Email del usuario: ${email}\n\nTema: ${tema}\n\nDescripción:\n${descripcion}`
      )
      window.location.href = `mailto:trsautomatizaciones@gmail.com?subject=${asunto}&body=${cuerpo}`
      setEnviado(true)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

      <div>
        <p className="text-[#070708]/50 text-sm">Ayuda</p>
        <h1 className="text-3xl font-black text-[#070708] leading-tight">Soporte</h1>
      </div>

      {enviado ? (
        <div className="card-dark p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: 'rgba(250,19,58,0.12)' }}>
            ✅
          </div>
          <div>
            <p className="text-white font-bold text-lg mb-1">Mensaje enviado</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Recibimos tu consulta. Te respondemos a <span className="text-white/80">{email}</span> a la brevedad.
            </p>
          </div>
          <button
            onClick={() => { setEnviado(false); setTema(''); setDescripcion('') }}
            className="btn-red px-6 py-2.5 text-sm mt-2"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <div className="card-dark p-6 space-y-4">
          <p className="text-white/60 text-sm leading-relaxed">
            Contanos qué está pasando. Te respondemos lo antes posible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wide">
                Tu email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-dark"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wide">
                Tema
              </label>
              <select
                required
                value={tema}
                onChange={e => setTema(e.target.value)}
                className="select-dark w-full"
              >
                <option value="">Seleccioná un tema...</option>
                {TEMAS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wide">
                Descripción del problema
              </label>
              <textarea
                required
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={5}
                maxLength={1000}
                className="input-dark resize-none"
                placeholder="Describí lo que pasó con el mayor detalle posible. ¿Qué intentabas hacer? ¿Qué viste en pantalla?"
              />
            </div>

            {error && (
              <p className="text-xs text-[#FA133A] bg-[#FA133A]/10 px-3 py-2 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !tema || !descripcion.trim()}
              className="btn-red w-full py-3 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : 'Enviar consulta'}
            </button>

          </form>
        </div>
      )}

      <div className="card-dark p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: 'rgba(250,19,58,0.1)' }}>
          📧
        </div>
        <div>
          <p className="text-white/40 text-xs">También podés escribirnos directo</p>
          <a href="mailto:trsautomatizaciones@gmail.com"
            className="text-sm font-semibold text-white hover:text-[#FA133A] transition-colors">
            trsautomatizaciones@gmail.com
          </a>
        </div>
      </div>

    </div>
  )
}
