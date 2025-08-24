/**
 * Performance optimizations for better lighthouse scores
 */

// Optimized fetch with caching and error handling
window.optimizedFetch = function(url, options = {}) {
  // Add caching headers for better performance
  const defaultOptions = {
    headers: {
      'Cache-Control': 'public, max-age=300',
      ...options.headers
    },
    ...options
  };

  return fetch(url, defaultOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
};

// Lazy loading for images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Initialize optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  lazyLoadImages();
  
  // Preload critical resources
  const criticalResources = ['/static/default.jpg'];
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);
  });
});

// Video optimization
function optimizeVideoLoading() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    // Set preload metadata for faster loading
    video.preload = 'metadata';
    
    // Add loading optimization
    video.addEventListener('loadstart', function() {
      this.style.backgroundColor = '#000';
    });
    
    video.addEventListener('loadedmetadata', function() {
      // Update progress bar if available
      const progressBar = document.querySelector('.progress-bar-fill');
      if (progressBar) {
        progressBar.style.setProperty('--progress-width', '10%');
      }
    });
  });
}

// Call video optimization when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', optimizeVideoLoading);
} else {
  optimizeVideoLoading();
}

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', function() {
    // Log performance metrics for debugging
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load performance:', {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart
    });
  });
}
