'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function TikTokViewer({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExif, setShowExif] = useState(false);
  const [isFullLoaded, setIsFullLoaded] = useState({});
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);

  const currentImage = images[currentIndex];
  const exifData = currentImage?.exif_data ? JSON.parse(currentImage.exif_data) : {};
  const tags = currentImage?.tags ? currentImage.tags.split(',').map(t => t.trim()) : [];

  // Preload next and previous images
  useEffect(() => {
    if (images.length === 0) return;

    const preloadIndexes = [
      currentIndex,
      currentIndex + 1,
      currentIndex - 1,
    ].filter(i => i >= 0 && i < images.length);

    preloadIndexes.forEach(index => {
      const img = new window.Image();
      img.src = images[index].full_url;
      img.onload = () => {
        setIsFullLoaded(prev => ({ ...prev, [index]: true }));
      };
    });
  }, [currentIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setShowExif(false);
      } else if (e.key === 'ArrowDown' && currentIndex < images.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowExif(false);
      } else if (e.key === 'Escape') {
        setShowExif(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  // Wheel/scroll navigation
  useEffect(() => {
    let timeout;
    const handleWheel = (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (e.deltaY > 0 && currentIndex < images.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setShowExif(false);
        } else if (e.deltaY < 0 && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          setShowExif(false);
        }
      }, 50);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      clearTimeout(timeout);
    };
  }, [currentIndex, images.length]);

  // Touch navigation
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75 && currentIndex < images.length - 1) {
      // Swiped up
      setCurrentIndex(prev => prev + 1);
      setShowExif(false);
    }

    if (touchStart - touchEnd < -75 && currentIndex > 0) {
      // Swiped down
      setCurrentIndex(prev => prev - 1);
      setShowExif(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.full_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentImage.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-white/60 mb-4">No images to explore</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-black relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Thumbnail (loads first) */}
        {!isFullLoaded[currentIndex] && (
          <div className="absolute inset-0">
            <Image
              src={currentImage.thumbnail_url}
              alt={currentImage.title}
              fill
              className="object-contain blur-sm"
              priority
            />
          </div>
        )}

        {/* Full resolution image */}
        <div className="absolute inset-0" onClick={() => setShowExif(!showExif)}>
          <Image
            src={currentImage.full_url}
            alt={currentImage.title}
            fill
            className={`object-contain transition-opacity duration-500 ${
              isFullLoaded[currentIndex] ? 'opacity-100' : 'opacity-0'
            }`}
            priority
          />
        </div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-all">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">{currentImage.title}</h2>
          {currentImage.description && (
            <p className="text-white/80 text-sm mb-3 line-clamp-2">{currentImage.description}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full text-white/90 text-xs hover:bg-white/20 transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Actions (TikTok style) */}
      <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-4">
        {/* Download */}
        <button
          onClick={handleDownload}
          className="p-4 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all group"
          title="Download"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        {/* Info/EXIF Toggle */}
        <button
          onClick={() => setShowExif(!showExif)}
          className={`p-4 backdrop-blur-xl rounded-full transition-all ${
            showExif ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'
          }`}
          title="Info"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Share */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: currentImage.title,
                text: currentImage.description,
                url: window.location.href,
              });
            }
          }}
          className="p-4 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all"
          title="Share"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* EXIF Info Overlay */}
      {showExif && Object.keys(exifData).length > 0 && (
        <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-2xl w-full glass-dark border border-white/10 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Image Details</h3>
              <button
                onClick={() => setShowExif(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {exifData.Make && (
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-white/60">Camera</span>
                  <span className="text-white font-medium">{exifData.Make} {exifData.Model}</span>
                </div>
              )}
              {exifData.DateTimeOriginal && (
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-white/60">Date Taken</span>
                  <span className="text-white font-medium">
                    {new Date(exifData.DateTimeOriginal).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {exifData.FocalLength && (
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-white/60">Focal Length</span>
                  <span className="text-white font-medium">{exifData.FocalLength}mm</span>
                </div>
              )}
              {exifData.FNumber && (
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-white/60">Aperture</span>
                  <span className="text-white font-medium">f/{exifData.FNumber}</span>
                </div>
              )}
              {exifData.ISO && (
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-white/60">ISO</span>
                  <span className="text-white font-medium">{exifData.ISO}</span>
                </div>
              )}
              {exifData.ExposureTime && (
                <div className="flex justify-between py-3 border-b border-white/10">
                  <span className="text-white/60">Shutter Speed</span>
                  <span className="text-white font-medium">{exifData.ExposureTime}s</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Hints */}
      <div className="absolute left-1/2 bottom-20 transform -translate-x-1/2 z-10 flex gap-2 pointer-events-none">
        {currentIndex > 0 && (
          <div className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full text-white/60 text-xs">
            ↑ Previous
          </div>
        )}
        {currentIndex < images.length - 1 && (
          <div className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full text-white/60 text-xs">
            ↓ Next
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {!isFullLoaded[currentIndex] && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}