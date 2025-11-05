import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { searchRule34Videos } from "@/lib/rule34video";
import { searchXAnimuVideos } from "@/lib/xanimu";
import Loading from "@/components/Loading";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Search as SearchIcon } from "lucide-react";

const Search = () => {
  const router = useRouter();
  const { q, page: pageParam, source: sourceParam } = router.query;
  const [searchQuery, setSearchQuery] = useState(q || "");
  const [source, setSource] = useState(sourceParam || "rule34");
  const currentPage = parseInt(pageParam || "1");

  const { data, isLoading, error } = useQuery({
    queryKey: ["video-search", source, q, currentPage],
    queryFn: () => {
      if (source === "xanimu") {
        return searchXAnimuVideos(q, currentPage);
      }
      return searchRule34Videos(q, currentPage);
    },
    enabled: !!q,
    retry: 2,
    retryDelay: 1000,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=1&source=${source}`);
    }
  };

  const handleNextPage = () => {
    const hasResults = source === "xanimu"
      ? data?.results && data.results.length > 0
      : data?.videos && data.videos.length > 0;

    if (hasResults) {
      router.push(`/search?q=${encodeURIComponent(q)}&page=${currentPage + 1}&source=${source}`);
    }
  };

  const hasMorePages = source === "xanimu"
    ? data?.hasMore
    : data?.videos && data.videos.length > 0;

  const videos = source === "xanimu" ? data?.results : data?.videos;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSource("rule34")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              source === "rule34"
                ? "bg-red-600"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            Rule34Video
          </button>
          <button
            onClick={() => setSource("xanimu")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              source === "xanimu"
                ? "bg-red-600"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            XAnimu
          </button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
            />
            <SearchIcon
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {!q && (
        <div className="text-center py-20 text-neutral-400">
          <SearchIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>Enter a search term to find videos</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loading />
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <div className="text-red-400 mb-2">Failed to load videos</div>
          <div className="text-sm text-neutral-400">
            {error.message || "Please check your connection and try again"}
          </div>
          <button
            onClick={() => router.reload()}
            className="mt-4 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          {videos && videos.length === 0 ? (
            <div className="text-center py-20 text-neutral-400">
              <p>No videos found for &quot;{q}&quot;</p>
              {currentPage > 1 && (
                <p className="mt-2">You&apos;ve reached the end of the results</p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-neutral-400">
                Showing results for &quot;{q}&quot; - Page {currentPage} ({source === "xanimu" ? "XAnimu" : "Rule34Video"})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {videos && videos.map((video, index) => (
                  <Link
                    key={video.id || index}
                    href={source === "xanimu"
                      ? `/watch?id=${encodeURIComponent(video.id)}&source=xanimu`
                      : `/watch?url=${encodeURIComponent(video.url)}&source=rule34`
                    }
                    className="group"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-800 mb-2">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {source === "rule34" && video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    {source === "rule34" && (
                      <>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <span>{video.views} views</span>
                          <span>•</span>
                          <span>{video.added}</span>
                        </div>
                        {video.rating && (
                          <div className="text-xs text-neutral-400 mt-1">
                            {video.rating}
                          </div>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>

              {hasMorePages && (
                <div className="flex justify-center pb-8">
                  <button
                    onClick={handleNextPage}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    Next Page
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
