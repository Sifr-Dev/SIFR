import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import { ArrowUpRight, Layers, Search, X } from 'lucide-react';
import type { RepoCategory, RepoSpec } from '../data/repos';
import { filterRepositories, getAvailableLanguages } from '../lib/lineage';
import { haptics } from '../lib/haptics';

interface ProjectCatalogSectionProps {
  repos: RepoSpec[];
  searchInputRef: RefObject<HTMLInputElement | null>;
  onSelectRepo: (repo: RepoSpec) => void;
}

const CATEGORY_TABS: Array<{ id: 'all' | RepoCategory; label: string }> = [
  { id: 'all', label: 'All Categories' },
  { id: 'systems', label: 'Systems & Kernel' },
  { id: 'ml', label: 'ML & Vision' },
  { id: 'infra', label: 'Backend & Infra' },
];

export function ProjectCatalogSection({
  repos,
  searchInputRef,
  onSelectRepo,
}: ProjectCatalogSectionProps) {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('all');
  const [category, setCategory] = useState<'all' | RepoCategory>('all');

  const availableLanguages = useMemo(() => getAvailableLanguages(repos), [repos]);

  const filtered = useMemo(
    () => filterRepositories(repos, { query, language, category }),
    [repos, query, language, category]
  );

  const hasFilters = Boolean(query.trim()) || language !== 'all' || category !== 'all';

  const resetFilters = () => {
    haptics.trigger('tap');
    setQuery('');
    setLanguage('all');
    setCategory('all');
  };

  return (
    <section
      id="catalog"
      aria-labelledby="catalog-heading"
      className="border-b border-[#2d3038] bg-[#04060b] py-14 sm:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="font-mobilis text-xs font-semibold text-[#eab444] tracking-wider">
              Sifr-Dev Inventory
            </div>
            <h2 id="catalog-heading" className="text-2xl sm:text-3xl font-extrabold text-[#ffffff]">
              All {repos.length} Engineering Repositories
            </h2>
          </div>

          <div
            role="status"
            aria-live="polite"
            data-testid="catalog-result-count"
            className="font-mobilis text-xs font-semibold text-[#c9d0de]"
          >
            Showing <span className="text-[#eab444]">{filtered.length}</span> of {repos.length}{' '}
            repositories
          </div>
        </div>

        {/* Keyboard-accessible search + language & category filters */}
        <div className="border border-[#2d3038] bg-[#0a0d13] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <label htmlFor="sifr-repo-search" className="sr-only">
                Search repositories by name, language, category, or technical topic
              </label>
              <Search
                className="w-4 h-4 text-[#eab444] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                id="sifr-repo-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    if (query) {
                      e.preventDefault();
                      setQuery('');
                    } else {
                      e.currentTarget.blur();
                    }
                  }
                }}
                placeholder="Search by project, programming language (Rust, Zig, Go, Python, C++), or subsystem... (Press /)"
                className="w-full min-h-[44px] pl-10 pr-10 py-2 bg-[#04060b] border border-[#2d3038] focus:border-[#eab444] text-sm font-medium text-[#f3f7fe] placeholder:text-[#7f8696] outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#a6acb9] hover:text-[#f3f7fe] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-[44px] px-4 py-2 border border-[#2d3038] bg-[#04060b] hover:border-[#eab444] font-mobilis text-xs font-semibold text-[#eab444] whitespace-nowrap cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Category + Language rows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by project category">
              <span className="font-mobilis text-[11px] text-[#a6acb9] mr-1">CATEGORY:</span>
              {CATEGORY_TABS.map((tab) => {
                const active = category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      haptics.trigger('detent');
                      setCategory(tab.id);
                    }}
                    className={`min-h-[34px] px-3 py-1 text-xs font-semibold border cursor-pointer transition-colors ${
                      active
                        ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                        : 'border-[#2d3038] bg-[#04060b] text-[#d5dce8] hover:border-[#eab444]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by programming language">
              <span className="font-mobilis text-[11px] text-[#a6acb9] mr-1">LANGUAGE:</span>
              <button
                type="button"
                aria-pressed={language === 'all'}
                onClick={() => {
                  haptics.trigger('tap');
                  setLanguage('all');
                }}
                className={`min-h-[34px] px-2.5 py-1 font-mobilis text-xs border cursor-pointer transition-colors ${
                  language === 'all'
                    ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                    : 'border-[#2d3038] bg-[#04060b] text-[#d5dce8] hover:border-[#eab444]'
                }`}
              >
                All
              </button>
              {availableLanguages.map((lang) => {
                const active = language === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      haptics.trigger('tap');
                      setLanguage(lang);
                    }}
                    className={`min-h-[34px] px-2.5 py-1 font-mobilis text-xs border cursor-pointer transition-colors ${
                      active
                        ? 'border-[#eab444] bg-[#eab444] text-[#04060b] font-bold'
                        : 'border-[#2d3038] bg-[#04060b] text-[#d5dce8] hover:border-[#eab444]'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Repository Grid */}
        {filtered.length === 0 ? (
          <div className="border border-[#2d3038] bg-[#0a0d13] p-10 text-center space-y-4">
            <p className="text-base font-semibold text-[#f3f7fe]">
              No repositories match the current search or filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[40px] px-4 py-2 bg-[#eab444] text-[#04060b] text-xs font-bold cursor-pointer"
            >
              Show All {repos.length} Repositories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((repo) => {
              const maturityTone =
                repo.maturity === 'Verified'
                  ? 'border-[#40e080]/50 text-[#40e080]'
                  : repo.maturity === 'Prototype'
                    ? 'border-[#eab444]/55 text-[#eab444]'
                    : 'border-[#9498a1]/50 text-[#c9d0de]';
              return (
                <article
                  key={repo.id}
                  data-testid={`catalog-card-${repo.id}`}
                  className="border border-[#2d3038] bg-[#0a0d13] hover:border-[#eab444]/75 transition-colors p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mobilis text-[11px]">
                      <span className="text-[#eab444] font-semibold">
                        {repo.primaryLanguage} · {repo.categoryLabel}
                      </span>
                      <span className={`px-1.5 py-0.5 border ${maturityTone}`}>
                        {repo.maturity}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-[#ffffff]">{repo.name}</h3>
                      <p className="text-xs font-semibold text-[#b4bac8] mt-0.5">{repo.subtitle}</p>
                    </div>

                    <p className="text-[13.5px] text-[#e4e8f1] leading-[1.6]">{repo.summary}</p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#2d3038]">
                    <div className="font-mobilis text-[11px] text-[#eab444] leading-relaxed">
                      {repo.proofMetric}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          haptics.trigger('detent');
                          onSelectRepo(repo);
                        }}
                        className="min-h-[36px] px-3 py-1.5 border border-[#eab444]/75 bg-[#04060b] hover:bg-[#eab444] hover:text-[#04060b] text-xs font-bold text-[#eab444] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                        Inspect Dossier
                      </button>

                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[36px] px-2.5 py-1.5 text-xs font-mobilis text-[#c9d0de] hover:text-[#eab444] inline-flex items-center gap-1"
                      >
                        <span>Sifr-Dev/{repo.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
