"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, loginWithGoogle, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingCharacter, setCheckingCharacter] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setCheckingCharacter(true);
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        await checkExistingCharacter(loggedUser.uid);
      }
    } catch (error) {
      console.error("Error en el inicio de sesión con Google:", error);
    } finally {
      setCheckingCharacter(false);
    }
  };

  const checkExistingCharacter = async (uid: string) => {
    try {
      const q = query(collection(db, "personajes"), where("usuarioId", "==", uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Si ya tiene personaje, vamos al juego
        router.push('/game');
      } else {
        // Si no tiene personaje, vamos a la creación
        router.push('/create');
      }
    } catch (error) {
      console.error("Error al buscar personaje:", error);
      router.push('/create'); // Por defecto a creación si hay error
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground relative overflow-hidden">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-6xl font-bold tracking-tighter text-gradient animate-pulse">
          Codeverso History
        </h1>
        
        <p className="text-xl text-center max-w-2xl text-foreground/80">
          Una aventura épica impulsada por IA. Tu destino se escribe con cada elección.
        </p>

        <div className="flex flex-col items-center gap-6 mt-4">
          {!user ? (
            <button 
              onClick={handleLogin}
              disabled={checkingCharacter}
              className="btn-shiny px-12 py-4 rounded-full font-bold text-primary border-primary/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 text-lg"
            >
              {checkingCharacter ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  VERIFICANDO...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17 6.29,22 12.19,22C18.14,22 21.34,17.5 21.34,12C21.34,11.63 21.35,11.1 21.35,11.1V11.1Z" />
                  </svg>
                  ENTRAR AL CODEVERSO
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-primary font-bold">Bienvenido, {user.displayName?.split(' ')[0]}</p>
              <button 
                onClick={() => checkExistingCharacter(user.uid)}
                disabled={checkingCharacter}
                className="btn-shiny px-12 py-4 rounded-full font-bold text-primary border-primary/20 hover:scale-105 transition-transform text-lg"
              >
                {checkingCharacter ? "CARGANDO..." : "CONTINUAR AVENTURA"}
              </button>
              <button 
                onClick={() => auth.signOut()}
                className="text-xs text-foreground/40 hover:text-accent transition-colors uppercase tracking-widest font-bold"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <h3 className="text-primary font-bold mb-2 uppercase tracking-tighter">Narrativa IA</h3>
            <p className="text-xs text-foreground/60 leading-relaxed text-pretty">Groq Llama 3.3 Versatile genera mundos dinámicos en tiempo real basados en tus decisiones pasadas.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-colors">
            <h3 className="text-secondary font-bold mb-2 uppercase tracking-tighter">Combate por Dados</h3>
            <p className="text-xs text-foreground/60 leading-relaxed text-pretty">Sistema de D20 puro en el servidor. Tus atributos y la suerte deciden si vives para contar la historia.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-colors">
            <h3 className="text-accent font-bold mb-2 uppercase tracking-tighter">Persistencia Real</h3>
            <p className="text-xs text-foreground/60 leading-relaxed text-pretty">Tu personaje, grupo y progreso se guardan de forma segura en la nube para continuar en cualquier equipo.</p>
          </div>
        </div>
      </div>
      
      {/* Background Aurora Effect */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(64,230,255,0.1),transparent_50%)] animate-aurora"></div>
      </div>
    </main>
  );
}
