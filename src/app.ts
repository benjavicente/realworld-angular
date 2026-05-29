import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterProvider } from '@benjavicente/angular-router-experimental';

@Component({
  selector: 'rw-app-root',
  imports: [RouterProvider],
  template: '<router-provider />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App { }
