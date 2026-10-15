#!/usr/bin/env bash
# Copia COMPLETA y verificable de producción de Supabase (solo lectura), fuera del repo y con permisos restringidos.
# Contiene datos personales y hashes de contraseña: queda en ~/migracion-tvpro/<fecha> (700), nunca en git ni en un chat.
# Uso: scripts/migracion/snapshot-completo.sh [carpeta]     (por defecto ~/migracion-tvpro/<AAAAMMDD-HHMMSS>)
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${1:-$HOME/migracion-tvpro/$(date -u +%Y%m%d-%H%M%S)}"
umask 077
mkdir -p "$DEST"
export MIGRACION_OUT="$DEST"
echo "== Snapshot en $DEST"
node "$DIR/07-exportar-datos.mjs"
node "$DIR/09-exportar-usuarios.mjs"
node "$DIR/05-copiar-storage.mjs" --yes
node "$DIR/08-generar-import.mjs" --real
node "$DIR/08-generar-import.mjs"
# Manifiesto: sha256 de cada archivo + fecha; permite comprobar después que nada se alteró (sha256sum -c MANIFEST.sha256).
( cd "$DEST" && find . -type f ! -name MANIFEST.sha256 -print0 | sort -z | xargs -0 sha256sum > MANIFEST.sha256 )
chmod -R go-rwx "$DEST"
echo "== Listo: $(find "$DEST" -type f ! -name MANIFEST.sha256 | wc -l) archivos, $(du -sh "$DEST" | cut -f1). Verificar: (cd $DEST && sha256sum -c MANIFEST.sha256)"
