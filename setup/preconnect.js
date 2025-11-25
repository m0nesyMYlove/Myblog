export default function setupPreconnect() {
  if (typeof document !== 'undefined') {
    const preconnectUrls = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://politian.cn',
      'https://v1.hitokoto.cn'
    ];

    preconnectUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      if (url.includes('fonts.gstatic.com')) {
        link.crossOrigin = '';
      }
      document.head.appendChild(link);
    });
  }
}
