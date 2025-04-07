// Add at the top of the file - wherever the App component is defined
// This ensures cart data is cleared on initial page load

// Clear cart badge on startup
if (window.localStorage) {
  const localCartString = window.localStorage.getItem('localCart');
  if (!localCartString || localCartString === '[]') {
    console.log('App: Empty cart on startup, ensuring cart data is clean');
    window.localStorage.setItem('localCart', '[]');
    setTimeout(() => {
      window.dispatchEvent(new Event('cartUpdated'));
    }, 200);
  }
}

// The rest of your App component remains unchanged 