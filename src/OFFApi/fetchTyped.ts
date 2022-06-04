export const fetchTyped = async <T>(
  input: RequestInfo,
  init: RequestInit = {},
  controller = new AbortController()
): Promise<T> => {
  const { signal } = controller;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10000);

  const response = await fetch(input, { signal, ...init });

  if (!response.ok) {
    throw new Error(response.statusText);
  } else {
    clearTimeout(timeoutId);
  }

  const json: T = await response.json();

  return json;
};
