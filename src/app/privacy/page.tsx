import React from 'react';

export const metadata = {
  title: 'Aviso de Privacidad | Migalia Bakery',
  description: 'Aviso de Privacidad y Términos de Servicio de Migalia Bakery.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#221F1D] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-[#E6DFD5] shadow-xs space-y-8">
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">Aviso Legal</span>
          <h1 className="text-3xl font-bold font-serif text-[#221F1D] mt-1">Política de Privacidad</h1>
          <p className="text-xs text-stone-400 mt-2">Última actualización: Septiembre 2026 · Migalia Bakery</p>
        </div>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-lg font-bold font-serif text-[#221F1D]">1. Responsable del Tratamiento de Datos</h2>
          <p>
            <strong>Migalia Bakery</strong>, con sitio web oficial en{' '}
            <a href="https://www.migaliabakery.com" className="text-amber-800 underline">
              https://www.migaliabakery.com
            </a>
            , es responsable del tratamiento de los datos personales recabados a través de nuestros canales oficiales
            de atención al cliente, incluyendo mensajería directa de Instagram y Facebook Messenger.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-lg font-bold font-serif text-[#221F1D]">2. Datos Personales que Recabamos</h2>
          <p>Los datos que podemos recopilar para gestionar pedidos, cotizaciones y entregas son exclusivamente:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nombre del cliente o identificador de usuario en redes sociales (@usuario).</li>
            <li>Detalles y especificaciones de pedidos de repostería artesanal y cotización de eventos.</li>
            <li>Dirección de entrega y número de teléfono de contacto (cuando aplique para envíos).</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-lg font-bold font-serif text-[#221F1D]">3. Finalidad del Uso de la Información</h2>
          <p>La información recopilada se utiliza estrictamente para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Responder a solicitudes de información, cotizaciones y dudas sobre nuestros productos.</li>
            <li>Confirmar, programar y elaborar pedidos en nuestro taller de repostería.</li>
            <li>Coordinar la entrega o recolección de los productos en nuestra boutique.</li>
          </ul>
          <p className="text-xs text-stone-500 italic">
            Migalia Bakery nunca vende, renta ni transfiere sus datos personales a terceros con fines publicitarios o ajenos al servicio.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-lg font-bold font-serif text-[#221F1D]">4. Derechos de Acceso, Rectificación y Eliminación</h2>
          <p>
            Cualquier usuario puede solicitar en cualquier momento la consulta o eliminación definitiva de sus datos personales
            de nuestro sistema administrativo enviando un mensaje directo a nuestra cuenta oficial{' '}
            <a href="https://instagram.com/migaliab" target="_blank" rel="noopener noreferrer" className="text-amber-800 underline">
              @migaliab
            </a>{' '}
            o un correo a <strong>contacto@migaliabakery.com</strong>.
          </p>
        </section>

        <div className="pt-6 border-t border-stone-150 flex items-center justify-between text-xs text-stone-400">
          <span>Migalia Bakery · Alta Repostería Artesanal</span>
          <a href="/" className="text-stone-600 hover:text-stone-900 font-medium">Volver al Inicio &rarr;</a>
        </div>
      </div>
    </div>
  );
}
