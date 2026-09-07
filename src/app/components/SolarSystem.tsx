import { motion } from 'motion/react';
import { Shield, Hexagon, Box, FolderKanban, Calendar } from 'lucide-react';

export function SolarSystem() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0a1929]">
      <div className="absolute inset-0 bg-gradient-radial from-[#1a2942] via-[#0a1929] to-[#020911]" />
      <div className="relative w-[800px] h-[800px] flex items-center justify-center">
        <motion.div
          className="absolute w-[680px] h-[680px] rounded-full border border-[#3d4f62]/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          {/* Recursos Financeiros - Hexágono */}
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2"
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 bg-[#0a1929] rounded-lg shadow-[4px_4px_12px_#050c14,-4px_-4px_12px_#0f2638] flex items-center justify-center group hover:shadow-[inset_2px_2px_6px_#050c14,inset_-2px_-2px_6px_#0f2638] transition-shadow duration-300">
              <Hexagon className="w-6 h-6 text-[#ff8c42]" />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#8b96a5] whitespace-nowrap">Recursos</span>
          </motion.div>
          
          {/* Materiais - Cubo */}
          <motion.div
            className="absolute top-1/2 -right-6 -translate-y-1/2"
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 bg-[#0a1929] rounded-lg shadow-[4px_4px_12px_#050c14,-4px_-4px_12px_#0f2638] flex items-center justify-center group hover:shadow-[inset_2px_2px_6px_#050c14,inset_-2px_-2px_6px_#0f2638] transition-shadow duration-300">
              <Box className="w-6 h-6 text-[#ff8c42]" />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#8b96a5] whitespace-nowrap">Materiais</span>
          </motion.div>
          
          {/* Projetos */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2"
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 bg-[#0a1929] rounded-lg shadow-[4px_4px_12px_#050c14,-4px_-4px_12px_#0f2638] flex items-center justify-center group hover:shadow-[inset_2px_2px_6px_#050c14,inset_-2px_-2px_6px_#0f2638] transition-shadow duration-300">
              <FolderKanban className="w-6 h-6 text-[#ff8c42]" />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#8b96a5] whitespace-nowrap">Projetos</span>
          </motion.div>

          {/* Calendário com arco pontilhado */}
          <motion.div
            className="absolute top-1/2 -left-6 -translate-y-1/2"
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 bg-[#0a1929] rounded-lg shadow-[4px_4px_12px_#050c14,-4px_-4px_12px_#0f2638] flex items-center justify-center group hover:shadow-[inset_2px_2px_6px_#050c14,inset_-2px_-2px_6px_#0f2638] transition-shadow duration-300">
              <Calendar className="w-6 h-6 text-[#ff8c42]" />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#8b96a5] whitespace-nowrap">Calendário</span>

            {/* Arco pontilhado conectando projetos ao calendário */}
            <svg className="absolute -right-[280px] -top-[140px] w-[300px] h-[300px] pointer-events-none">
              <path
                d="M 10 150 Q 80 60, 150 10"
                stroke="#3d4f62"
                strokeWidth="2"
                strokeDasharray="8,8"
                fill="none"
                opacity="0.5"
              />
            </svg>
          </motion.div>
        </motion.div>
        
        {/* Segunda órbita */}
        <motion.div
          className="absolute w-[480px] h-[480px] rounded-full border border-[#3d4f62]/40"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          {/* Participantes - Pontos conectados */}
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * 240;
            const y = Math.sin(radian) * 240;
            
            return (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-[#ff8c42] rounded-full shadow-[0_0_12px_rgba(255,140,66,0.5)]"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                }}
                whileHover={{ scale: 1.5 }}
              >
                {/* Linha conectando ao supervisor */}
                <div 
                  className="absolute w-[1px] bg-[#3d4f62]/40 origin-center"
                  style={{
                    height: `${Math.sqrt(x * x + y * y) - 110}px`,
                    transform: `rotate(${angle + 180}deg) translateY(-100%)`
                  }}
                />
              </motion.div>
            );
          })}
          
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-xs text-[#8b96a5] whitespace-nowrap">Participantes</div>
        </motion.div>
        
        {/* Primeira órbita */}
        <motion.div
          className="absolute w-[280px] h-[280px] rounded-full border border-[#3d4f62]/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {/* Supervisor - Escudo */}
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2"
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-16 h-16 bg-[#0a1929] rounded-2xl shadow-[6px_6px_16px_#050c14,-6px_-6px_16px_#0f2638] flex items-center justify-center hover:shadow-[inset_3px_3px_8px_#050c14,inset_-3px_-3px_8px_#0f2638] transition-shadow duration-300">
              <Shield className="w-8 h-8 text-[#ff8c42] fill-[#ff8c42]/20" />
            </div>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-[#8b96a5] whitespace-nowrap font-medium">Supervisor</span>
          </motion.div>
        </motion.div>
        
        {/* Centro - Grupo de Pesquisa */}
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <motion.div
            className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ff8c42] via-[#ff6b35] to-[#f94c10] shadow-[0_0_60px_rgba(255,140,66,0.4)] flex items-center justify-center relative"
            animate={{
              boxShadow: [
                "0 0 60px rgba(255,140,66,0.4)",
                "0 0 80px rgba(255,140,66,0.6)",
                "0 0 60px rgba(255,140,66,0.4)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Inner glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#ffb366] to-transparent opacity-50" />
            
            <div className="relative text-center z-10">
              <div className="text-white font-bold">GRUPO</div>
              <div className="text-white/90 text-sm">Pesquisa</div>
            </div>
          </motion.div>
          
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-[#ff8c42] whitespace-nowrap font-medium">Núcleo Central</div>
        </motion.div>
        
        {/* Partículas de fundo para efeito espacial */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#3d4f62] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      {/* Legenda informativa */}
      <div className="absolute bottom-8 left-8 bg-[#0a1929]/80 backdrop-blur-sm p-6 rounded-2xl shadow-[6px_6px_16px_#050c14,-6px_-6px_16px_#0f2638] border border-[#3d4f62]/30">
        <h3 className="text-[#ff8c42] mb-4">Sistema Solar Acadêmico</h3>
        <div className="space-y-2 text-sm text-[#8b96a5]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff8c42]" />
            <span>Centro: Grupo de Pesquisa</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ff8c42]" />
            <span>1ª Órbita: Supervisor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff8c42]" />
            <span>2ª Órbita: Participantes</span>
          </div>
          <div className="flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-[#ff8c42]" />
            <span>3ª Órbita: Recursos e Materiais</span>
          </div>
        </div>
      </div>
      
      {/* Logo/Título no topo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <motion.h1 
          className="text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Sistema de Gestão Acadêmica
        </motion.h1>
        <motion.p 
          className="text-[#8b96a5]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Organização orbital de pesquisa
        </motion.p>
      </div>
    </div>
  );
}
