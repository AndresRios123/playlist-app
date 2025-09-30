const JAMENDO_CLIENT_ID = 'c40a83b1';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0/tracks/';
const DEFAULT_LIMIT = 12;
// Obtiene una página de canciones desde Jamendo usando paginación por offset.
export async function fetchSongs(page = 1, limit = DEFAULT_LIMIT) {
    const offset = (page - 1) * limit;
    const url = `${JAMENDO_BASE_URL}?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&offset=${offset}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        const songs = data.results.map((track) => ({
            title: track.name,
            artist: track.artist_name,
            url: track.audio,
            cover: track.image,
        }));
        return {
            songs,
            hasMore: data.headers.results_count === limit,
        };
    }
    catch (error) {
        console.error('Error al obtener canciones de Jamendo:', error);
        return { songs: [], hasMore: false };
    }
}
//# sourceMappingURL=api.js.map