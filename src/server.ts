import '@angular/compiler';
import { mergeApplicationConfig } from '@angular/core';
import { createServerHandler } from '@benjavicente/angular-start-experimental/server';
import type { Register } from '@benjavicente/angular-router-experimental';
import { App } from './app';
import { appConfig } from './app.config';
import { appConfigServer } from './app.config.server';

export default {
  fetch: createServerHandler<Register>(App, mergeApplicationConfig(appConfig, appConfigServer), {
    document:
      '<!doctype html><html lang="en"><head></head><body><rw-app-root></rw-app-root></body></html>',
  }),
};
