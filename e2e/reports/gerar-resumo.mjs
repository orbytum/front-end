import fs from "node:fs";
import path from "node:path";

const arquivo = path.resolve("test-results/results.json");

if (!fs.existsSync(arquivo)) {
  console.error("results.json não encontrado. Rode a suíte primeiro.");
  process.exit(1);
}

const dados = JSON.parse(fs.readFileSync(arquivo, "utf8"));
const stats = dados.stats ?? {};
const modulos = new Map();

function coletar(suite, modulo) {
  const nomeModulo = modulo ?? suite.title ?? "Geral";

  for (const spec of suite.specs ?? []) {
    for (const teste of spec.tests ?? []) {
      const resultado = teste.results?.[0] ?? {};
      const status = resultado.status ?? "unknown";
      const duracao = resultado.duration ?? 0;
      const atual = modulos.get(nomeModulo) ?? {
        total: 0,
        ok: 0,
        falha: 0,
        pulado: 0,
        duracao: 0,
      };
      atual.total += 1;
      atual.duracao += duracao;
      if (status === "passed") atual.ok += 1;
      else if (status === "skipped") atual.pulado += 1;
      else atual.falha += 1;
      modulos.set(nomeModulo, atual);
    }
  }

  for (const filho of suite.suites ?? []) {
    coletar(filho, nomeModulo);
  }
}

for (const suite of dados.suites ?? []) {
  coletar(suite, suite.title);
}

const passaram = stats.expected ?? 0;
const falharam = stats.unexpected ?? 0;
const pulados = stats.skipped ?? 0;
const duracao = stats.duration ?? 0;
const total = passaram + falharam + pulados;

const linhas = [];
linhas.push("# Resultados dos testes E2E");
linhas.push("");
linhas.push(`- Total: **${total}**`);
linhas.push(`- Passaram: **${passaram}**`);
linhas.push(`- Falharam: **${falharam}**`);
linhas.push(`- Pulados: **${pulados}**`);
linhas.push(`- Duração: **${(duracao / 1000).toFixed(1)}s**`);
linhas.push("");
linhas.push("| Módulo | Total | Passou | Falhou | Pulado | Duração |");
linhas.push("|---|---:|---:|---:|---:|---:|");

for (const [nome, dadosModulo] of modulos) {
  linhas.push(
    `| ${nome} | ${dadosModulo.total} | ${dadosModulo.ok} | ${dadosModulo.falha} | ${dadosModulo.pulado} | ${(dadosModulo.duracao / 1000).toFixed(1)}s |`,
  );
}

fs.writeFileSync("test-results/resumo.md", linhas.join("\n"));
console.log("Resumo gerado em test-results/resumo.md");
