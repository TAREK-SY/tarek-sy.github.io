// GitHub Pages SPA Router
// This script handles client-side routing for single-page applications on GitHub Pages

(function() {
  // Check if we were redirected from 404.html
  if (sessionStorage.redirect) {
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    
    // Parse the redirect path
    var parts = redirect.split('?');
    var path = parts[0];
    var search = parts[1] ? '?' + parts[1] : '';
    var hash = window.location.hash;
    
    // Use the wouter router to navigate to the path
    // The router will handle the path correctly
    window.history.replaceState(null, null, path + search + hash);
  }
})();
