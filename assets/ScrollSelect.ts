const { ccclass, property } = cc._decorator;
@ccclass
export default class ScrollSelect extends cc.Component {
    editor: {
        executeInEditMode: true,
        requireComponent: cc.Layout,
    }
    public OnStart:Function=null;
    public OnMoving: Function = null;
    public OnEnd: Function = null;
    private mWidth: number = 0;                                         //item的宽，所有子对象必须等宽
    private mHeight: number = 0;                                        //item的高，所有子对象必须等高
    private offsetX: number = 0;                                        //item之间的排列间距缩进
    private startIndex: number = -1;
    private endIndex: number = -1;
    private isPressDown: boolean = false;                             //默认不按下
    private nodes: Array<cc.Node> = new Array<cc.Node>();             //所有子节点的集合
    private validNodes: Array<cc.Node> = new Array<cc.Node>();        //所有非隐藏（有效）的子节点的集合
    private targetNodes: Array<cc.Node> = new Array<cc.Node>()        //选择的节点
    private get validNodesCount() { return this.validNodes.length; }

    onLoad() {
        //获取所有子节点
        this.nodes = this.node.children;
        if (this.nodes.length <= 0) {
            cc.error('ScrollSelect has no children');
            return;
        }
        //初始化状态 与 获取参数
        this.mWidth = this.nodes[0].width;
        this.mHeight = this.nodes[0].height;
        this.node.setContentSize(0, this.mHeight)
        let layout = this.node.getComponent(cc.Layout);
        if (layout != null) {
            this.offsetX = layout.spacingX;
        }
        this.ResetValidNodes()
        this.ListenEvents();
    }

    private ResetValidNodes() {
        this.validNodes = new Array<cc.Node>();
        this.validNodes = this.nodes.filter((node) => {
            return node.activeInHierarchy
        })
    }

    private ListenEvents() {
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            this.isPressDown = true;
            this.OnChooseStart(event);
        });
        this.node.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.OnChooseCancel(event);
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {
            this.OnChooseCancel(event);
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            this.OnChooseMoveing(event)
        });
    }

    private OnChooseStart(event) {
        this.startIndex = -1;
        this.endIndex = -1;
        this.ResetValidNodes();
        var mousePos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.startIndex = this.GetNodeIndex(mousePos.x);
        if (this.OnStart != null) {
            this.OnStart();
        }
    }

    private OnChooseCancel(event) {
        var mousePos = this.node.convertToNodeSpaceAR(event.getLocation());
        //在区域内，将区域内的节点加入
        if (this.CheckValidArea(mousePos.x, mousePos.y)) {
            this.targetNodes = new Array<cc.Node>();
            this.endIndex = this.GetNodeIndex(mousePos.x);
            if ((this.startIndex >= 0 && this.endIndex >= 0)) {
                let tuple = this.MinMax(this.startIndex, this.endIndex);
                for (let i = 0; i < this.validNodes.length; i++) {
                    const element = this.validNodes[i];
                    if (i <= tuple.max && i >= tuple.min) {
                        this.targetNodes.push(element)
                    }
                }
            }
        }

        if (this.OnEnd != null) {
            this.OnEnd(this.targetNodes);
        }
        this.OnReset();
    }

    private OnChooseMoveing(event) {
        if (!this.isPressDown) {
            return;
        }

        //将鼠标坐标转成相对于当前节点的坐标
        var mousePos = this.node.convertToNodeSpaceAR(event.getLocation());
        if (!this.CheckValidArea(mousePos.x, mousePos.y)) {
            return;
        }

        this.endIndex = this.GetNodeIndex(mousePos.x);
        if (this.endIndex == -1) {
            return;
        }

        if ((this.startIndex >= 0 && this.endIndex >= 0) && this.startIndex != this.endIndex) {
            let tuple = this.MinMax(this.startIndex, this.endIndex);
            this.targetNodes = new Array<cc.Node>();
            for (let i = 0; i < this.validNodes.length; i++) {
                const element = this.validNodes[i];
                if (i <= tuple.max && i >= tuple.min) {
                    this.targetNodes.push(element)
                }
            }

            if (this.OnMoving != null) {
                this.OnMoving(this.targetNodes);
            }
        }
    }

    private MinMax(x: number, y: number): { min: number, max: number } {

        if (x <= y) {
            return { min: x, max: y }
        }
        return { min: y, max: x }
    }

    //在有效范围内（高 和 宽）
    private CheckValidArea(x: number, y: number) {
        var CheckValidAreaX = (posX) => {
            var areaLeft = this.validNodes[0].position.x - this.mWidth / 2;
            var areaRight = this.validNodes[this.validNodesCount - 1].position.x + this.mWidth / 2;
            return posX <= areaRight && posX >= areaLeft;
        }
        var CheckValidAreaY = (posY) => {
            var areaTop = this.mHeight / 2;
            var areaDown = - (this.mHeight / 2);
            return posY <= areaTop && posY >= areaDown;
        }
        return CheckValidAreaX(x) && CheckValidAreaY(y);
    }

    private OnReset() {
        this.isPressDown = false;
        this.startIndex = -1;
        this.endIndex = -1;
    }

    private GetNodeIndex(x: number) {
        for (let i = 0; i < this.validNodesCount; i++) {
            var posX = this.validNodes[i].position.x;
            //牌的最后一张，选择区域要大一些
            if (i == this.validNodesCount - 1) {
                if (x > (posX - this.mWidth / 2) && x < (posX + this.mWidth / 2)) {
                    return i;
                }
            }
            if (x > (posX - this.mWidth / 2) && x < (posX + this.mWidth / 2 + this.offsetX)) {
                return i;
            }
        }
        return -1;
    }
}