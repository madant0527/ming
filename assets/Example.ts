import ScrollSelect from "./ScrollSelect";

/**
 * 示例
 * 选中是为灰色
 * 选择完是绿色
 */

const { ccclass, property } = cc._decorator;
@ccclass
export class Example extends cc.Component {

    private _root: cc.Node
    private _scrollSelect: ScrollSelect;

    start() {
        this.initRoot();
        this.initEvent();
    }

    private initRoot() {
        this._root = cc.find("CardRoot", this.node)
        this._scrollSelect = this._root.getComponent(ScrollSelect)
    }

    private initEvent() {
        this._scrollSelect.OnStart = () => { this.OnChooseStart() }
        this._scrollSelect.OnMoving = (nodes: Array<cc.Node>) => { this.OnChooseCard(nodes) }
        this._scrollSelect.OnEnd = (nodes: Array<cc.Node>) => { this.ChooseCardEnd(nodes) }
    }

    private OnChooseStart() {
        let childrens = this._root.children
        for (let index = 0; index < childrens.length; index++) {
            const child = childrens[index];
            child.color = cc.Color.WHITE
        }
    }


    private OnChooseCard(nodes: Array<cc.Node>) {
        let childrens = this._root.children
        for (let index = 0; index < childrens.length; index++) {
            const child = childrens[index];
            if (nodes.indexOf(child) >= 0) {
                if (child.color.equals(cc.Color.WHITE)) {
                    child.color = cc.Color.GRAY
                }
            }
            else {
                if (child.color.equals(cc.Color.GRAY)) {
                    child.color = cc.Color.WHITE
                }
            }
        }
    }


    private ChooseCardEnd(nodes: Array<cc.Node>) {
        let childrens = this._root.children
        for (let index = 0; index < childrens.length; index++) {
            const child = childrens[index];
            if (nodes.indexOf(child) >= 0) {
                if (!child.color.equals(cc.Color.GREEN)) {
                    child.color = cc.Color.GREEN
                }
            }
            else {
                if (!child.color.equals(cc.Color.WHITE)) {
                    child.color = cc.Color.WHITE
                }
            }
        }
    }

}