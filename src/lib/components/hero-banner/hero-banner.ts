import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rw-hero-banner',
  imports: [],
  template: `
    <section class="mx-auto w-full max-w-app bg-primary py-12 text-center md:pt-16">
      <div class="mx-auto w-full max-w-app px-4 md:px-6 lg:px-8">
        <div class="sr-only">
          <h1>RealWorld Angular</h1>
          <p>
            This is the Angular starter app of the
            <a
              href="https://github.com/realworld-angular/realworld-angular"
              target="_blank"
              rel="noopener noreferrer"
              >RealWorld Angular open source project</a
            >.
          </p>
        </div>
        <div class="mx-auto max-w-[min(460px,100%)]">
          <img
            class="block h-auto w-full"
            src="/images/realworld-angular-banner.png"
            width="460"
            height="120"
            alt=""
            decoding="async"
            priority
          />
        </div>
        <p class="mt-5">
          <span class="text-2xl font-bold uppercase text-accent">{{ editionVariant }}</span
          ><span class="ms-2 text-2xl uppercase text-white/45">edition</span>
        </p>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBanner {
  public readonly editionVariant = 'Starter';
}
