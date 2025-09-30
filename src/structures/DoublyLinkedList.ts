import { Song } from '../models/Song.js';

// Lista doblemente enlazada diseñada para manejar la playlist.
export class DoublyLinkedList implements Iterable<Song> {
  private head: Song | null = null;
  private tail: Song | null = null;
  private current: Song | null = null;

  // Inserta una canción al final y retorna el nuevo nodo.
  addSong(title: string, artist: string, url: string, cover?: string): Song {
    const newSong = new Song(title, artist, url, cover);
    if (!this.head) {
      this.head = this.tail = this.current = newSong;
    } else {
      this.tail!.next = newSong;
      newSong.previous = this.tail;
      this.tail = newSong;
    }
    return newSong;
  }

  // Elimina un nodo manteniendo los punteros coherentes.
  remove(song: Song | null): void {
    if (!song) return;

    if (song.previous) {
      song.previous.next = song.next;
    } else {
      this.head = song.next;
    }

    if (song.next) {
      song.next.previous = song.previous;
    } else {
      this.tail = song.previous;
    }

    if (this.current === song) {
      this.current = song.next ?? song.previous ?? null;
    }

    song.next = null;
    song.previous = null;
  }

  // Avanza el cursor a la siguiente canción cuando sea posible.
  nextSong(): Song | null {
    if (this.current?.next) {
      this.current = this.current.next;
    }
    return this.current;
  }

  // Retrocede el cursor a la canción anterior cuando sea posible.
  prevSong(): Song | null {
    if (this.current?.previous) {
      this.current = this.current.previous;
    }
    return this.current;
  }

  // Devuelve la canción actualmente seleccionada.
  getCurrent(): Song | null {
    return this.current;
  }

  // Define la canción que debe considerarse como actual.
  setCurrent(song: Song | null): void {
    this.current = song;
  }

  // Vacía la lista y desconecta cada nodo.
  clear(): void {
    let node = this.head;
    while (node) {
      const next = node.next;
      node.next = null;
      node.previous = null;
      node = next;
    }
    this.head = null;
    this.tail = null;
    this.current = null;
  }

  // Indica si la lista tiene o no elementos.
  isEmpty(): boolean {
    return this.head === null;
  }

  // Busca un nodo por su identificador generado.
  findById(id: string): Song | null {
    let node = this.head;
    while (node) {
      if (node.id === id) {
        return node;
      }
      node = node.next;
    }
    return null;
  }

  // Quita un nodo y lo inserta antes de otro (o lo envía al final si es null).
  moveBefore(song: Song, before: Song | null): void {
    if (!song || song === before) {
      return;
    }

    if (song.previous) {
      song.previous.next = song.next;
    } else {
      this.head = song.next;
    }

    if (song.next) {
      song.next.previous = song.previous;
    } else {
      this.tail = song.previous;
    }

    song.previous = null;
    song.next = null;

    if (!before) {
      if (!this.tail) {
        this.head = this.tail = song;
      } else {
        song.previous = this.tail;
        this.tail.next = song;
        this.tail = song;
      }
      return;
    }

    const beforePrev = before.previous;
    song.next = before;
    song.previous = beforePrev;
    before.previous = song;

    if (beforePrev) {
      beforePrev.next = song;
    } else {
      this.head = song;
    }
  }

  // Permite recorrer la lista con for..of.
  [Symbol.iterator](): Iterator<Song> {
    let node = this.head;
    return {
      next(): IteratorResult<Song> {
        if (node) {
          const value = node;
          node = node.next;
          return { value, done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}
