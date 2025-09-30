let nextSongId = 0;

// Representa una canción almacenada dentro de los nodos de la playlist.
export class Song {
  readonly id: string;
  title: string;
  artist: string;
  url: string;
  cover?: string;
  previous: Song | null = null;
  next: Song | null = null;

  constructor(title: string, artist: string, url: string, cover?: string, id?: string) {
    this.id = id ?? `song-${Date.now()}-${++nextSongId}`;
    this.title = title;
    this.artist = artist;
    this.url = url;
    this.cover = cover;
  }
}
