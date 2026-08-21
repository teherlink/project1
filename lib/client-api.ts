export async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch (error) {
    throw new Error('Unable to connect to the server. Check your connection and try again.');
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch (error) {
    if (!response.ok) {
      throw new Error(`The server returned an unexpected error (${response.status}). Please try again.`);
    }
  }

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return data as T;
}
