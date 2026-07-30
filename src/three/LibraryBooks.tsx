import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../store";
import { DEFAULT_BOOKS, type Book } from "../data/library";
import { fetchBooks } from "../lib/supabase";
import { makeCoverTexture, makeSpineTexture } from "./textures";

const SHELF_X = 6.62;
const SHELF_Z0 = -5.32;
const SLOT_DZ = 0.235;
const ROW_Y = 1.375;

/** Where a pulled-out book hovers for inspection (in front of the shelf). */
const DISPLAY_POS = new THREE.Vector3(5.45, 1.72, -4.2);

const BOOK_W = 0.26; // depth into the shelf (x)
const BOOK_H = 0.34;
const BOOK_T = 0.17; // thickness (z) — chunky so clicks land

interface BookMeshProps {
  book: Book;
  index: number;
}

function BookMesh({ book, index }: BookMeshProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const slot = useMemo(
    () =>
      new THREE.Vector3(SHELF_X, ROW_Y + BOOK_H / 2 + 0.005, SHELF_Z0 + index * SLOT_DZ),
    [index]
  );

  const materials = useMemo(() => {
    const cover = makeCoverTexture(book.title, book.author, book.color);
    const spine = makeSpineTexture(book.title, book.color);
    const pages = new THREE.MeshStandardMaterial({ color: "#e9e2d0", roughness: 0.9 });
    const back = new THREE.MeshStandardMaterial({ color: book.color, roughness: 0.8 });
    return [
      pages, // +x fore edge
      new THREE.MeshStandardMaterial({ map: spine, roughness: 0.7 }), // -x spine
      pages, // +y
      pages, // -y
      new THREE.MeshStandardMaterial({ map: cover, roughness: 0.7 }), // +z front cover
      back, // -z back cover
    ];
  }, [book]);

  useEffect(() => {
    return () => materials.forEach((m) => m.dispose());
  }, [materials]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const state = useGame.getState();
    const selected = state.selectedBook?.id === book.id;
    const inLibrary = state.focus === "library";

    const target = selected
      ? DISPLAY_POS
      : hovered && inLibrary
        ? new THREE.Vector3(slot.x - 0.09, slot.y, slot.z)
        : slot;
    g.position.lerp(target, 0.14);

    const targetRotY = selected ? -Math.PI / 2 : 0;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRotY, 0.12);
  });

  return (
    <group
      ref={group}
      position={slot.toArray()}
      onClick={(e) => {
        const state = useGame.getState();
        if (state.focus !== "library") return;
        e.stopPropagation();
        state.setSelectedBook(state.selectedBook?.id === book.id ? null : book);
      }}
      onPointerOver={(e) => {
        if (useGame.getState().focus !== "library") return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh castShadow material={materials}>
        <boxGeometry args={[BOOK_W, BOOK_H, BOOK_T]} />
      </mesh>
    </group>
  );
}

export default function LibraryBooks() {
  const [books, setBooks] = useState<Book[]>(DEFAULT_BOOKS);

  useEffect(() => {
    let alive = true;
    fetchBooks().then((b) => {
      if (alive && b.length) setBooks(b.slice(0, 10));
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <group>
      {books.map((b, i) => (
        <BookMesh key={b.id} book={b} index={i} />
      ))}
    </group>
  );
}
