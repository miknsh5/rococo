import { Component, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange, HostListener } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";

import { OrgNodeModel, OrgSearchModel, OrgService, DomElementHelper } from "../shared/index";

declare let $;

@Component({
    selector: "sg-org-smart-bar",
    templateUrl: "app/org/smart-bar/smart-bar.component.html",
    styleUrls: ["app/org/smart-bar/smart-bar.component.css"]
})

export class SamrtBarComponent implements OnChanges {
    private prevSearchTerm: any;
    private orgSearchData: OrgSearchModel[];
    private searchOrAddTerm = "";
    private nameSearchResults: OrgSearchModel[];
    private titleSearchResult: any[];
    private searchInProgress: boolean = false;

    @Input() treeJson: any;
    @Input() selectedOrgNode: OrgNodeModel;
    @Output() nodeSearched = new EventEmitter<OrgNodeModel>();

    constructor(private elementRef: ElementRef, private domHelper: DomElementHelper) {

    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["treeJson"]) {
            if (this.treeJson) {
                this.orgSearchData = new Array<any>();
                this.convertToFlatData(this.treeJson);
            }
        }
        if (changes["selectedOrgNode"]) {
            if (this.selectedOrgNode === null) {
                this.nodeSearched.emit(this.selectedOrgNode);
            }
        }
        this.clearSearch();
    }

    convertToFlatData(inputArray, ischild?: boolean) {
        ischild = ischild || false;
        let index = 0, length = inputArray.length;
        for (index = 0; index < length; index++) {
            let searchModel = new OrgSearchModel();
            searchModel.NodeID = inputArray[index].NodeID;
            searchModel.Title = inputArray[index].Description;
            searchModel.Name = inputArray[index].NodeFirstName + " " + inputArray[index].NodeLastName;

            this.orgSearchData.push(searchModel);

            if (inputArray[index].children && typeof inputArray[index].children === typeof []) {
                this.convertToFlatData(inputArray[index].children, true);
            }
        }
        if (ischild === false) {
            return;
        }
    };

    @HostListener("window:keydown", ["$event"])
    public OnKeyDown(event) {
        if (this.searchInProgress) {
            let searchContainer = document.getElementById("searchSelection");
            if ((event as KeyboardEvent).keyCode === 38) {
                if (this.selectedOrgNode === null) {
                    let prevElement = $(searchContainer).find("li.active").prev();
                    if ($(searchContainer).find("li.active").hasClass("titleSearch") && !$(prevElement).hasClass("titleSearch")) {
                        prevElement = $(prevElement).prev();
                    }

                    if ($(searchContainer).find("li.active").hasClass("nameSearch") && !$(prevElement).hasClass("nameSearch")) {
                        prevElement = null;
                    }
                    if (prevElement && prevElement[0] && prevElement[0].tagName === "LI") {
                        $(searchContainer).find("li.active").removeClass("active");
                        $(prevElement).addClass("active");
                    }
                }
            }
            else if ((event as KeyboardEvent).keyCode === 40) {
                if (this.selectedOrgNode === null) {
                    let nextElement = $(searchContainer).find("li.active").next();
                    if ($(searchContainer).find("li.active").hasClass("nameSearch") && !$(nextElement).hasClass("nameSearch")) {
                        nextElement = $(nextElement).next();
                    }

                    if ($(searchContainer).find("li.active").hasClass("titleSearch") && !$(nextElement).hasClass("titleSearch")) {
                        nextElement = null;
                    }
                    if (nextElement && nextElement[0] && nextElement[0].tagName === "LI") {
                        $(searchContainer).find("li.active").removeClass("active");
                        $(nextElement).addClass("active");
                    }
                }
            }
        }
    }

    private onInputName() {
        if (this.searchOrAddTerm) {
            if (this.prevSearchTerm !== this.searchOrAddTerm) {
                this.prevSearchTerm = this.searchOrAddTerm;
                if (this.selectedOrgNode === null) {
                    this.searchList();
                }
            }
        } else {
            this.clearSearch();
        }
    }

    private onNodeSleect(event: any, data: OrgSearchModel) {
        if (data) {
            let node = this.getNode(data.NodeID, this.treeJson[0]);
            if (node) {
                $("#searchSelection").find("li.active").removeClass("active");
                $(event.target).closest("li.nameSearch").addClass("active");
                this.nodeSearched.emit(node);
            }
        }
    }

    private searchList() {
        this.searchInProgress = true;
        this.nameSearchResults = new Array<OrgSearchModel>();
        this.titleSearchResult = new Array();
        setTimeout(() => {
            this.orgSearchData.forEach((data, index) => {
                if (data.Name.toLowerCase().search(this.searchOrAddTerm.toLowerCase()) > -1) {
                    this.nameSearchResults.push(data);
                }
            });

            if (this.nameSearchResults.length > 0) {
                let groups = {};
                for (let i = 0; i < this.nameSearchResults.length; i++) {
                    let title = this.nameSearchResults[i].Title;
                    if (!groups[title]) {
                        groups[title] = [];
                    }
                    groups[title].push(this.nameSearchResults[i]);
                }

                for (let title in groups) {
                    this.titleSearchResult.push({ Name: title, Count: groups[title].length });
                }
                setTimeout(() => {
                    $("#searchSelection li.nameSearch").first().addClass("active");
                }, 100);
            }
        }, 100);
    }

    private clearSearch() {
        this.searchOrAddTerm = "";
        this.prevSearchTerm = "";
        this.searchInProgress = false;
        this.nameSearchResults = new Array<OrgSearchModel>();
        this.titleSearchResult = new Array();
    }

    private getNode(nodeID: number, rootNode: any) {
        if (rootNode.NodeID === nodeID) {
            return rootNode;
        } else {
            let nodes = rootNode.children ? rootNode.children : rootNode._children;
            if (nodes) {
                let node;
                for (let i = 0; i < nodes.length; i++) {
                    if (!node) {
                        node = this.getNode(nodeID, nodes[i]);
                    }
                };
                return node;
            }
        }
    }
}