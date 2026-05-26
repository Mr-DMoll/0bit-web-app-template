'use client';

import { useEffect, useState } from 'react';

/**
 * 🏛 AGENCY BLUEPRINT: Generic Landing Page
 * This page serves as a health-check dashboard for the MERN stack.
 * It validates that the Frontend can communicate with the AWS App Runner Backend.
 */
export default function LandingPage() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  
  // 🚀 Logic: Use the Vercel Environment Variable, or default to local development port
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // 🛠 PATH ALIGNMENT: 
        // Your Express server uses: app.use("/api/v1/system", systemRoutes);
        // So the health check must point to exactly that versioned path.
        const response = await fetch(`${apiUrl}/api/v1/system/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        console.error('Handshake failed:', error);
        setStatus('offline');
      }
    };

    checkHealth();
  }, [apiUrl]);

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <header>
          <h1 style={styles.title}>Project O-Bit pronounce O bit</h1>
          <p style={styles.subtitle}>Full-Stack Agency Blueprint</p>
        </header>
        
        <section style={styles.statusBox}>
          <span style={styles.label}>Backend Connection:</span>
          {status === 'loading' && <span style={styles.loading}>⏳ Initializing...</span>}
          {status === 'online' && <span style={styles.online}>🟢 Online</span>}
          {status === 'offline' && <span style={styles.offline}>❌ Offline</span>}
        </section>

        <footer style={styles.info}>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>API Endpoint:</strong></p>
          <code style={styles.code}>{apiUrl}/api/v1/system/health</code>
          
          <div style={styles.sopNote}>
            <small>💡 SOP: Ensure NEXT_PUBLIC_API_URL is set in Vercel for production.</small>
          </div>
        </footer>
      </div>
    </main>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  card: {
    padding: '2.5rem',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
    width: '100%',
    maxWidth: '450px',
    border: '1px solid #e2e8f0',
  },
  title: { 
    margin: 0, 
    fontSize: '28px', 
    fontWeight: '800', 
    color: '#1e293b',
    letterSpacing: '-0.025em'
  },
  subtitle: { 
    margin: '8px 0 32px', 
    color: '#64748b', 
    fontSize: '15px',
    fontWeight: '500'
  },
  statusBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #cbd5e1',
  },
  label: { fontWeight: '600' as const, color: '#334155' },
  online: { color: '#15803d', fontWeight: '700' as const },
  offline: { color: '#b91c1c', fontWeight: '700' as const },
  loading: { color: '#b45309' },
  info: { 
    textAlign: 'left' as const, 
    fontSize: '13px', 
    color: '#475569',
    lineHeight: '1.6'
  },
  code: { 
    display: 'block',
    marginTop: '4px',
    backgroundColor: '#1e293b', 
    color: '#f8fafc',
    padding: '8px 12px', 
    borderRadius: '6px',
    fontSize: '11px',
    wordBreak: 'break-all' as const,
    fontFamily: 'monospace'
  },
  sopNote: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #f1f5f9',
    color: '#94a3b8',
    fontStyle: 'italic'
  }
};