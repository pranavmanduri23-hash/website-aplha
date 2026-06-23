#!/usr/bin/env node

(async () => {
  try {
    const { build } = await import('vite');
    await build({ root: 'client' });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
