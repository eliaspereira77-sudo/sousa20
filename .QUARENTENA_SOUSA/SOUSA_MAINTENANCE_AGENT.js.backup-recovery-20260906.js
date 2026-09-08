function inspectHygiene(target) {

  const absoluteTarget = path.resolve(target);

  if (!fs.existsSync(absoluteTarget)) {
    throw new Error(
      `Alvo não encontrado: ${absoluteTarget}`
    );
  }

  const stat = fs.statSync(absoluteTarget);

  // Higiene aceita arquivo OU diretório.
  // Quando recebe diretório, ele próprio é o escopo da inspeção.
  const inspection = stat.isDirectory()
    ? {
        target: absoluteTarget,
        directory: absoluteTarget,
        name: path.basename(absoluteTarget),
        extension: '',
        size: 0,
        content: null,
        test: {
          success: true,
          skipped: true,
          reason: 'Alvo é diretório; teste de sintaxe não se aplica.'
        }
      }
    : inspect(absoluteTarget);

  const directory = inspection.directory;

  const files =
    fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry => {
        const filePath =
          path.join(directory, entry.name);

        let hash = null;

        try {
          hash = hashFile(filePath);
        } catch (_) {
          hash = null;
        }

        return {
          name: entry.name,
          path: filePath,
          size: fs.statSync(filePath).size,
          hash
        };
      });

  const hashGroups = {};

  for (const file of files) {
    if (!file.hash) continue;

    if (!hashGroups[file.hash]) {
      hashGroups[file.hash] = [];
    }

    hashGroups[file.hash].push(file);
  }

  const duplicates =
    Object.values(hashGroups)
      .filter(group => group.length > 1);

  const quarantineCandidates =
    files.filter(file =>
      /quarantine|quarentena|\.quarantine|\.quarantine-/i
        .test(file.name)
    );

  const residueCandidates =
    files.filter(file =>
      /backup|bak|old|tmp|temp|copy|copia|\.pre-|\.auto-repair-/i
        .test(file.name)
    );

  const noiseCandidates =
    files.filter(file =>
      /\.log$|\.tmp$|\.temp$|~$|\.cache$/i
        .test(file.name)
    );

  const targetBaseName =
    inspection.extension
      ? path.basename(
          inspection.name,
          inspection.extension
        )
      : inspection.name;

  const relatedFiles =
    stat.isDirectory()
      ? []
      : files.filter(file =>
          file.name !== inspection.name &&
          file.name.includes(targetBaseName)
        );

  return {
    target: inspection.target,
    directory,
    inventory: {
      totalFiles: files.length,
      totalBytes:
        files.reduce(
          (sum, file) => sum + file.size,
          0
        )
    },

    duplicates: {
      detected: duplicates.length > 0,
      groups: duplicates
    },

    quarantine: {
      detected: quarantineCandidates.length > 0,
      candidates: quarantineCandidates
    },

    residues: {
      detected: residueCandidates.length > 0,
      candidates: residueCandidates
    },

    noise: {
      detected: noiseCandidates.length > 0,
      candidates: noiseCandidates
    },

    possibleOrphans: {
      detected: false,
      candidates: [],
      reason:
        'Necessita análise de referências/dependências antes de qualquer classificação definitiva.'
    },

    possibleIncompatibilities: {
      detected: false,
      candidates: [],
      reason:
        'A incompatibilidade deve ser confirmada por validação técnica.'
    },

    relatedFiles,

    safety: {
      automaticDeletion: false,
      productionWrite: false,
      sandboxFirst: true,
      requiresValidation: true
    }
  };
}
