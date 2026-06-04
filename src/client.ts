import { publishFacade } from '@angular/compiler';

// Vite can tree-shake the compiler entry side effect; register the facade explicitly.
publishFacade(globalThis);

async function main(): Promise<void> {
  const [{ bootstrapTanstackStartApplication }, { App }, { appConfig }] = await Promise.all([
    import('@benjavicente/angular-start-experimental/client'),
    import('./app'),
    import('./app.config'),
  ]);

  await bootstrapTanstackStartApplication(App, appConfig.providers);
}

main().catch((error: unknown) => {
  console.error(error);
});
