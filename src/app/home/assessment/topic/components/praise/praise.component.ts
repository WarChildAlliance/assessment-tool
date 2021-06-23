import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Praises } from '../praise/praises';

@Component({
  selector: 'app-praise',
  templateUrl: './praise.component.html',
  styleUrls: ['./praise.component.scss']
})
export class PraiseComponent implements OnInit {

  praises = Praises;
  randIndex = Math.floor(Math.random() * this.praises.length);
  praise = this.praises[this.randIndex];

  constructor(public dialogRef: MatDialogRef <PraiseComponent>) {

  }

  ngOnInit(): void {

}}
