import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-back-navigation',
    templateUrl: './back-navigation.component.html',
    styleUrls: ['./back-navigation.component.scss']
})
export class BackNavigationComponent implements OnInit {

    @Input()
    text: string;

    constructor() {
    }

    ngOnInit(): void {
    }

}
