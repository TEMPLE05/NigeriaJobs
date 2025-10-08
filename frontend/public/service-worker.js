self.addEventListener('install', () => {
  console.log('Service worker installed');
});

self.addEventListener('fetch', (event) => {
  // You can add caching here if you want
});