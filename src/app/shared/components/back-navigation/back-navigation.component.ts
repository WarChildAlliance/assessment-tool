import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-back-navigation',
    templateUrl: './back-navigation.component.html',
    styleUrls: ['./back-navigation.component.scss']
})
export class BackNavigationComponent implements OnInit {

    @Input()
    text: string;

    constructor(public translate: TranslateService) {
    }

    ngOnInit(): void {
    }

}
