import { Component } from '@angular/core';
import { ButtonComponent } from '../components/button/button.component';
import { FormEditorComponent } from './form-editor/form-editor.component';
import { SwitchComponent } from './switch/switch.component';
import { CodeEditorComponent } from './code-editor/code-editor.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [ButtonComponent, FormEditorComponent, SwitchComponent, CodeEditorComponent],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  componentName = 'button';
  codeView = false;
}
