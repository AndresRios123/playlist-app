// Imagen de portada por defecto si la canción no tiene cover
const PLACEHOLDER_COVER = 'https://via.placeholder.com/200?text=No+Cover';
/* --------------------------------------------------------
   Configura arrastrar y soltar (drag & drop) en cada canción
   de la playlist para permitir reordenar elementos.
--------------------------------------------------------- */
function setupDragAndDrop(container, // Contenedor principal de la playlist
item, // Elemento <li> de la canción
song, // Canción asociada al item
onReorder // Acción de reordenamiento
) {
    item.draggable = true;
    item.dataset.songId = song.id;
    // Evento al iniciar el arrastre
    item.addEventListener('dragstart', (event) => {
        item.classList.add('opacity-50'); // Visual: se ve transparente
        event.dataTransfer?.setData('text/plain', song.id); // Guardamos el id
        event.dataTransfer?.setDragImage(item, 0, 0); // Imagen de arrastre
        event.dataTransfer.effectAllowed = 'move'; // Movimiento permitido
    });
    // Evento al terminar el arrastre
    item.addEventListener('dragend', () => {
        item.classList.remove('opacity-50');
    });
    // Evento cuando un elemento pasa por encima
    item.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        item.classList.add('border', 'border-info'); // Resalta el destino
    });
    // Evento cuando el elemento sale de un área
    item.addEventListener('dragleave', () => {
        item.classList.remove('border', 'border-info');
    });
    // Evento cuando se suelta un item sobre otro
    item.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        item.classList.remove('border', 'border-info');
        const sourceId = event.dataTransfer?.getData('text/plain');
        if (!sourceId || sourceId === song.id)
            return; // Evita soltar sobre sí mismo
        onReorder(sourceId, song.id); // Llama al callback para reordenar
    });
    // Permitir soltar en el contenedor (como último lugar de la lista)
    container.ondragover = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };
    container.ondrop = (event) => {
        event.preventDefault();
        const sourceId = event.dataTransfer?.getData('text/plain');
        if (!sourceId)
            return;
        onReorder(sourceId, null); // Si se suelta en el contenedor, va al final
    };
}
/* --------------------------------------------------------
   Renderiza la lista de reproducción:
   - Canciones como elementos <li>
   - Botones de reproducir y eliminar
   - Soporte para drag & drop
--------------------------------------------------------- */
export function renderPlaylist(list, options) {
    const container = document.getElementById('playlist');
    if (!container)
        return;
    container.innerHTML = '';
    // Si la lista está vacía
    if (list.isEmpty()) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'list-group-item bg-dark text-white text-center';
        emptyItem.textContent = 'Tu playlist está vacía. Agrega canciones desde las recomendaciones.';
        container.appendChild(emptyItem);
        container.ondragover = null;
        container.ondrop = null;
        return;
    }
    // Recorremos cada canción en la lista
    for (const song of list) {
        const item = document.createElement('li');
        item.className = 'list-group-item bg-dark text-white d-flex justify-content-between align-items-center';
        // Resaltar si es la canción actual
        if (options.currentSong === song) {
            item.classList.add('active');
        }
        // Configuramos drag & drop
        setupDragAndDrop(container, item, song, options.onReorder);
        // Texto con título y artista
        const text = document.createElement('span');
        text.textContent = `${song.title} - ${song.artist}`;
        // Contenedor para botones
        const actions = document.createElement('div');
        // Botón de reproducir
        const playButton = document.createElement('button');
        playButton.className = 'btn btn-sm btn-success mx-1';
        playButton.textContent = '▶';
        playButton.title = 'Reproducir';
        playButton.onclick = () => options.onPlay(song);
        // Botón de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-danger mx-1';
        deleteButton.textContent = '🗑';
        deleteButton.title = 'Eliminar de la playlist';
        deleteButton.onclick = () => options.onRemove(song);
        actions.appendChild(playButton);
        actions.appendChild(deleteButton);
        item.appendChild(text);
        item.appendChild(actions);
        container.appendChild(item);
    }
}
/* --------------------------------------------------------
   Renderiza la sección de canciones recomendadas:
   - Muestra tarjetas con título, artista y portada
   - Botones para reproducir/agregar
   - Control de paginación
--------------------------------------------------------- */
export function renderRecommendedSongs(songs, options) {
    const container = document.querySelector('.song-grid');
    if (!container)
        return;
    container.innerHTML = '';
    // Si está cargando
    if (options.isLoading) {
        const loading = document.createElement('div');
        loading.className = 'col-12 text-center text-secondary';
        loading.textContent = 'Cargando recomendaciones...';
        container.appendChild(loading);
        // Si no hay canciones recomendadas
    }
    else if (songs.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'col-12 text-center text-secondary';
        emptyMessage.textContent = 'No se encontraron recomendaciones por ahora.';
        container.appendChild(emptyMessage);
        // Renderiza cada canción como una tarjeta
    }
    else {
        for (const song of songs) {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'col-6 col-md-3';
            const cover = song.cover ?? PLACEHOLDER_COVER;
            const hasPlay = typeof options.onPlay === 'function';
            // Estructura de la tarjeta
            cardWrapper.innerHTML = `
        <div class="card bg-dark text-white h-100">
          <img src="${cover}" class="card-img-top" alt="Portada de ${song.title}">
          <div class="card-body text-center d-flex flex-column">
            <h6 class="card-title">${song.title}</h6>
            <p class="card-text small mb-3">${song.artist}</p>
            <div class="mt-auto d-grid gap-2">
              ${hasPlay ? '<button class="btn btn-success btn-sm" data-role="play">▶ Reproducir</button>' : ''}
              <button class="btn btn-outline-info btn-sm" data-role="add">➕ Agregar a playlist</button>
            </div>
          </div>
        </div>
      `;
            // Eventos para los botones
            if (hasPlay) {
                cardWrapper
                    .querySelector('[data-role="play"]')
                    ?.addEventListener('click', () => options.onPlay?.(song));
            }
            cardWrapper
                .querySelector('[data-role="add"]')
                ?.addEventListener('click', () => options.onAdd(song));
            container.appendChild(cardWrapper);
        }
    }
    // Controles de paginación
    const paginationContainer = document.getElementById('recommended-pagination');
    if (!paginationContainer)
        return;
    paginationContainer.innerHTML = '';
    const pagination = options.pagination;
    if (!pagination)
        return;
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Página ${pagination.page}`;
    const controls = document.createElement('div');
    // Botón anterior
    const prevButton = document.createElement('button');
    prevButton.className = 'btn btn-outline-light btn-sm me-2';
    prevButton.textContent = 'Anterior';
    prevButton.disabled = !pagination.hasPrev || !!options.isLoading;
    prevButton.onclick = () => pagination.onPrev();
    // Botón siguiente
    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-outline-light btn-sm';
    nextButton.textContent = 'Siguiente';
    nextButton.disabled = !pagination.hasNext || !!options.isLoading;
    nextButton.onclick = () => pagination.onNext();
    controls.appendChild(prevButton);
    controls.appendChild(nextButton);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(controls);
}
//# sourceMappingURL=ui.js.map