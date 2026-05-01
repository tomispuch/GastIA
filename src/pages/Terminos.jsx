import { Link } from 'react-router-dom'

const SECCIONES = [
  {
    titulo: '1. Aceptación de términos',
    contenido: 'Al registrarte y utilizar GastIA, aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no utilices la plataforma.',
  },
  {
    titulo: '2. Descripción del servicio',
    contenido: 'GastIA es una herramienta de seguimiento personal de finanzas que te permite registrar gastos, ingresos, transferencias entre cuentas y establecer presupuestos. La aplicación es desarrollada y mantenida por TRS Automatizaciones.',
  },
  {
    titulo: '3. No es asesoramiento financiero',
    contenido: 'GastIA es únicamente una herramienta de organización personal. El contenido, las métricas y los reportes que genera la aplicación no constituyen asesoramiento financiero, contable, impositivo ni de inversión. Las decisiones financieras son responsabilidad exclusiva del usuario.',
  },
  {
    titulo: '4. Cuenta y responsabilidad del usuario',
    contenido: 'Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta. Debés notificarnos inmediatamente ante cualquier uso no autorizado de tu cuenta. TRS Automatizaciones no se responsabiliza por pérdidas derivadas del uso no autorizado de tu cuenta.',
  },
  {
    titulo: '5. Privacidad y datos',
    contenido: 'Tus datos financieros se almacenan de forma segura en Supabase con cifrado en tránsito y en reposo. No compartimos ni vendemos tu información personal ni financiera a terceros. Solo utilizamos los datos para brindar el servicio. Podés solicitar la eliminación de tu cuenta y datos en cualquier momento contactándonos.',
  },
  {
    titulo: '6. Disponibilidad del servicio',
    contenido: 'Nos esforzamos por mantener GastIA disponible en todo momento, pero no garantizamos disponibilidad ininterrumpida. Podemos realizar mantenimientos programados o tener interrupciones imprevistas. No nos responsabilizamos por pérdidas ocasionadas por indisponibilidad del servicio.',
  },
  {
    titulo: '7. Limitación de responsabilidad',
    contenido: 'TRS Automatizaciones no será responsable por ningún daño directo, indirecto, incidental o consecuente derivado del uso o la imposibilidad de usar GastIA, incluyendo pérdidas de datos o decisiones tomadas en base a la información mostrada en la plataforma.',
  },
  {
    titulo: '8. Modificaciones',
    contenido: 'Podemos actualizar estos Términos y Condiciones en cualquier momento. Notificaremos los cambios significativos. El uso continuado de GastIA tras los cambios implica la aceptación de los nuevos términos.',
  },
  {
    titulo: '9. Contacto',
    contenido: 'Para consultas, reclamos o solicitudes relacionadas con estos términos, podés contactarnos en trsautomatizaciones@gmail.com.',
  },
]

export default function Terminos() {
  return (
    <div className="min-h-screen" style={{ background: '#D6D7D7' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link to="/login" className="text-xs text-[#FA133A] font-semibold mb-4 inline-block hover:underline">
            ← Volver
          </Link>
          <h1 className="text-3xl font-black text-[#070708] leading-tight">Términos y<br />Condiciones</h1>
          <p className="text-[#070708]/50 text-sm mt-2">GastIA · TRS Automatizaciones · Última actualización: Mayo 2025</p>
        </div>

        {/* Introducción */}
        <div className="bg-white/60 rounded-2xl p-5 mb-4 border border-white/80">
          <p className="text-[#070708]/70 text-sm leading-relaxed">
            Estos Términos y Condiciones regulan el uso de <strong>GastIA</strong>, la aplicación de finanzas personales desarrollada por <strong>TRS Automatizaciones</strong>. Leelos detenidamente antes de usar la plataforma.
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-3">
          {SECCIONES.map(s => (
            <div key={s.titulo} className="bg-white/60 rounded-2xl p-5 border border-white/80">
              <h2 className="font-bold text-[#070708] text-sm mb-2">{s.titulo}</h2>
              <p className="text-[#070708]/60 text-sm leading-relaxed">{s.contenido}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-[#070708]/40 text-xs">© 2025 TRS Automatizaciones — Menos tareas, más resultados.</p>
          <a href="mailto:trsautomatizaciones@gmail.com" className="text-xs text-[#FA133A] hover:underline">
            trsautomatizaciones@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}
