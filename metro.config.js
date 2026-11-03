// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');

// Patch Node fs.promises on Windows to gracefully retry on EMFILE (file descriptor exhaustion)
if (process.platform === 'win32') {
  const origReadFile = fs.promises.readFile;
  if (typeof origReadFile === 'function') {
    fs.promises.readFile = async function (...args) {
      let attempts = 0;
      while (true) {
        try {
          return await origReadFile.apply(this, args);
        } catch (err) {
          if ((err?.code === 'EMFILE' || err?.code === 'ENFILE') && attempts < 10) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, attempts * 25));
            continue;
          }
          throw err;
        }
      }
    };
  }

  const origOpen = fs.promises.open;
  if (typeof origOpen === 'function') {
    fs.promises.open = async function (...args) {
      let attempts = 0;
      while (true) {
        try {
          return await origOpen.apply(this, args);
        } catch (err) {
          if ((err?.code === 'EMFILE' || err?.code === 'ENFILE') && attempts < 10) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, attempts * 25));
            continue;
          }
          throw err;
        }
      }
    };
  }

  // Also patch BinaryFileStore directly if available in @expo/metro-config
  try {
    const { FileStore } = require('@expo/metro-config/build/binary-file-store');
    if (FileStore && FileStore.prototype) {
      const origGet = FileStore.prototype.get;
      if (typeof origGet === 'function') {
        FileStore.prototype.get = async function (key) {
          let attempts = 0;
          while (true) {
            try {
              return await origGet.call(this, key);
            } catch (err) {
              if ((err?.code === 'EMFILE' || err?.code === 'ENFILE') && attempts < 10) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, attempts * 25));
                continue;
              }
              throw err;
            }
          }
        };
      }

      const origSet = FileStore.prototype.set;
      if (typeof origSet === 'function') {
        FileStore.prototype.set = async function (key, value) {
          let attempts = 0;
          while (true) {
            try {
              return await origSet.call(this, key, value);
            } catch (err) {
              if ((err?.code === 'EMFILE' || err?.code === 'ENFILE') && attempts < 10) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, attempts * 25));
                continue;
              }
              throw err;
            }
          }
        };
      }
    }
  } catch {
    // If internal binary-file-store path shifts in future versions, fs patch remains active
  }
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Block extraneous directories from being watched to avoid exhausting Windows file handles
config.resolver.blockList = [
  /.*\/android\/.*/,
  /.*\/ios\/.*/,
  /.*\/dist\/.*/,
  /.*\/\.git\/.*/,
  /.*\/\.vscode\/.*/,
  /.*\/\.claude\/.*/,
];

module.exports = config;
