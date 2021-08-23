import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-primary-btn',
    templateUrl: './primary-btn.component.html',
    styleUrls: ['./primary-btn.component.scss']
})
export class PrimaryBtnComponent implements OnInit {

    @Input()
    text: string;

    @Input()
    iconUrl: string;

    @Input()
    width = '100%';

    @Input()
    isDisabled: boolean;

    constructor(public translate: TranslateService) {
    }

    ngOnInit(): void {
    }

}
