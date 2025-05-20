export const fetcher = (url: string) => fetch(url).then(async res => {
    if (res.ok) {
        return res.json();
    }
    const json = await res.json();
    const error = new Error(json.message);
    error.name = json.error;
    error.cause = {
        response: json,
        status: res.status
    };
    throw error;
});