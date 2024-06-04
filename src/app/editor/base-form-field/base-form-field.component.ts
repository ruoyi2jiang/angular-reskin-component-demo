import { Component, EventEmitter, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-base-form-field',
  template: '',
  standalone: true,
})
export class BaseFormFieldComponent<T> implements ControlValueAccessor {
  @Output() updated = new EventEmitter<T>();
  value!: T | null;

  constructor(@Self() @Optional() public control: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  writeValue(value: T | null): void {
    this.value = value;
  }

  // set value to null if it's empty string
  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = (value: T | null) => {
      fn(value === '' ? null : value);
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onValueChanged(value: T): void {
    if (value !== this.value) {
      this.value = value;
      this.onChange(value);
      this.updated.emit(value);
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  private onChange: (value: T) => void = () => {};

  private onTouched: () => void = () => {};
}
