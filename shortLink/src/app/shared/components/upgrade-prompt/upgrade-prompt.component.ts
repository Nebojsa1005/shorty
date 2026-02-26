import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-upgrade-prompt',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './upgrade-prompt.component.html',
  styleUrl: './upgrade-prompt.component.scss',
})
export class UpgradePromptComponent {
  @Input() message: string = 'Upgrade your plan to unlock this feature.';
}
