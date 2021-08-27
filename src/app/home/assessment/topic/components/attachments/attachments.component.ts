import { Component, Input, OnInit } from '@angular/core';
import { Attachment } from 'src/app/core/models/attachment.model';

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
    return 'http://localhost:8002' + path;
  }

}
