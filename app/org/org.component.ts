import { Component, Output, EventEmitter, OnDestroy, HostListener } from "@angular/core";
import { tokenNotExpired } from "angular2-jwt";

import { OrgNodeModel, ChartMode, OrgCompanyModel, OrgGroupModel, OrgNodeStatus, DomElementHelper } from "./shared/index";

const MIN_HEIGHT: number = 480;
const MAX_HEIGHT: number = 768;
const MIN_WIDTH: number = 600;
const MAX_WIDTH: number = 1366;
const DEFAULT_OFFSET: number = 61;

declare var svgPanZoom: any;

@Component({
    selector: "sg-org",
    templateUrl: "app/org/org.component.html",
    styleUrls: ["app/org/org.component.css"]
})

export class OrgComponent implements OnDestroy {
    orgNodes: OrgNodeModel[];
    svgWidth: number;
    svgHeight: number;
    buildView: any;
    reportView: any;
    exploreView: any;
    buildViewText: any;
    reportViewText: any;
    svgPan: any;

    @Output() groupID: any;
    @Output() companyID: any;
    @Output() currentChartMode: ChartMode;
    @Output() treeJson: any;
    @Output() orgGroup: OrgGroupModel;
    @Output() companyName: any;
    @Output() selectedNode: OrgNodeModel;
    @Output() isAddOrEditMode: boolean;
    @Output() detailAddOrEditMode: boolean;
    @Output() displayFirstNameLabel: boolean;
    @Output() displayLastNameLabel: boolean;
    @Output() displayDescriptionLabel: boolean;
    @Output() isOrgNodeEmpty: boolean;
    @Output() currentOrgNodeStatus: OrgNodeStatus;
    @Output() isMenuSettingsEnabled: boolean;
    @Output() searchedNode: OrgNodeModel;
    @Output() isSmartBarEnabled: boolean;
    @Output() isEditMenuEnable: boolean;

    constructor(public domHelper: DomElementHelper) {
        this.currentChartMode = ChartMode.build;
        this.enableLabels();
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
        this.currentOrgNodeStatus = OrgNodeStatus.None;
        this.isMenuSettingsEnabled = false;
    }

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: any) {
        if ((event.metaKey || event.ctrlKey) && event.keyCode === "1".charCodeAt(0)) {
            event.preventDefault();
            this.changeViewModeNav(ChartMode.build);
        } else if ((event.metaKey || event.ctrlKey) && event.keyCode === "2".charCodeAt(0)) {
            event.preventDefault();
            this.changeViewModeNav(ChartMode.explore);
        } else if ((event.metaKey || event.ctrlKey) && event.keyCode === "3".charCodeAt(0)) {
            event.preventDefault();
            this.changeViewModeNav(ChartMode.report);
        }
    }

    onResize(event) {
        this.svgWidth = this.getSvgWidth();
        this.svgHeight = this.getSvgHeight();
    }

    enableFirstNameLabel(data) {
        this.displayFirstNameLabel = data;
    }

    enableLastNameLabel(data) {
        this.displayLastNameLabel = data;
    }

    enableDescriptionLabel(data) {
        this.displayDescriptionLabel = data;
    }

    enableLabels() {
        this.displayFirstNameLabel = true;
        this.displayLastNameLabel = true;
        this.displayDescriptionLabel = true;
    }

    changeViewModeNav(viewMode) {
        if (!this.isAddOrEditMode) {
            if (viewMode === ChartMode.build) {
                this.enableLabels();
                this.currentChartMode = ChartMode.build;
                this.enableViewModesNav(ChartMode.build);
                if (this.svgPan) {
                    this.svgPan.disablePan();
                }
            } else {
                if (viewMode === ChartMode.report) {
                    this.currentChartMode = ChartMode.report;
                } else {
                    this.currentChartMode = ChartMode.explore;
                }
                this.enableViewModesNav(this.currentChartMode);
                this.enableLabels();
                if (!this.svgPan) {
                    let elem = document.getElementsByTagName("svg")[0];
                    this.svgPan = svgPanZoom(elem, {
                        viewportSelector: ".svg-pan-zoom_viewport",
                        panEnabled: true,
                        controlIconsEnabled: false,
                        zoomEnabled: false,
                        dblClickZoomEnabled: false,
                        mouseWheelZoomEnabled: false,
                        preventMouseEventsDefault: true
                    });
                } else {
                    this.svgPan.enablePan();
                }
            }
        } else {
            if (this.svgPan) {
                this.svgPan.disablePan();
            }
        }
    }

    smartBarEnabled(value: boolean) {
        this.isSmartBarEnabled = value;
        this.onAddOrEditModeValueSet(value);
    }

    isEditEnabled(value: boolean) {
        this.isEditMenuEnable = value;
        this.onAddOrEditModeValueSet(value);
    }

    onNodeSelected(node) {
        if (!this.isSmartBarEnabled || (!this.selectedNode && node)) {
            let prevNode = this.selectedNode ? this.selectedNode : new OrgNodeModel();
            this.selectedNode = node;
            if (this.selectedNode) {
                if (node.NodeID === -1) {
                    this.isAddOrEditMode = true;
                    this.detailAddOrEditMode = true;
                } else if ((this.isAddOrEditMode || !this.isAddOrEditMode && prevNode && prevNode.IsNewRoot)
                    && prevNode && prevNode.NodeID !== node.NodeID) {
                    this.isAddOrEditMode = false;
                    this.detailAddOrEditMode = false;
                }
            }
            this.currentOrgNodeStatus = OrgNodeStatus.None;
        }
    }

    onNodeAdded(addedNode: OrgNodeModel) {
        this.currentOrgNodeStatus = OrgNodeStatus.None;
        this.isAddOrEditMode = false;
        this.isOrgNodeEmpty = true;
        if (addedNode.NodeID !== -1) {
            // gets the stagged node and deleting it
            if (this.orgNodes[0]) {
                let node = this.getNode(-1, this.orgNodes[0]);
                this.deleteNodeFromArray(node, this.orgNodes);
            }
            this.selectedNode = addedNode;
            this.searchedNode = addedNode;
            this.detailAddOrEditMode = false;
            this.isOrgNodeEmpty = false;
            this.currentOrgNodeStatus = OrgNodeStatus.Add;
        }

        if (addedNode.IsNewRoot) {
            this.orgNodes.splice(0, 1, addedNode);
            this.isOrgNodeEmpty = false;
            this.currentOrgNodeStatus = OrgNodeStatus.Add;
        }
        else {
            this.addChildToSelectedOrgNode(addedNode, this.orgNodes[0]);
        }

        if (this.selectedNode && this.selectedNode.NodeID !== addedNode.NodeID) {
            this.updateJSON(addedNode);
        } else {
            this.updateJSON();
        }
    }

    onSwitchedToAddMode(node: OrgNodeModel) {
        this.isAddOrEditMode = true;
        this.detailAddOrEditMode = true;
        this.selectedNode = node;
        this.disableViewAndExploreModesNav();
    }

    onAddOrEditModeValueSet(value: boolean) {
        this.isAddOrEditMode = value;
        this.detailAddOrEditMode = value;
        if (value) {
            this.disableViewAndExploreModesNav();
        } else {
            this.enableViewModesNav(this.currentChartMode);
        }
    }

    addChildToSelectedOrgNode(newNode: OrgNodeModel, node: OrgNodeModel) {
        if (node) {
            if (this.comparewithParentNodeID(newNode, node)) {
                newNode.IsSelected = true;
                if (!node.children) {
                    node.children = new Array<OrgNodeModel>();
                }
                node.children.push(newNode);
                return true;
            } else {
                node.IsSelected = false;
                if (node.children) {
                    for (let i = 0; i < node.children.length; i++) {
                        let result = this.addChildToSelectedOrgNode(newNode, node.children[i]);
                        if (result) {
                            break;
                        }
                    }
                }
            }
        } else {
            newNode.IsSelected = true;
            newNode.IsStaging = false;
            newNode.children = new Array<OrgNodeModel>();
            this.orgNodes.push(newNode);
            return true;
        }
    }

    replacer(key, value) {
        if (typeof key === "parent") {
            return undefined;
        }
        return value;
    }

    removeCircularRef(node) {
        if (node) {
            node.parent = null;
            if (node.children == null && node._children != null) {
                node.children = node._children;
            }
            node._children = null;
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    this.removeCircularRef(node.children[i]);
                }
            }
        }
    }

    updateJSON(addedNode?: OrgNodeModel) {
        this.removeCircularRef(this.orgNodes[0]);
        this.orgGroup.OrgNodes = JSON.parse(JSON.stringify(this.orgNodes));
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        if (addedNode && addedNode.NodeID === -1) {
            this.searchedNode = this.getNode(addedNode.NodeID, this.treeJson[0]);
            this.selectedNode = this.searchedNode;
        }
        if ((this.treeJson && this.treeJson.length === 0) || (this.selectedNode && this.selectedNode.NodeID === -1)) {
            this.disableViewAndExploreModesNav();
        }
    }

    deleteNodeFromArray(selectedNode: OrgNodeModel, nodes: OrgNodeModel[]) {
        let index = - 1;
        for (let i = 0; i < nodes.length; i++) {
            if (this.compareNodeID(nodes[i], selectedNode)) {
                index = nodes.indexOf(nodes[i]);
                break;
            }
        };
        if (index > -1) {
            nodes.splice(index, 1);
            this.selectedNode = null;
        } else {
            for (let i = 0; i < nodes.length; i++) {
                let element = nodes[i];
                if (element.children) {
                    this.deleteNodeFromArray(selectedNode, element.children);
                }
            }
        }
    }

    onNodeDeleted(deleted) {
        this.currentOrgNodeStatus = OrgNodeStatus.None;
        this.isAddOrEditMode = false;
        this.detailAddOrEditMode = false;
        if (deleted) {
            if (deleted.IsNewRoot) {
                let oldRoot = deleted.children[0];
                oldRoot.ParentNodeID = null;
                this.orgNodes.splice(0, 1, oldRoot);
                this.currentOrgNodeStatus = OrgNodeStatus.Delete;
            }
            else {
                this.deleteNodeFromArray(deleted, this.orgNodes);
            }
            if (deleted.NodeID !== -1) {
                this.currentOrgNodeStatus = OrgNodeStatus.Delete;
            }
        } else {
            let node = this.getNode(this.selectedNode.NodeID, this.orgNodes[0]);
            this.selectedNode = JSON.parse(JSON.stringify(node));
        }
        if (this.orgNodes && this.orgNodes.length === 0) {
            this.isOrgNodeEmpty = true;
        }
        this.updateJSON();
    }

    onNodeUpdated(selected) {
        // since while updating data to server we send children as null so refreshing the value
        if (selected && !selected.children && selected.NodeID === this.selectedNode.NodeID && this.selectedNode.children) {
            selected.children = this.selectedNode.children;
        }
        if (selected.NodeID !== -1) {
            this.selectedNode = selected;
        }
        if (selected.NodeID !== -1 && selected.IsStaging) {
            // updating local changes
            this.orgGroup.OrgNodes = JSON.parse(JSON.stringify(this.orgNodes));
            this.updateOrgNode(this.orgNodes[0], selected);
            this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        } else {
            // updating submitted or saved changes
            this.updateOrgNode(this.orgNodes[0], selected);
            this.updateJSON();
        }
    }

    updateOrgNode(node: OrgNodeModel, selectedNode) {
        if (this.compareNodeID(node, selectedNode)) {
            node.NodeFirstName = selectedNode.NodeFirstName;
            node.NodeLastName = selectedNode.NodeLastName;
            node.Description = selectedNode.Description;
            node.ParentNodeID = selectedNode.ParentNodeID;
            node.IsSelected = true;
            return true;
        } else {
            node.IsSelected = false;
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    let result = this.updateOrgNode(node.children[i], selectedNode);
                    if (result) {
                        break;
                    }
                }
            }
        }
    }

    private enableViewModesNav(viewMode) {
        if (viewMode === ChartMode.explore) {
            this.exploreView = "active";
            this.reportView = "";
            this.buildView = "";
        } else if (viewMode === ChartMode.report) {
            this.buildView = "";
            this.exploreView = "";
            this.reportView = "active";
        } else {
            this.buildView = "active";
            this.reportView = "";
            this.exploreView = "";
        }
    }

    disableViewAndExploreModesNav() {
        this.reportView = "inactive";
        this.exploreView = "inactive";
    }

    private getSvgHeight() {
        let height = window.innerHeight;
        // applies min height
        height = height < MIN_HEIGHT ? MIN_HEIGHT : height;

        // temporarily applied wiil be removed after standard and organization mode added
        if (this.svgWidth < 993 && height > MIN_HEIGHT) {
            height = height - DEFAULT_OFFSET;
        } else {
            height = height - DEFAULT_OFFSET;
        }
        return height;
    }

    private getSvgWidth() {
        let width = window.innerWidth;
        // applies min width
        width = width < MIN_WIDTH ? MIN_WIDTH : width;
        return width;
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

    private comparewithParentNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.ParentNodeID === currentNode.NodeID;
        } else {
            return false;
        }
    }

    private compareNodeID(updatedNode: OrgNodeModel, currentNode: OrgNodeModel): boolean {
        if (updatedNode != null && currentNode != null) {
            return updatedNode.NodeID === currentNode.NodeID;
        } else {
            return false;
        }
    }

    onChartUpdated(data: any) {
        this.onGroupSelected(data);
    }

    onGroupSelected(data: any) {
        this.orgGroup = data;
        this.orgNodes = JSON.parse(JSON.stringify(this.orgGroup.OrgNodes));
        this.companyID = this.orgGroup.CompanyID;
        if (this.groupID !== this.orgGroup.OrgGroupID)
            this.groupID = this.orgGroup.OrgGroupID;
        if (this.orgNodes && this.orgNodes.length === 0) {
            this.disableViewAndExploreModesNav();
            this.currentChartMode = ChartMode.build;
        }
        this.enableViewModesNav(this.currentChartMode);
        this.treeJson = JSON.parse(JSON.stringify(this.orgNodes));
        this.isSmartBarEnabled = false;
        this.isEditMenuEnable = false;
        this.onAddOrEditModeValueSet(false);
    }

    onCompanySelected(data: any) {
        if (data) {
            this.companyName = data.CompanyName;
        }
    }

    onMenuSettingsChange(data: boolean) {
        if (data) {
            this.isMenuSettingsEnabled = data;
        } else {
            this.isMenuSettingsEnabled = data;
        }
    }

    onNodeSearched(data: OrgNodeModel) {
        this.searchedNode = data;
    }

    ngOnDestroy() {
        if (this.svgPan) {
            this.svgPan.destroy();
        }
    }

}