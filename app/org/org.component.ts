<<<<<<< HEAD
import { Component, Output, EventEmitter} from "@angular/core";
import { HTTP_PROVIDERS } from "@angular/http";
import { CanActivate, Router } from "@angular/router-deprecated";
import { tokenNotExpired } from "angular2-jwt";

import {AddNodeComponent} from "./add-node/add-node.component";
import { OrgNodeDetailComponent } from "./org-node-detail/index";
import { OrgChartModel, OrgNodeModel, OrgService } from "./shared/index";
import {OrgTreeComponent} from "./d3-tree/org-tree.component";
=======
import { Component, Output, EventEmitter} from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import { CanActivate, Router } from '@angular/router-deprecated';
import { tokenNotExpired } from 'angular2-jwt';

import { AddNodeComponent } from './add-node/add-node.component';
import { OrgNodeDetailComponent } from './org-node-detail/index';
import { OrgChartModel, OrgNodeModel, OrgService } from './shared/index';
import { OrgTree } from './d3-tree/org-tree';
>>>>>>> development

@Component({
    selector: "sg-origami-org",
    directives: [OrgTreeComponent, OrgNodeDetailComponent, AddNodeComponent],
    templateUrl: "app/org/org.component.html",
    styleUrls: ["app/org/org.component.css"],
    providers: [OrgService, HTTP_PROVIDERS]
})

export class OrgComponent {
    orgChart: OrgChartModel;
    orgNodes: OrgNodeModel[];
<<<<<<< HEAD
    @Output() treeJson: any;
    @Output() selectedNode: OrgNodeModel;
=======
    treeJson: any;
>>>>>>> development

    @Output() selectedNode: OrgNodeModel;
    constructor(private orgService: OrgService, private router: Router) {
        this.getAllNodes();
    }

    getAllNodes() {
        this.orgService.getNodes()
            .subscribe(data => this.setOrgChartData(data),
            err => this.orgService.logError(err),
            () => console.log("Random Quote Complete"));
    }

    onNodeSelected(node) {
        this.selectedNode = node;
    }

<<<<<<< HEAD
    onNodeAdded(added: OrgNodeModel) {
        this.addChildToParentOrgNode(added, this.orgNodes[0]);
        this.updateJSON();
    }

    addChildToParentOrgNode(newNode: OrgNodeModel, node: OrgNodeModel) {
        if (node.NodeID === newNode.ParentNodeID) {
            node.IsSelected = true;
            if (!node.children) {
                node.children = new Array<OrgNodeModel>();
=======
    onNodeAdded(added:OrgNodeModel) {
        this.addChildToSelectedOrgNode(added,this.orgNodes[0]);
        this.updateJSON();
    }
   
    addChildToSelectedOrgNode(newNode:OrgNodeModel,node:OrgNodeModel) {
        if (this.compareNodeID(node,this.selectedNode)) {
            node.IsSelected= true;
            if (!node.children) {
                node.children= new Array<OrgNodeModel>();
>>>>>>> development
            }
            node.children.push(newNode);
            return;
        } else {
<<<<<<< HEAD
            node.IsSelected = false;
            if (node.children) {
                node.children.forEach(element => this.addChildToParentOrgNode(newNode, element));
=======
            node.IsSelected= false;
            if (node.children) {
                node.children.forEach(element=>this.addChildToSelectedOrgNode(newNode,element));
>>>>>>> development
            }
        }
    }

    updateJSON() {
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        // alert(JSON.stringify(this.orgNodes));
    }
<<<<<<< HEAD

    deleteNodeFromArray(nodes: OrgNodeModel[]) {
        let index = -1;
        if (this.selectedNode != null) {
            nodes.forEach(element => {
                if (this.compareNodeID(element, this.selectedNode)) {
                    index = nodes.indexOf(element);
                }
            });
            if (index > -1) {
                nodes.splice(index, 1);
                this.selectedNode = null;
            }
            else {
                for (let i = 0; i < nodes.length; i++) {
                    let element = nodes[i];
                    if (element.children) {
                        this.deleteNodeFromArray(element.children);
                    }
                }
            }
        }
    }
=======
    
    deleteNodeFromArray(nodes:OrgNodeModel[]) {
        let index =- 1;
        nodes.forEach(element => {
            if(this.compareNodeID(element,this.selectedNode)) {
                index= nodes.indexOf(element);
            }
        });
        if (index > -1) {
            nodes.splice(index, 1);
            this.selectedNode = null;
        } else {
            for (var i = 0; i < nodes.length; i++) {
                var element = nodes[i];
                if(element.children) {
                    this.deleteNodeFromArray(element.children);
                }
            }
        }
   }
>>>>>>> development

    onNodeDeleted(deleted) {
        this.deleteNodeFromArray(this.orgNodes);
        this.updateJSON();
    }

    onNodeUpdated(selected) {
<<<<<<< HEAD
        this.selectedNode = selected;
        this.updateOrgNode(this.orgNodes[0]);
        this.updateJSON();
    }

    updateOrgNode(node: OrgNodeModel) {
        if (this.compareNodeID(node, this.selectedNode)) {
            node.NodeFirstName = this.selectedNode.NodeFirstName;
            node.NodeLastName = this.selectedNode.NodeLastName;
            node.Description = this.selectedNode.Description;
            node.IsSelected = true;
            return;
        } else {
            node.IsSelected = false;
=======
        this.selectedNode= selected;
        this.updateOrgNode(this.orgNodes[0]);
        this.updateJSON();    }
    
     updateOrgNode(node:OrgNodeModel) {
        if (this.compareNodeID(node,this.selectedNode)) {
            node.NodeFirstName = this.selectedNode.NodeFirstName;
            node.IsSelected = true;
            return;
        } else {
            node.IsSelected= false;
>>>>>>> development
            if (node.children) {
                node.children.forEach(element => this.updateOrgNode(element));
            }
        }
    }

    logout() {
        localStorage.removeItem("profile");
        localStorage.removeItem("id_token");
        this.router.navigate(["/Login"]);
    }

    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.NodeID === currentNode.NodeID;
        } else {
            return false;
        }
    }

    private setOrgChartData(data: any) {
        this.orgChart = data;
        this.orgNodes = this.orgChart.OrgNodes;
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        // console.log(this.orgChart);
    }

}   