export function buildResponseBody(statusCode, message, content = null) {
  return { statusCode, message, content, dateTime: new Date().toISOString() };
}

export function sendSuccess(res, content, message = 'Xử lý thành công') {
  res.json(buildResponseBody(200, message, content));
}
