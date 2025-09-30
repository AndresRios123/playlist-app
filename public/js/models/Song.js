let nextSongId = 0;
// Representa una canción almacenada dentro de los nodos de la playlist.
export class Song {
    constructor(title, artist, url, cover, id) {
        this.previous = null;
        this.next = null;
        this.id = id ?? `song-${Date.now()}-${++nextSongId}`;
        this.title = title;
        this.artist = artist;
        this.url = url;
        this.cover = cover;
    }
}
//# sourceMappingURL=Song.js.map