import { Component, Input } from '@angular/core';
import { BaseFormFieldComponent } from '../base-form-field/base-form-field.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent extends BaseFormFieldComponent<string> {
  @Input() label?: string;
  @Input() type = 'text';
}
