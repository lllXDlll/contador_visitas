import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Activity } from 'lucide-react';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = rawApiUrl.trim().replace(/\/+$/, '');

export default function App() {
  const [totalVisits, setTotalVisits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const effectRan = useRef(false);

  // Initial load: Register visit then fetch total
  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    async function initVisit() {
      setLoading(true);
      setError(null);
      try {
        // 1. Register visit
        await fetch(`${API_BASE_URL}/api/visits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        // 2. Fetch updated total visits
        const res = await fetch(`${API_BASE_URL}/api/visits`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setTotalVisits(data.total);
      } catch (err) {
        console.error('Error during initial visit registration:', err);
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    }

    initVisit();
  }, []);

  // Update button handler: ONLY fetch GET /api/visits (do NOT post visit)
  const handleUpdate = async () => {
    setUpdating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/visits`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTotalVisits(data.total);
    } catch (err) {
      console.error('Error fetching total visits:', err);
      setError('Error al actualizar las estadísticas.');
    } finally {
      setUpdating(false);
    }
  };

  const formattedVisits = totalVisits !== null ? totalVisits.toLocaleString('es-ES') : '---';

  return (
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="title">
            <span class="badge-dot"></span>
            Contador de Visitas
          </div>
        </div>

        <div class="counter-section">
          <div class="counter-number">
            {loading ? '...' : formattedVisits}
          </div>
          <div class="counter-label">visitas totales</div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button
          class="btn-update"
          onClick={handleUpdate}
          disabled={loading || updating}
          id="btn-update-visits"
        >
          <RefreshCw className={updating ? 'spin' : ''} size={18} />
          {updating ? 'Actualizando...' : 'Actualizar'}
        </button>

        <div class="footer-info">
          PostgreSQL & Redis Stateless Architecture
        </div>
      </div>
    </div>
  );
}
