import CharacterCreation from "@/components/game/CharacterCreation";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
      {/* Estilo Shiny de fondo consistente con la landing */}
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(64,230,255,0.1),transparent_70%)] animate-aurora"></div>
      </div>
      
      <div className="w-full h-full flex items-center justify-center p-4">
        <CharacterCreation />
      </div>
    </main>
  );
}
