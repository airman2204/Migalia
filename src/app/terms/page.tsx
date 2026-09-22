import React from 'react';

export const metadata = {
  title: 'Condiciones del Servicio | Migalia Bakery',
  description: 'Términos y Condiciones del Servicio de Migalia Bakery.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#221F1D] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-[#E6DFD5] shadow-xs space-y-8">
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-700 uppercase">Términos Legales</span>
          <h1 className="text-3xl font-bold font-serif text-[#221F1D] mt-1">Condiciones del Servicio</h1>
          <p className="text-xs text-stone-400 mt-2">Última actualización: Septiembre 2026 · Migalia Bakery</p>
        </div>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-lg font-bold font-serif text-[#221F1D]">1. Aceptación de los Términos</h2>
          <p>
            Al comunicarse con <strong>Migalia Bakery</strong> a través de nuestros canales oficiales (sitio web{' '}
            <a href="https://www.migaliabakery.com" className="text-amber-800 underline">
              https://www.migaliabakery.com
            </a>
            , cuenta de Instagram <strong>@migaliabky</strong> o mensajería de atención a clientes), el usuario acepta las presentes
            Condiciones del Servicio.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-lg font-bold font-serif text-[#221F1D]">2. Servicio de Atención al Cliente y Cotizaciones</h2>
          <p>
            Nuestros canales digitales están destinados a brindar información, atención al cliente, resolución de dudas sobre nuestro
            menú y productos de repostería artesanal (incluyendo Cookie Fries, pasteles y postres de autor), y recepción de pedidos o
            cotizaciones personalizadas.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-lg font-bold font-serif text-[#221F1D]">3. Propiedad Intelectual</h2>
          <p>
            Todo el contenido, marcas, recetas, diseños visuales y logotipos asociados a <strong>MÍGALIA • Boutique Bakery</strong>{' '}
            son propiedad de sus titulares y están protegidos por las leyes de propiedad industrial aplicables.
          </p>
        </section>

        <section className="space-y-3 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-lg font-bold font-serif text-[#221F1D]">4. Contacto Oficial</h2>
          <p>
            Para cualquier consulta sobre estos términos o el servicio, puedes escribirnos directamente a{' '}
            <strong>contacto@migaliabakery.com</strong> o a través de nuestra cuenta de Instagram{' '}
            <a href="https://instagram.com/migaliabky" target="_blank" rel="noopener noreferrer" className="text-amber-800 underline">
              @migaliabky
            </a>.
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
