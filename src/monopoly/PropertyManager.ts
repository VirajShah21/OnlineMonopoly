import {Property, PropertyGroup, PropertyGroupId} from "./MonopolyBoard";

export default class PropertyManager {
    groups: Array<PropertyGroup>;

    constructor() {
        this.groups = [];
    }

    addProperty(prop: Property): void {
        let groupId: PropertyGroupId = prop.getGroupId();
        let filtered: Array<PropertyGroup> = this.groups.filter((group: PropertyGroup): boolean => {
            return group.getGroupId() == groupId;
        });
        if (filtered.length > 0) {
            filtered[0].addProperty(prop);
        } else {
            let newGroup: PropertyGroup = new PropertyGroup(groupId);
            newGroup.addProperty(prop);
            this.groups.push(newGroup);
        }
    }

    export(): any {
        return {
            groups: this.groups.map((group: PropertyGroup): Array<any> => {
                return group.export();
            })
        };
    }
}