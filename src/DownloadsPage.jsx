import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  FileText,
  Laptop,
  LoaderCircle,
  LogIn,
  LogOut,
  Monitor,
  ShieldCheck
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import './downloads.css';

const OWNER_EMAIL = 'ramanujan.mk@musicloudstudio.com';

const installerCopy = {
  'mac-apple-silicon': {
    title: 'Mac - Apple Silicon',
    detail: 'For M1, M2, M3, M4, and newer Apple chips',
    formats: 'Audio Unit + VST3',
    icon: Laptop
  },
  'mac-intel': {
    title: 'Mac - Intel',
    detail: 'For Intel-based Mac computers',
    formats: 'Audio Unit + VST3',
    icon: Laptop
  },
  'windows-x64': {
    title: 'Windows - 64 bit',
    detail: 'For Windows 10 and 11 x64 systems',
    formats: 'VST3',
    icon: Monitor
  },
  'user-guide': {
    title: 'Beta user guide',
    detail: 'Installation, BPM, controls, export, and testing',
    formats: 'PDF',
    icon: FileText
  }
};

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (!bytes) return '';
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}

async function authorizedFetch(path, session, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${session.access_token}`
    }
  });
}

async function responsePayload(response) {
  const contentType = String(response.headers.get('content-type') || '');
  if (!contentType.includes('application/json')) {
    throw new Error('Downloads are being prepared. Please check again shortly.');
  }
  return response.json();
}

export default function DownloadsPage({ session }) {
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(Boolean(session));
  const [downloadState, setDownloadState] = useState({});
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const user = session?.user || null;
  const isOwner = String(user?.email || '').toLowerCase() === OWNER_EMAIL;

  useEffect(() => {
    if (!session) {
      setArtifacts([]);
      setLoadingArtifacts(false);
      return undefined;
    }

    let active = true;
    setLoadingArtifacts(true);
    authorizedFetch('/api/downloads', session)
      .then(async (response) => {
        const payload = await responsePayload(response);
        if (!response.ok) throw new Error(payload.error || 'Downloads could not be loaded.');
        if (active) setArtifacts(payload.artifacts || []);
      })
      .catch((error) => {
        if (active) setAuthError(error.message);
      })
      .finally(() => {
        if (active) setLoadingArtifacts(false);
      });

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (!session || !isOwner) return undefined;
    let active = true;
    setReportLoading(true);
    authorizedFetch('/api/download-report', session)
      .then(async (response) => {
        const payload = await responsePayload(response);
        if (!response.ok) throw new Error(payload.error || 'Tester report could not be loaded.');
        if (active) setReport(payload);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReportLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOwner, session]);

  const orderedArtifacts = useMemo(() => {
    const byId = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
    return Object.keys(installerCopy).map((id) => byId.get(id) || {
      id,
      version: '0.3.0',
      available: false,
      size: 0
    });
  }, [artifacts]);

  async function signInWithGoogle() {
    if (!supabase) {
      setAuthError('Google sign-in is not configured yet.');
      return;
    }
    setSigningIn(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/downloads` }
    });
    if (error) {
      setAuthError(error.message);
      setSigningIn(false);
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    window.location.replace('/downloads');
  }

  async function startDownload(artifact) {
    if (!session || !artifact.available) return;
    setDownloadState((current) => ({ ...current, [artifact.id]: 'starting' }));
    setAuthError('');
    try {
      const response = await authorizedFetch('/api/downloads', session, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifact: artifact.id })
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || 'The download could not be started.');
      setDownloadState((current) => ({ ...current, [artifact.id]: 'ready' }));
      window.location.assign(payload.downloadUrl);
    } catch (error) {
      setDownloadState((current) => ({ ...current, [artifact.id]: 'error' }));
      setAuthError(error.message);
    }
  }

  async function exportTesterReport() {
    if (!session || !isOwner) return;
    setReportLoading(true);
    try {
      const response = await authorizedFetch('/api/download-report?format=csv', session);
      if (!response.ok) throw new Error('Tester report could not be exported.');
      const reportBlob = await response.blob();
      const url = URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'karnatik-tanpura-downloads.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <main className="downloads-page">
      <header className="downloads-nav">
        <a className="downloads-brand" href="/" aria-label="Karnatik.ai home">
          <span>K</span>
          <strong>Karnatik.ai</strong>
        </a>
        <div className="downloads-nav-actions">
          <a href="/">Home</a>
          {user ? (
            <button type="button" onClick={signOut}><LogOut size={17} /> Sign out</button>
          ) : null}
        </div>
      </header>

      <section className="downloads-intro">
        <div className="downloads-copy">
          <p className="downloads-product-line">Karnatik Tanpura</p>
          <h1>Real Shruthi for every DAW.</h1>
          <p>A four-string, real-sample tanpura instrument with pitch-preserving BPM control, Pa and Ma Shruthi modes, reverb, and bar-aligned WAV export.</p>
          <div className="downloads-format-line">
            <span>Version 0.3.0 beta</span>
            <span>AU + VST3</span>
            <span>Mac + Windows</span>
          </div>
        </div>
        <div className="downloads-instrument" aria-label="Karnatik Tanpura instrument preview">
          <img src="/images/karnatik-tanpura-plugin.webp" alt="Four-string tanpura used in the Karnatik Tanpura plug-in" />
        </div>
      </section>

      {!user ? (
        <section className="downloads-gate">
          <div>
            <ShieldCheck size={30} />
            <h2>Join the free beta</h2>
            <p>Continue with Google to download. We record your email and chosen platform so we can count testers and invite you to a short feedback survey.</p>
          </div>
          <button type="button" onClick={signInWithGoogle} disabled={signingIn || !isSupabaseConfigured}>
            {signingIn ? <LoaderCircle className="downloads-spinner" size={20} /> : <LogIn size={20} />}
            {signingIn ? 'Opening Google...' : 'Continue with Google'}
          </button>
          {authError ? <p className="downloads-error">{authError}</p> : null}
        </section>
      ) : (
        <>
          <section className="downloads-session-bar">
            <div>
              <CheckCircle2 size={20} />
              <span>Signed in as <strong>{user.email}</strong></span>
            </div>
            <p>Choose the build that matches your computer.</p>
          </section>

          <section className="downloads-list" aria-label="Karnatik Tanpura downloads">
            {orderedArtifacts.map((artifact) => {
              const copy = installerCopy[artifact.id];
              const Icon = copy.icon;
              const downloading = downloadState[artifact.id] === 'starting';
              return (
                <article className="download-row" key={artifact.id}>
                  <div className="download-platform-icon"><Icon size={25} /></div>
                  <div className="download-row-copy">
                    <h2>{copy.title}</h2>
                    <p>{copy.detail}</p>
                  </div>
                  <div className="download-meta">
                    <strong>{copy.formats}</strong>
                    <span>{artifact.available ? formatBytes(artifact.size) : 'Preparing build'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => startDownload(artifact)}
                    disabled={!artifact.available || downloading || loadingArtifacts}
                    title={artifact.available ? `Download ${copy.title}` : `${copy.title} is being prepared`}
                  >
                    {downloading ? <LoaderCircle className="downloads-spinner" size={19} /> : <ArrowDownToLine size={19} />}
                    {downloading ? 'Starting...' : artifact.available ? 'Download' : 'Soon'}
                  </button>
                </article>
              );
            })}
          </section>

          {authError ? <p className="downloads-error downloads-error-wide">{authError}</p> : null}

          {isOwner ? (
            <section className="downloads-owner-panel">
              <div>
                <p>Owner report</p>
                <h2>{report?.totalDownloads ?? 0} downloads from {report?.uniqueTesters ?? 0} testers</h2>
              </div>
              <button type="button" onClick={exportTesterReport} disabled={reportLoading}>
                <FileText size={18} /> {reportLoading ? 'Preparing...' : 'Export tester CSV'}
              </button>
            </section>
          ) : null}
        </>
      )}

      <section className="downloads-notes">
        <div>
          <h2>Before you install</h2>
          <p>This is an unsigned evaluation beta. Your operating system may show an unknown developer warning. Only install files downloaded directly from Karnatik.ai.</p>
        </div>
        <div>
          <h2>What is included</h2>
          <p>Pa-Sa-Sa-Sa and Ma-Sa-Sa-Sa modes, 12 Shruthi roots, Auto and Manual BPM, fine tune, tone, stereo width, reverb, and 1-32 bar WAV export.</p>
        </div>
        <div>
          <h2>Sample credit</h2>
          <p>Tanpura Shruthi samples sourced by Hriday Goswami, X Noise Studio, Guwahati.</p>
        </div>
      </section>

      <footer className="downloads-footer">
        <span>A Musicloud Studio instrument from Karnatik.ai</span>
        <a href="mailto:ramanujan.mk@musicloudstudio.com">Beta support</a>
      </footer>
    </main>
  );
}
