import {Component, Input} from 'angular2/core';
import {Person} from './person';

@Component({
    selector: 'my-person-detail',
    inputs: ['selectedPerson'],
    template: `
      <div class="detail-wrap">
        <div class="controls">
          <div class="close-icon" (click)="closeclicked()"></div>
         <div class="edit-icon" (click)="editClicked()"></div>
        </div>
        
        <div *ngIf="selectedPerson && !EditableMode" class="text-wrap">
       
            <div class="title-name">{{selectedPerson.name}}</div>
            <div class="title-position">{{selectedPerson.title}}</div>
        </div>
       <div *ngIf="selectedPerson && EditableMode" class="text-wrap">
       <input class="title-name-edit" [(ngModel)]="selectedPerson.name"  />
       <input class="title-position-edit" [(ngModel)]="selectedPerson.title"   />
       </div>
      </div>
    `,
    styles:[`
        .detail-wrap {
            height: 50px;
            width: 250px;
            position:absolute;
            background-color: #029BFF;
            bottom: 5px;
            left:0;
        }

        .controls {
            position:relative;
            left: 10px;
            top:0;
            width: 25px;
            height: 100%;
            background-color: #1565C0;
            display:inline-block;
            float:left;
        }

        .text-wrap {
            position:relative;
            left: 20px;
            margin: 8px 0;
            color: #FFFFFF;
            font-family: 'Roboto', sans-serif;
        }

        .title-name {
            font-size: 1.1em;
            font-weight: bolder;
        }
         .title-name-edit {
            font-size: 0.9em;
            font-weight: bolder;
            width:200px;
            height:15px;
        }

        .title-position {
            font-size: 0.9em;
        }
        .title-position-edit {
            font-size: 0.8em;
            width:200px;
            height:10px;
        }

        .selected {
        }
          .edit-icon {
            background-image: url("app/images/pen.png");
            bottom: 2px;
            position: absolute;
            height: 20px;
            width: 20px;
            background-repeat: no-repeat;
            left:4px;
        } 
        .close-icon {
            background-image: url("app/images/close.png");
            top:6px;
            position: absolute;
            height: 20px;
            width: 20px;
            background-repeat: no-repeat;
            left:4px;
        } 

    `],
})
export class PersonDetailComponent {
   EditableMode:boolean=false;
    editClicked()
    {
        alert("edit clicked");
        this.EditableMode=!this.EditableMode;
    }
}