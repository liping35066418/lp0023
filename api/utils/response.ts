export function success(data: unknown = null, message = 'success') {
  return {
    success: true,
    data,
    message,
  };
}

export function fail(message = 'error', code = 500) {
  return {
    success: false,
    error: message,
    code,
  };
}

export function paginate(
  data: unknown[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    list: data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
