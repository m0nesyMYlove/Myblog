export default function setupPreconnect() {
  if (typeof document !== 'undefined') {
    // 思源宋体已本地自托管,不再需要预连接 Google Fonts 域名
    const preconnectUrls = [
      'https://politian.cn',
      'https://v1.hitokoto.cn'
    ];

    preconnectUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}
