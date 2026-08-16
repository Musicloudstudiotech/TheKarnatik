import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  Eye,
  FileText,
  Laptop,
  LoaderCircle,
  LogOut,
  Mail,
  Monitor,
  ShieldCheck
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';
import './downloads.css';

const OWNER_EMAIL = 'ramanujan.mk@musicloudstudio.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  || '214607907341-rffsp03uud5n2stmtjc5e0fbpv3dm89a.apps.googleusercontent.com';

let googleIdentityPromise;

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleIdentityPromise) return googleIdentityPromise;

  googleIdentityPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-karnatik-google-identity]');
    const script = existing || document.createElement('script');

    const handleLoad = () => resolve(window.google);
    const handleError = () => reject(new Error('Google sign-in could not be loaded. Please try again.'));

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    if (!existing) {
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.karnatikGoogleIdentity = 'true';
      document.head.appendChild(script);
    }
  });

  return googleIdentityPromise;
}

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
  },
  'installation-sop': {
    title: 'Installation help SOP',
    detail: 'Visual steps for Apple Silicon, Intel Mac, and Windows security warnings',
    formats: 'PDF',
    icon: ShieldCheck
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
  const googleButtonRef = useRef(null);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [account, setAccount] = useState({
    email: '',
    password: ''
  });
  const [artifacts, setArtifacts] = useState([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(Boolean(session));
  const [downloadState, setDownloadState] = useState({});
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const user = session?.user || null;
  const isOwner = String(user?.email || '').toLowerCase() === OWNER_EMAIL;

  useEffect(() => {
    if (user || !supabase || !GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;

    let active = true;
    const buttonHost = googleButtonRef.current;

    loadGoogleIdentity()
      .then((google) => {
        if (!active || !buttonHost) return;

        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            if (!credential) {
              setAuthError('Google did not return a sign-in credential. Please try again.');
              return;
            }

            setSigningIn(true);
            setAuthError('');
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: credential
            });
            if (error) setAuthError(error.message);
            setSigningIn(false);
          }
        });

        buttonHost.replaceChildren();
        google.accounts.id.renderButton(buttonHost, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: Math.min(400, Math.max(240, buttonHost.clientWidth))
        });
      })
      .catch((error) => {
        if (active) setAuthError(error.message);
      });

    return () => {
      active = false;
      buttonHost.replaceChildren();
    };
  }, [user]);

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

  function updateAccount(field, value) {
    setAccount((current) => ({ ...current, [field]: value }));
    setAuthError('');
  }

  async function handleEmailAuth(event) {
    event.preventDefault();
    if (!supabase) {
      setAuthError('Account access is not configured yet.');
      return;
    }

    setSigningIn(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: account.email.trim(),
      password: account.password
    });
    if (error) setAuthError(error.message);
    setSigningIn(false);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    window.location.replace('/downloads');
  }

  async function accessArtifact(artifact, intent = 'download') {
    if (!session || !artifact.available) return;
    const stateKey = `${artifact.id}:${intent}`;
    const viewer = intent === 'view' ? window.open('about:blank', '_blank') : null;
    if (viewer) viewer.opener = null;
    setDownloadState((current) => ({ ...current, [stateKey]: 'starting' }));
    setAuthError('');
    try {
      const response = await authorizedFetch('/api/downloads', session, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifact: artifact.id, intent })
      });
      const payload = await responsePayload(response);
      if (!response.ok) throw new Error(payload.error || 'The download could not be started.');
      setDownloadState((current) => ({ ...current, [stateKey]: 'ready' }));
      if (intent === 'view') {
        if (viewer) viewer.location.replace(payload.viewUrl);
        else window.open(payload.viewUrl, '_blank', 'noopener,noreferrer');
      } else if (payload.downloadUrl.startsWith('/')) {
        const link = document.createElement('a');
        link.href = payload.downloadUrl;
        link.download = artifact.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        window.location.assign(payload.downloadUrl);
      }
    } catch (error) {
      if (viewer) viewer.close();
      setDownloadState((current) => ({ ...current, [stateKey]: 'error' }));
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

      <a className="downloads-banner" href="#download-access" aria-label="Continue to Karnatik Tanpura downloads">
        <img
          src="/images/karnatik-tanpura-downloads-banner.webp"
          alt="Karnatik Tanpura VST with Shruthi, string mode, BPM, volume, stereo width, and reverb controls"
        />
      </a>

      {!user ? (
        <section className="downloads-gate" id="download-access">
          <div className="downloads-gate-heading">
            <ShieldCheck size={30} />
            <div>
              <h2>Download the installer</h2>
              <p>Continue with Google to create or access your Karnatik.ai download account.</p>
            </div>
          </div>
          <div className="downloads-auth-panel">
            <div className="downloads-google-button-host" ref={googleButtonRef} aria-label="Continue with Google" />
            {signingIn ? (
              <p className="downloads-google-status">
                <LoaderCircle className="downloads-spinner" size={18} /> Signing in securely...
              </p>
            ) : null}

            <div className="downloads-auth-divider"><span>existing email account</span></div>

            <form className="downloads-account-form" onSubmit={handleEmailAuth}>
              <label>
                <span>Email</span>
                <input type="email" value={account.email} onChange={(event) => updateAccount('email', event.target.value)} autoComplete="email" required />
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={account.password} onChange={(event) => updateAccount('password', event.target.value)} autoComplete="current-password" minLength={8} required />
              </label>
              <button className="downloads-email-button" type="submit" disabled={signingIn || !isSupabaseConfigured}>
                {signingIn ? <LoaderCircle className="downloads-spinner" size={19} /> : <Mail size={19} />}
                {signingIn ? 'Please wait...' : 'Sign in with email'}
              </button>
            </form>

            {authError ? <p className="downloads-error">{authError}</p> : null}
          </div>
        </section>
      ) : (
        <>
          <section className="downloads-session-bar" id="download-access">
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
              const isPdf = artifact.id === 'user-guide' || artifact.id === 'installation-sop';
              const downloading = downloadState[`${artifact.id}:download`] === 'starting';
              const viewing = downloadState[`${artifact.id}:view`] === 'starting';
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
                  <div className="download-actions">
                    {isPdf ? (
                      <button
                        className="download-secondary-action"
                        type="button"
                        onClick={() => accessArtifact(artifact, 'view')}
                        disabled={!artifact.available || viewing || loadingArtifacts}
                        title={artifact.available ? `Read ${copy.title}` : `${copy.title} is being prepared`}
                      >
                        {viewing ? <LoaderCircle className="downloads-spinner" size={19} /> : <Eye size={19} />}
                        {viewing ? 'Opening...' : artifact.available ? 'Read PDF' : 'Soon'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => accessArtifact(artifact)}
                      disabled={!artifact.available || downloading || loadingArtifacts}
                      title={artifact.available ? `Download ${copy.title}` : `${copy.title} is being prepared`}
                    >
                      {downloading ? <LoaderCircle className="downloads-spinner" size={19} /> : <ArrowDownToLine size={19} />}
                      {downloading ? 'Starting...' : artifact.available ? isPdf ? 'Download PDF' : 'Download' : 'Soon'}
                    </button>
                  </div>
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
        <span>A Musicloudstudio &amp; Technology instrument from Karnatik.ai</span>
        <a href="mailto:ramanujan.mk@musicloudstudio.com">Beta support</a>
      </footer>
    </main>
  );
}
