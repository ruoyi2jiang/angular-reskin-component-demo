import { Component, Input } from '@angular/core';
import { BaseFormFieldComponent } from '../base-form-field/base-form-field.component';

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [],
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss'
})
export class SwitchComponent extends BaseFormFieldComponent<boolean> {
  @Input() leftLabel?: string;
  @Input() rightLabel?: string;
}
