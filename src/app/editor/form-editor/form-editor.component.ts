import { Component, effect, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KeyValuePipe, NgIf } from '@angular/common';
import { ConfigItem, CssService } from '../service/css.service';
import { InputComponent } from '../input/input.component';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, KeyValuePipe, InputComponent],
  templateUrl: './form-editor.component.html',
  styleUrl: './form-editor.component.scss',
})
export class FormEditorComponent {
  @Input() set component(val: string) {
    this.selectedComponent = val;
    if (this.nestedItemMap[val]) {
      this.selectedComponentItems = this.nestedItemMap[val];
    }
  }

  @Input() orderedGroups?: string[];

  formConfig?: FormGroup; // form control group for each editable css variable
  groups: string[] = []; // group names of css variables
  nestedItemMap: Record<string, Record<string, ConfigItem>> = {}; // grouped the variables
  selectedComponentItems: Record<string, ConfigItem> = {};
  selectedComponent?: string;

  constructor(
    private fb: FormBuilder,
    private cssService: CssService
  ) {
    effect(() => {
      // once the css variables are loaded in css service, load them into the form editor
      if (this.cssService.cssConfigItemsMap()) {
        const configItems = Object.values(this.cssService.cssConfigItemsMap());
        if (configItems.length) {
          this.setFormConfig(configItems);
        }
        if (this.selectedComponent) {
          this.selectedComponentItems = this.nestedItemMap[this.selectedComponent];
        }
      }
    });
  }

  onUpdateValue(variableName: string) {
    const value = this.formConfig?.get(variableName)?.value;
    this.cssService.updateCustomStyles(variableName, value)
  }

  private setFormConfig(cssConfigItems: ConfigItem[]) {
    this.nestedItemMap = {};

    const controls = cssConfigItems.reduce((acc, x) => {
      this.populateCssConfigMap(x);
      return { ...acc, [x.variableName]: x.value };
    }, {});
    this.formConfig = this.fb.group(controls);
    this.groups = this.orderedGroups ?? Object.keys(this.nestedItemMap);
  }

  /**
   * Group the css variable config base on their group name
   * @param item
   * @private
   */
  private populateCssConfigMap(item: ConfigItem) {
    let { group, variableName } = item;
    group = group.trim();

    if (!this.nestedItemMap[group]) {
      this.nestedItemMap[group] = {};
    }

    this.nestedItemMap[group][variableName] = item;
  }
}
