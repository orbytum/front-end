import { motion } from 'motion/react';
import { FolderKanban, Star, Loader2, Telescope } from 'lucide-react';
import { ProjetoResponse } from '../models/dto/projetos/Projeto';

interface SolarSystemProps {
  projetos: ProjetoResponse[];
  carregando?: boolean;
  nomeGrupo?: string | null;
}

const ORBITAS = [
  { raio: 165, duracao: 55, direcao: 1 },
  { raio: 300, duracao: 80, direcao: -1 },
];

const MAX_POR_ORBITA = 5;

function PlanetaProjeto({ projeto }: { projeto: ProjetoResponse }) {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        whileHover={{ scale: 1.2 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative w-16 h-16 bg-background rounded-2xl border border-border/40 flex items-center justify-center"
        title={projeto.titulo}
      >
        <FolderKanban className="w-8 h-8 text-primary" />
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Star className="w-3 h-3 text-primary-foreground" fill="currentColor" />
        </span>
      </motion.div>
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 max-w-[130px] truncate text-xs text-muted-foreground font-medium">
        {projeto.titulo}
      </span>
    </div>
  );
}

export function SolarSystem({ projetos, carregando = false, nomeGrupo }: SolarSystemProps) {
  const orbitas = ORBITAS.map((orbita, indice) => ({
    ...orbita,
    projetos: projetos.slice(
      indice * MAX_POR_ORBITA,
      indice * MAX_POR_ORBITA + MAX_POR_ORBITA
    ),
  }));

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-background">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, var(--card) 0%, var(--background) 70%)',
        }}
      />

      <div className="relative w-[820px] h-[820px] flex items-center justify-center">
        {/* Órbitas com os projetos favoritos */}
        {orbitas.map((orbita, oi) =>
          orbita.projetos.length === 0 ? null : (
            <div
              key={oi}
              className="absolute rounded-full border border-border/30"
              style={{ width: orbita.raio * 2, height: orbita.raio * 2 }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 * orbita.direcao }}
                transition={{ duration: orbita.duracao, repeat: Infinity, ease: 'linear' }}
              >
                {orbita.projetos.map((projeto, pi) => {
                  const angulo = (pi / orbita.projetos.length) * 360;
                  return (
                    <div
                      key={projeto.id}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${angulo}deg) translateY(-${orbita.raio}px)`,
                      }}
                    >
                      <motion.div
                        initial={{ rotate: -angulo }}
                        animate={{ rotate: -angulo - 360 * orbita.direcao }}
                        transition={{ duration: orbita.duracao, repeat: Infinity, ease: 'linear' }}
                      >
                        <PlanetaProjeto projeto={projeto} />
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          )
        )}

        {/* Núcleo Central - Grupo de Pesquisa */}
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center">
            <div className="text-center px-3">
              <div className="text-primary-foreground font-bold leading-tight truncate max-w-[100px] mx-auto">
                {nomeGrupo || 'GRUPO'}
              </div>
              <div className="text-primary-foreground/90 text-sm">Pesquisa</div>
            </div>
          </div>
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-primary whitespace-nowrap font-medium">
            Núcleo Central
          </div>
        </motion.div>

        {/* Partículas de fundo para efeito espacial */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-border rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Carregando */}
      {carregando && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando projetos favoritos...</span>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!carregando && projetos.length === 0 && (
        <div className="absolute bottom-8 right-8 max-w-xs bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border/30 text-center">
          <Telescope className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-foreground font-semibold mb-1">Nenhum projeto favorito</h3>
          <p className="text-sm text-muted-foreground">
            Favorite um projeto no Painel de Projetos para vê-lo orbitando aqui.
          </p>
        </div>
      )}

      {/* Legenda informativa */}
      <div className="absolute bottom-8 left-8 bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border/30">
        <h3 className="text-primary mb-4">Projetos Favoritos</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Centro: Grupo de Pesquisa</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" fill="currentColor" />
            <span>Planetas: projetos favoritos do grupo</span>
          </div>
        </div>
      </div>

      {/* Título no topo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <motion.h1
          className="text-foreground mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Sistema de Gestão Acadêmica
        </motion.h1>
      </div>
    </div>
  );
}
