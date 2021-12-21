export const toUrlSafe = (urlUnSafeBase64) => {
  return urlUnSafeBase64.replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/\\/g, '~')
                        .replace(/=+$/g, '');
};

export const fromUrlSafe = function(urlSafeBase64) {
  let base64Original = urlSafeBase64.replace(/_/g, '/')
                       .replace(/~/g, '\\')
                       .replace(/-/g, '+');
  while (base64Original.length % 4) {
    base64Original += '=';
  }
  return base64Original;
};