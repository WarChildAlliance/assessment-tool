import { Component, Input, OnInit } from '@angular/core';
import { Attachment } from 'src/app/core/models/attachment.model';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {
  @Input() attachments: Attachment[];

  constructor() { }

  ngOnInit(): void {
  }

  getSource(path: string): string{
    console.log(environment.API_URL + path);
    return environment.API_URL + path;
  }

}
