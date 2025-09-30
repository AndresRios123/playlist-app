import { Song } from '../models/Song.js';

const PLACEHOLDER_COVER = 'https://via.placeholder.com/200?text=No+Cover';
const DEFAULT_INFO_TEXT = 'Selecciona una canción';

// Carga los datos de la canción en el reproductor de audio y elementos de la UI.
export function loadSong(song: Song | null): void {
  const player = document.getElementById('player') as HTMLAudioElement | null;
  const info = document.getElementById('info');
  const cover = document.getElementById('cover') as HTMLImageElement | null;

  if (!player || !info || !cover) {
    return;
  }

  if (!song) {
    player.removeAttribute('src');
    player.load();
    info.textContent = DEFAULT_INFO_TEXT;
    cover.src = PLACEHOLDER_COVER;
    return;
  }

  player.src = song.url;
  info.textContent = `${song.title} - ${song.artist}`;
  cover.src = song.cover ?? PLACEHOLDER_COVER;
}
