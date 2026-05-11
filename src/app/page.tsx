"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { auth, loginWithGoogle } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export default function Home() {
  const router = useRouter();

  const handleStartGame = async () => {
    try {
      // Intentamos login anónimo si no hay usuario, para simplificar el flujo inicial
      // El usuario puede elegir Google después si lo desea
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      router.push('/create');
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  const handleLoginGoogle = async () => {
    try {
      await loginWithGoogle();
      router.push('/create');
    } catch (error) {
      console.error("Error con Google Auth:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-6xl font-bold tracking-tighter text-gradient animate-pulse">
          Codeverso History
        </h1>
        
        <p className="text-xl text-center max-w-2xl text-foreground/80">
          Una aventura épica impulsada por IA. Tu destino se escribe con cada elección.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={handleStartGame}
            className="btn-shiny px-8 py-3 rounded-full font-bold text-primary border-primary/20 hover:scale-105 active:scale-95 transition-transform"
          >
            NUEVA PARTIDA
          </button>
          <button 
            onClick={handleLoginGoogle}
            className="px-8 py-3 rounded-full font-bold bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-colors flex items-center gap-2"
          >
            INICIAR CON GOOGLE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
            <h3 className="text-primary font-bold mb-2">Narrativa IA</h3>
            <p className="text-sm text-foreground/60">Groq Llama 3.3 Versatile genera mundos dinámicos en tiempo real.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-colors">
            <h3 className="text-secondary font-bold mb-2">Combate Realista</h3>
            <p className="text-sm text-foreground/60">Sistema de dados puro donde la suerte y tus atributos deciden tu destino.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-colors">
            <h3 className="text-accent font-bold mb-2">Multi-Agente</h3>
            <p className="text-sm text-foreground/60">Agentes especializados en narración, diálogo y combate para una inmersión total.</p>
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
