export default function redirectToHTTPS(request, response, next) {
  console.log("Environment:", process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
      console.log("Development environment");
      if (!request.secure) {
          console.log("Redirecting to HTTPS");
          return response.redirect('https://' + request.headers.host + addTrailingSlash(request.url));
      }
      console.log("Request is secure");
      next();
  } else {
      console.log("Production environment");
      if (request.headers["x-forwarded-proto"] !== "https") {
          console.log("Redirecting to HTTPS");
          return response.redirect('https://' + request.headers.host + addTrailingSlash(request.url));
      }
      console.log("Request is secure");
      next();
  }
}

// Helper function to add a trailing slash if it's missing
function addTrailingSlash(url) {
  return url.endsWith('/') ? url : url + '/';
}