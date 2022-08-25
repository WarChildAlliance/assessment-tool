import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-action-btn',
    templateUrl: './action-btn.component.html',
    styleUrls: ['./action-btn.component.scss']
})
export class ActionBtnComponent implements OnInit {

    @Input()
    type: 'primary' | 'secondary' = 'primary';

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
