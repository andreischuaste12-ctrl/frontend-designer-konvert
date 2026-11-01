import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(true);
  return <main className="mx-auto max-w-2xl p-6 font-sans">
    <h1 className="text-3xl font-bold">Agenda fictícia</h1>
    <p className="mt-4">Encontre um compromisso da equipe.</p>
    <form className="mt-6 flex gap-2" onSubmit={event => { event.preventDefault(); setSearched(true); }}>
      <input className="border p-2" placeholder="Buscar" value={query} onChange={event => setQuery(event.target.value)} />
      <button className="rounded bg-blue-700 p-2 text-white">Pesquisar</button>
    </form>
    {searched && <p className="mt-5">Nenhum resultado.</p>}
    <a className="mt-6 block text-blue-700 underline" href="#help">Ajuda para usar a agenda</a>
    <section id="help" className="mt-6"><h2 className="text-xl font-bold">Ajuda</h2><p>Use a busca para localizar compromissos.</p></section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
