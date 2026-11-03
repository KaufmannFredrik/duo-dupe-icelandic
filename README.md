# TÖLVA

Learn Icelandic from the oracle in the machine.

TÖLVA is a free, static, grammar-first website for learning Icelandic: a unit path, many exercise types, case and ending practice, audio, spaced repetition, and Norwegian Bokmål as a first-class base language next to English. It is plain HTML, CSS and JavaScript modules with no runtime build step, so it can be served from GitHub Pages.

**Status:** Phase 0 (repository setup and API probe). See [docs/api-report.md](docs/api-report.md) and [docs/DECISIONS.md](docs/DECISIONS.md).

## Requirements

- Node.js 20 or newer (for the data and test scripts only; the site itself needs no Node).
- `bzip2` on the PATH to read Tatoeba exports (included with macOS, Linux and Git for Windows; on Windows, run the scripts from Git Bash).
- Python 3.11 or newer later, for GreynirCorrect content checks.

## Commands

```sh
# Probe every external API and dataset; writes docs/api-report.md (about 50 small requests)
node scripts/probe-apis.mjs

# Also download the bulk datasets into .cache/ (about 150 MB) and measure coverage
node scripts/probe-apis.mjs --coverage

# Download the bulk datasets again
node scripts/probe-apis.mjs --coverage --refresh
```

To keep the download cache outside the repository (for example when the repo is in a synced folder), set `TOLVA_CACHE`:

```sh
TOLVA_CACHE=~/tolva-cache node scripts/probe-apis.mjs --coverage
```

More commands (dev server, data build, tests, deployment) arrive with later phases.

## License

Code: MIT, see [LICENSE](LICENSE). Generated data in `/data`: CC BY-SA 4.0 and others, see [data/LICENSE.md](data/LICENSE.md).
