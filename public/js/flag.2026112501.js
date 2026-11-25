document.documentElement.classList.add('js');
setTimeout(function () { if (!window.__siteReady) document.documentElement.classList.remove('js'); }, 3000);
