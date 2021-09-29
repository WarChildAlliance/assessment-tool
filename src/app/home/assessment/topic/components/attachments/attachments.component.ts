import { Component, Input, OnInit } from '@angular/core';
import { Attachment } from 'src/app/core/models/attachment.model';
import { environment } from 'src/environments/environment';

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
    return environment.API_URL + path;
  }

}
