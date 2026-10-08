function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : "";

  if (host.indexOf("www.") === 0) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: "https://" + host.slice(4) + request.uri } },
    };
  }

  var uri = request.uri;
  var lastSegment = uri.substring(uri.lastIndexOf("/") + 1);

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else if (lastSegment.indexOf(".") === -1) {
    request.uri = uri + ".html";
  }

  return request;
}
