import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-back-navigation',
    templateUrl: './back-navigation.component.html',
    styleUrls: ['./back-navigation.component.scss']
})
export class BackNavigationComponent implements OnInit {

    @Input() text: string;
    @Input() icons: any = {};

    constructor(public translate: TranslateService) {
    }

    ngOnInit(): void {
    }

    getSource(path: string): string{
        return environment.API_URL + path;
      }

}
