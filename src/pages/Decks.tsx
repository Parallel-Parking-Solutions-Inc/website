import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Eye, EyeOff, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './Decks.css';
import LoadingLogo from '../components/LoadingLogo';

type DeckEntry = {
  file: string;
  slug?: string;
  encodedPassword?: string;
  password?: string;
  title?: string;
};

type DeckConfig = {
  decks?: DeckEntry[];
};

type DecksProps = {
  isSidebarCollapsed?: boolean;
  onCollapseSidebar?: (collapsed: boolean) => void;
};

const DECKS_CONFIG_PATH = '/decks/decks.json';
const PDF_WORKER_SRC = '/pdf.worker.min.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

const stripExtension = (fileName: string) => fileName.replace(/\.[^/.]+$/, '');

const formatTitle = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .trim();

const decodePassword = (entry: DeckEntry): string | null => {
  if (entry.password) {
    return entry.password;
  }

  if (entry.encodedPassword) {
    try {
      return atob(entry.encodedPassword);
    } catch {
      return null;
    }
  }

  return null;
};

const findDeck = (deckName: string, entries: DeckEntry[]): DeckEntry | null => {
  const target = deckName.toLowerCase();
  const targetWithPdf = `${target}.pdf`;

  return (
    entries.find((entry) => {
      const slug = (entry.slug || stripExtension(entry.file)).toLowerCase();
      const fileName = entry.file.toLowerCase();
      return (
        slug === target ||
        stripExtension(fileName) === target ||
        fileName === target ||
        fileName === targetWithPdf
      );
    }) ?? null
  );
};

const checkPdfAvailability = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

const Decks: React.FC<DecksProps> = ({ isSidebarCollapsed, onCollapseSidebar }) => {
  const { deckName = '' } = useParams<{ deckName: string }>();
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<DeckEntry | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pageWidth, setPageWidth] = useState(1100);
  const [authStatus, setAuthStatus] = useState<'pending' | 'checking' | 'approved'>('pending');
  const [message, setMessage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const thumbRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    let isMounted = true;
    const loadDeck = async () => {
      setLoading(true);
      setMessage(null);
      setDeck(null);
      setPdfUrl(null);
      setNumPages(null);
      setPageNumber(1);
      setPdfLoading(false);
      pageRefs.current = {};
      setAuthStatus('pending');
      setPasswordInput('');

      try {
        const response = await fetch(DECKS_CONFIG_PATH, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error('Deck list unavailable');
        }

        const data = (await response.json()) as DeckConfig;
        const decks = Array.isArray(data.decks) ? data.decks : [];
        const match = findDeck(deckName, decks);

        if (!isMounted) {
          return;
        }

        if (!match) {
          setMessage('No Deck Found');
        } else {
          setDeck(match);
        }
      } catch {
        if (isMounted) {
          setMessage('Unable to load deck list.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDeck();
    return () => {
      isMounted = false;
    };
  }, [deckName]);

  useEffect(() => {
    const updateWidth = () => {
      const sidePanelAllowance = window.innerWidth > 1024 ? 360 : 120;
      const calculated = window.innerWidth - sidePanelAllowance;
      setPageWidth(Math.min(1100, Math.max(calculated, 320)));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (!numPages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visiblePages = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.page || '0'))
          .filter(Boolean);

        if (visiblePages.length) {
          const nextPage = Math.min(...visiblePages);
          setPageNumber((prev) => (prev === nextPage ? prev : nextPage));
        }
      },
      {
        root: null,
        threshold: 0.4,
      }
    );

    Object.keys(pageRefs.current).forEach((page) => {
      const node = pageRefs.current[Number(page)];
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [numPages]);

  // Keep thumbnail active state in sync when main scroll changes pageNumber
  useEffect(() => {
    const thumbNode = thumbRefs.current[pageNumber];
    if (thumbNode) {
      thumbNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [pageNumber]);

  useEffect(() => {
    const thumbNode = thumbRefs.current[pageNumber];
    if (thumbNode) {
      thumbNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [pageNumber]);

  const goToPage = (targetPage: number) => {
    if (!numPages) {
      return;
    }
    const clamped = Math.min(Math.max(targetPage, 1), numPages);
    setPageNumber(clamped);
    const node = pageRefs.current[clamped];
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const thumbNode = thumbRefs.current[clamped];
    if (thumbNode) {
      thumbNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (authStatus !== 'approved' || !numPages) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToPage(pageNumber + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPage(pageNumber - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, numPages, pageNumber]);

  const expectedPassword = useMemo(() => {
    if (!deck) {
      return null;
    }
    return decodePassword(deck);
  }, [deck]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deck) {
      return;
    }

    setMessage(null);
    if (!expectedPassword) {
      setMessage('No password configured for this deck.');
      return;
    }

    if (passwordInput !== expectedPassword) {
      setMessage('Incorrect password. Please try again.');
      return;
    }

    setAuthStatus('checking');
    const url = `/decks/${deck.file}`;
    const exists = await checkPdfAvailability(url);

    if (!exists) {
      setAuthStatus('pending');
      setMessage('Deck file is missing or unavailable.');
      return;
    }

    setAuthStatus('approved');
    setPdfUrl(url);
    setPdfLoading(true);
    setPageNumber(1);
    if (onCollapseSidebar && isSidebarCollapsed === false) {
      onCollapseSidebar(true);
    }
  };

  const heading = useMemo(() => {
    if (deck?.title) {
      return deck.title;
    }
    if (deckName) {
      return formatTitle(deckName);
    }
    return 'Deck';
  }, [deck, deckName]);

  const pageRenderProps = {
    width: pageWidth,
    renderTextLayer: false,
    renderAnnotationLayer: false,
  };

  return (
    <div className="deck-page">
      <div className="deck-container">
        <div className="deck-header-row">
          <div className="deck-header">
            <h1 className="deck-title">{heading}</h1>
            {!loading && deck && authStatus !== 'approved' && (
              <p className="deck-subtitle">Password required to view this deck.</p>
            )}
            {loading && <p className="deck-subtitle">Loading deck...</p>}
            {!deck && !loading && <p className="deck-subtitle">No Deck Found</p>}
          </div>
        </div>

        {message && (
          <div className="deck-message" role="alert">
            {message}
          </div>
        )}

        {!loading && deck && authStatus !== 'approved' && (
          <form className="deck-password-form" onSubmit={handleSubmit}>
            <label htmlFor="deck-password" className="deck-label">
              Password
            </label>
            <div className="deck-password-row">
              <div className="deck-input-wrapper">
                <input
                  id="deck-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  placeholder="Enter password"
                  className="deck-input"
                  autoComplete="off"
                  disabled={authStatus === 'checking'}
                  required
                />
                <button
                  type="button"
                  className="deck-toggle-inside"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="submit"
                className="deck-button"
                disabled={!passwordInput.trim() || authStatus === 'checking'}
              >
                {authStatus === 'checking' ? 'Loading...' : 'Unlock'}
              </button>
            </div>
          </form>
        )}

        {authStatus === 'approved' && pdfUrl && (
          <div className="deck-viewer-shell">
            <div className="deck-main">
              {pdfLoading && (
                <div className="deck-loading-overlay">
                  <LoadingLogo text="Loading deck..." />
                </div>
              )}
              <div className="deck-pdf-area" ref={scrollContainerRef}>
                <Document
                  file={pdfUrl}
                onLoadSuccess={({ numPages: total }) => {
                  setNumPages(total);
                  setPdfLoading(false);
                }}
                  onLoadError={(error) => {
                    console.error('PDF render error:', error);
                    setMessage('Unable to render PDF. Please download instead.');
                    setPdfLoading(false);
                  }}
                  loading={<div className="deck-loading">Loading PDF...</div>}
                >
                  {numPages
                  ? Array.from({ length: numPages }).map((_, index) => {
                      const page = index + 1;
                      return (
                        <div
                          key={page}
                          className="deck-page-wrapper"
                          data-page={page}
                          ref={(el) => {
                            pageRefs.current[page] = el;
                          }}
                        >
                          <Page
                            pageNumber={page}
                            {...pageRenderProps}
                            loading={<LoadingLogo text="Loading page..." />}
                            className="deck-page"
                          />
                        </div>
                      );
                    })
                  : (
                    <div className="deck-page-wrapper" data-page={1}>
                      <Page
                        pageNumber={1}
                        {...pageRenderProps}
                        loading={<LoadingLogo text="Loading page..." />}
                        className="deck-page"
                      />
                    </div>
                  )}
              </Document>
              </div>
            </div>
            <aside className="deck-side-panel">
              {deck && authStatus === 'approved' && (
                <a
                  href={`/decks/${deck.file}`}
                  download
                  className="deck-download compact deck-download-top"
                >
                  <Download size={16} />
                  <span>Download</span>
                </a>
              )}
              <div className="deck-side-header">
                <button
                  type="button"
                  className="deck-icon-button"
                  onClick={() => goToPage(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="deck-page-indicator">Page {pageNumber}{numPages ? ` / ${numPages}` : ''}</div>
                <button
                  type="button"
                  className="deck-icon-button"
                  onClick={() => goToPage(pageNumber + 1)}
                  disabled={!!numPages && pageNumber >= numPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="deck-thumb-list">
                {numPages ? (
                  <Document file={pdfUrl} loading={null}>
                    {Array.from({ length: numPages }).map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={`thumb-${page}`}
                          className={`deck-thumb ${pageNumber === page ? 'active' : ''}`}
                          onClick={() => goToPage(page)}
                          type="button"
                          ref={(el) => {
                            thumbRefs.current[page] = el;
                          }}
                          >
                            <Page pageNumber={page} width={140} renderTextLayer={false} renderAnnotationLayer={false} />
                            <span className="deck-thumb-label">{page}</span>
                          </button>
                        );
                    })}
                  </Document>
                ) : (
                  <div className="deck-loading">Loading pages...</div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Decks;
