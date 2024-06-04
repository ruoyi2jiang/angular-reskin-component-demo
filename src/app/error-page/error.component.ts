import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'studio-error-component',
    standalone: true,
    imports: [],
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
})
export class ErrorComponent {
    constructor(private location: Location) {}
    goBack() {
        this.location.back();
    }
}
