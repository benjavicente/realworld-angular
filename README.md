![Unrealworld Angular banner](src/assets/images/unrealworld-angular-banner.png)

# Unrealworld Angular playground

This is a fork of the [RealWorld Angular](https://github.com/realworld-angular/realworld-angular) project, but refractored to be as less “Angular” as possible while still being Angular. Basically an unrealistic Angular application, witout going to into the experimental territory by using agnostic tools as a fundation.

## Differences with RealWorld Angular

- Vite replacing Angular CLI (`@angular/build` pipeline) with Oxc Experimental Angular compiler.
- TanStack Query replacing every usage of Resource
- ofetch replacing Angular's HttpClient
- TanStack Router/Start replacing Angular Router
- TanStack Form replacing Angular signal Forms
- Tailwind CSS replacing scoped CSS
- Store-like patterns replacing Services (no `@Injectable` used in the app code)
- Testing Library as the testing harness
- No `angular.json`, direct tasks through `package.json`
- Oxlint and Oxfmt for linting and formatting
- No directives

The outcome of this experiment may be closer to a real React application than a real world Angular application.
