;(function () {
  var preference = null
  try {
    preference = localStorage.getItem('memory-theme')
  } catch (_) {}
  var dark =
    preference === 'dark' ||
    (preference !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document.documentElement.classList.toggle('dark', dark)
})()
