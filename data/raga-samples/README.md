# Raga Sample Imports

Use this folder for consented raga training samples.

## WhatsApp Export Flow

1. In WhatsApp, open the chat that contains the raga recordings.
2. Export the chat **with media**.
3. Unzip the export into:

```text
data/raga-samples/whatsapp-export
```

4. Run:

```bash
PATH=/Users/ramanujanmk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/ramanujanmk/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH node scripts/import-whatsapp-ragas.mjs
```

The importer copies audio into:

```text
data/raga-samples/categorized/<raga-name>/
```

It detects raga names from audio filenames and nearby WhatsApp chat text. Files it cannot classify go to:

```text
data/raga-samples/categorized/_uncategorized/
```

Preferred recording labels:

```text
Mohana_Csharp_singer01_arohana_take01.wav
Mohana_Csharp_singer01_avarohana_take01.wav
Mohana_Csharp_singer01_phrase01_take01.wav
```

