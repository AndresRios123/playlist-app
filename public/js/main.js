import { DoublyLinkedList } from './structures/DoublyLinkedList.js';
import { Song } from './models/Song.js';
import { loadSong } from './player/player.js';
import { renderPlaylist, renderRecommendedSongs, } from './ui/ui.js';
import { fetchSongs } from './services/api.js';
const playlist = new DoublyLinkedList();
let recommendedSongs = [];
// Estado de paginación para las recomendaciones
const PAGE_SIZE = 12;
let currentPage = 1;
let hasMoreRecommendations = false;
let isLoadingRecommendations = false;
// Referencias al reproductor obtenidas tras cargar el DOM
let audio = null;
let playButton = null;
// Actualiza el texto del botón principal según si está reproduciendo o en pausa.
function updatePlayButtonLabel() {
    if (!playButton)
        return;
    const shouldShowPause = audio !== null && !audio.paused && audio.currentTime > 0;
    playButton.textContent = shouldShowPause ? 'Pausa' : 'Play';
}
// Cambia la canción actual de la playlist y refleja el cambio en la UI.
function setPlaylistCurrent(song) {
    playlist.setCurrent(song);
    loadSong(song);
}
// Reproduce una canción de la playlist y mantiene sincronizada la interfaz.
function playSong(song) {
    if (!song) {
        audio?.pause();
        loadSong(null);
        updatePlayButtonLabel();
        return;
    }
    setPlaylistCurrent(song);
    audio
        ?.play()
        .catch((error) => console.error('No se pudo reproducir la canción:', error))
        .finally(updatePlayButtonLabel);
}
// Permite escuchar una canción recomendada sin modificar el orden de la playlist.
function previewSong(info) {
    const tempSong = new Song(info.title, info.artist, info.url, info.cover);
    loadSong(tempSong);
    audio
        ?.play()
        .catch((error) => console.error('No se pudo reproducir la canción recomendada:', error))
        .finally(updatePlayButtonLabel);
}
// Agrega una canción recomendada al final de la playlist.
function addSongToPlaylist(info) {
    const wasEmpty = playlist.isEmpty();
    const newSong = playlist.addSong(info.title, info.artist, info.url, info.cover);
    if (wasEmpty) {
        loadSong(newSong);
        playlist.setCurrent(newSong);
    }
    refreshUI();
    updatePlayButtonLabel();
}
// Elimina una canción de la playlist y selecciona la siguiente disponible.
function removeFromPlaylist(song) {
    const isCurrent = playlist.getCurrent() === song;
    playlist.remove(song);
    const nextSong = playlist.getCurrent();
    if (isCurrent) {
        if (nextSong) {
            loadSong(nextSong);
        }
        else {
            audio?.pause();
            loadSong(null);
        }
    }
    refreshUI();
    updatePlayButtonLabel();
}
// Reordena la playlist en respuesta al arrastre y suelta.
function reorderPlaylist(sourceId, targetId) {
    const sourceSong = playlist.findById(sourceId);
    if (!sourceSong)
        return;
    const targetSong = targetId ? playlist.findById(targetId) : null;
    playlist.moveBefore(sourceSong, targetSong);
    refreshUI();
}
// Activa o pausa la reproducción desde el botón principal.
function togglePlayback() {
    if (!audio)
        return;
    if (!audio.src) {
        const current = playlist.getCurrent();
        if (current) {
            playSong(current);
        }
        return;
    }
    if (audio.paused) {
        audio
            .play()
            .catch((error) => console.error('No se pudo continuar la reproducción:', error));
    }
    else {
        audio.pause();
    }
    updatePlayButtonLabel();
}
// Avanza la selección a la canción siguiente.
function handleNext() {
    const nextSong = playlist.nextSong();
    if (nextSong) {
        playSong(nextSong);
        refreshUI();
    }
}
// Retrocede a la canción anterior.
function handlePrev() {
    const prevSong = playlist.prevSong();
    if (prevSong) {
        playSong(prevSong);
        refreshUI();
    }
}
// Actualiza la playlist y las recomendaciones en un único punto.
function refreshUI() {
    const playlistOptions = {
        onPlay: (song) => {
            playSong(song);
            refreshUI();
        },
        onRemove: removeFromPlaylist,
        onReorder: reorderPlaylist,
        currentSong: playlist.getCurrent(),
    };
    renderPlaylist(playlist, playlistOptions);
    const recommendedOptions = {
        onPlay: previewSong,
        onAdd: addSongToPlaylist,
        isLoading: isLoadingRecommendations,
        pagination: {
            page: currentPage,
            hasPrev: currentPage > 1,
            hasNext: hasMoreRecommendations,
            onPrev: () => loadRecommended(currentPage - 1),
            onNext: () => loadRecommended(currentPage + 1),
        },
    };
    renderRecommendedSongs(recommendedSongs, recommendedOptions);
}
// Asocia los controles del DOM una vez que todo está listo.
function attachControls() {
    audio = document.getElementById('player');
    playButton = document.getElementById('play');
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');
    playButton?.addEventListener('click', togglePlayback);
    nextButton?.addEventListener('click', handleNext);
    prevButton?.addEventListener('click', handlePrev);
    audio?.addEventListener('play', updatePlayButtonLabel);
    audio?.addEventListener('pause', updatePlayButtonLabel);
    audio?.addEventListener('ended', () => {
        const next = playlist.nextSong();
        if (next) {
            playSong(next);
            refreshUI();
        }
        else {
            updatePlayButtonLabel();
        }
    });
    updatePlayButtonLabel();
}
// Trae una página de recomendaciones y actualiza el estado visual.
async function loadRecommended(page) {
    if (isLoadingRecommendations || page < 1)
        return;
    isLoadingRecommendations = true;
    refreshUI();
    try {
        const result = await fetchSongs(page, PAGE_SIZE);
        recommendedSongs = result.songs;
        hasMoreRecommendations = result.hasMore;
        currentPage = page;
    }
    finally {
        isLoadingRecommendations = false;
        refreshUI();
    }
}
// Punto de entrada cuando el script se ejecuta en el navegador.
async function initialize() {
    loadSong(null);
    refreshUI();
    attachControls();
    await loadRecommended(1);
}
initialize().catch((error) => console.error('Error al iniciar la aplicación:', error));
//# sourceMappingURL=main.js.map