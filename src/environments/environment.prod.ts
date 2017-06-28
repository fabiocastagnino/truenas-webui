// Angular 2
// rc2 workaround
import { enableDebugTools, disableDebugTools } from '@angular/platform-browser';
import { enableProdMode, ApplicationRef, ErrorHandler } from '@angular/core';
import * as Raven from 'raven-js';
// Environment Providers
let PROVIDERS: any[] = [
    // common env directives
];

// Angular debug tools in the dev console
// https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
let _decorateModuleRef = function identity<T>(value: T): T { return value; };

// Sentry Error handling for production mode


export const environment = {
  remote: '127.0.0.1',
  port: '',
  production: true
};

export class RavenErrorHandler implements ErrorHandler {
    handleError(err: any): void {
        Raven.captureException(err.originalError);
    }
}

// Production
// https://github.com/qdouble/angular-webpack2-starter/issues/263
//disableDebugTools();
enableProdMode();

Raven
    .config('https://e3a2219083e241589cb154b90feeb26c@sentry.ixsystems.com/3')
    .install();

PROVIDERS = [
    ...PROVIDERS,
    { provide: ErrorHandler, useClass: RavenErrorHandler }
    // custom providers in production
];

export const decorateModuleRef = _decorateModuleRef;

export const ENV_PROVIDERS = [
    ...PROVIDERS
];
