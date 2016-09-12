import { Injectable } from "@angular/core";
import { OrgNodeBaseModel } from "../shared/index";

@Injectable()
export class DataHelper {
    convertDataToBaseModel(node): OrgNodeBaseModel {
        let orgNode = new OrgNodeBaseModel();
        if (node) {
            orgNode.UID = node.NodeID;
            orgNode.First_Name = node.NodeFirstName;
            orgNode.Last_Name = node.NodeLastName;
            orgNode.Title = node.Description;
            orgNode.Parent = node.ParentNodeID;
        }
        return orgNode;
    }

    getCSVFileHeaders(orgNode) {
        let row = "";

        // This loop will extract the label from 1st index of on array
        for (let index in orgNode) {
            if (index === "First_Name") {
                index = index.replace("_", " ");
            }
            if (index === "Last_Name") {
                index = index.replace("_", " ");
            }
            // Now convert each value to string and comma-seprated
            row += index + ",";
        }

        row = row.slice(0, -1);
        return row;
    }

    downloadCSVFile(fileName, CSV) {
        // Initialize file format you want csv or xls
        let uri = "data:text/csv;charset=utf-8," + encodeURI(CSV);

        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension    

        // this trick will generate a temp <a /> tag
        let link: HTMLAnchorElement = document.createElement("a");
        link.href = uri;
        link.setAttribute("download", fileName + ".csv");
        // set the visibility hidden so it will not effect on your web-layout
        link.style.visibility = "hidden";

        // this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}