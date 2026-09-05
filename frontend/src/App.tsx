import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useJobs } from './hooks/useJobs';
import { jobsApi } from './services/api';
import PopulateJobs from './components/PopulateJobs';
import HelpCenter from './components/HelpCenter';
import ContactUs from './components/ContactUs';
import CVGenerator from './components/CVGenerator';
import Preloader from './components/Preloader';
import AppShell from './components/AppShell';
import HomePage from './components/HomePage';
import { usePersistentState } from './hooks/usePersistentState';
import { FilterSuggestion } from './types/Job';

const App: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [source, setSource] = useState('All');
  const [level, setLevel] = useState('All');
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = usePersistentState<'card' | 'list'>('viewMode', 'card');

  const { jobs, loading, error, pagination, filterSuggestions, fetchJobs } = useJobs();
  const mountTimeRef = useRef(Date.now());
  const retryCountRef = useRef(0);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.classList.add('preloader-active');
  }, []);

  // Preloader stays up (and keeps pulsing via its own animation) until the
  // first job fetch actually succeeds, auto-retrying a few times if the
  // network is slow or the request fails — instead of the old fixed 3s
  // timer, which forced the same wait regardless of whether data was ready.
  // `pagination` only gets set after a successful response, so it's an
  // unambiguous "first load truly completed" signal (unlike `loading`/
  // `error`, whose initial values look identical to "already succeeded").
  // If retries run out, it dismisses anyway so the user isn't stuck behind
  // the splash forever — the app shell's own error/retry UI takes over.
  useEffect(() => {
    if (!isLoading) return;

    // The "Your Next Career" reveal (BlurText's staggered word animation plus
    // the outer entrance transition) takes ~1.3-1.5s to fully settle — this
    // floor needs to clear that so a fast connection doesn't cut it off
    // mid-animation, while still being well under the old fixed 3.6s wait.
    const MIN_DISPLAY_MS = 2200;
    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 2500;

    let timer: ReturnType<typeof setTimeout>;

    const dismiss = () => {
      const elapsed = Date.now() - mountTimeRef.current;
      timer = setTimeout(() => {
        document.querySelector('.preloader')?.classList.add('hidden');
        setTimeout(() => {
          setIsLoading(false);
          document.body.classList.remove('preloader-active');
        }, 600);
      }, Math.max(MIN_DISPLAY_MS - elapsed, 0));
    };

    if (pagination) {
      dismiss();
    } else if (!loading && error) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        timer = setTimeout(() => {
          fetchJobs(undefined, undefined, source, 1, 8, level);
        }, RETRY_DELAY_MS);
      } else {
        dismiss();
      }
    }

    return () => clearTimeout(timer);
  }, [isLoading, loading, error, pagination, fetchJobs, source, level]);

  // Initial load
  useEffect(() => {
    fetchJobs(undefined, undefined, source, 1, 8, level);
  }, [fetchJobs, source, level]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1); // Reset to first page when searching
    fetchJobs(keyword.trim() || undefined, location.trim() || undefined, source, 1, 8, level);
  }, [keyword, location, source, level, fetchJobs]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchJobs(keyword.trim() || undefined, location.trim() || undefined, source, page, 8, level);
  }, [keyword, location, source, level, fetchJobs]);

  // Lets a "remove this filter" suggestion clear just the one filter that's
  // blocking a zero-result search — the debounced-search effect below picks
  // up the state change and re-fetches automatically.
  const clearFilter = useCallback((filterKey: FilterSuggestion['filter']) => {
    setCurrentPage(1);
    switch (filterKey) {
      case 'keyword': setKeyword(''); break;
      case 'location': setLocation(''); break;
      case 'level': setLevel('All'); break;
      case 'source': setSource('All'); break;
    }
  }, []);

  // Self-heal: if the current page ends up beyond what the server says is
  // valid (e.g. landing past the last page of a narrow search, or the
  // underlying data shifting between requests), snap back to a real page
  // automatically instead of leaving the user stuck on an empty page with
  // no pagination controls to navigate back with.
  useEffect(() => {
    if (!pagination || loading) return;
    if (pagination.totalPages > 0 && currentPage > pagination.totalPages) {
      handlePageChange(pagination.totalPages);
    }
  }, [pagination, currentPage, loading, handlePageChange]);

  const handleCleanup = async () => {
    if (cleanupLoading) return;

    setCleanupLoading(true);
    setCleanupMessage(null);

    try {
      const result = await jobsApi.triggerCleanup();
      setCleanupMessage(`✅ ${result.message}`);
      // Refresh jobs after cleanup
      setCurrentPage(1);
      fetchJobs(keyword.trim() || undefined, location.trim() || undefined, source, 1, 8, level);
    } catch (error) {
      setCleanupMessage(`❌ Failed to cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCleanupLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setCleanupMessage(null), 5000);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [keyword, location, source, level, handleSearch]);

  // Scroll to jobs section when jobs change (for pagination)
  useEffect(() => {
    const element = document.getElementById('jobs-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [jobs]);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            <HomePage
              keyword={keyword}
              setKeyword={setKeyword}
              location={location}
              setLocation={setLocation}
              source={source}
              setSource={setSource}
              level={level}
              setLevel={setLevel}
              cleanupLoading={cleanupLoading}
              cleanupMessage={cleanupMessage}
              handleCleanup={handleCleanup}
              jobs={jobs}
              loading={loading}
              error={error}
              pagination={pagination}
              filterSuggestions={filterSuggestions}
              clearFilter={clearFilter}
              currentPage={currentPage}
              fetchJobs={fetchJobs}
              handlePageChange={handlePageChange}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          }
        />
        <Route path="/cv-generator" element={<CVGenerator />} />
        <Route path="/populate-jobs" element={<PopulateJobs />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contact" element={<ContactUs />} />
      </Route>
    </Routes>
  );
};

export default App;
