async function main(): Promise<void> {
  if (import.meta.env.DEV) {
    await import('@angular/compiler');
  }

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
