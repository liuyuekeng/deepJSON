var errorMessage = [
    "",
    "parames error: ",
    "execute error: ",
    "warning: "
];

/**encode JSON obj
 * @param obj obj               input
 * @return obj {
 *           error: num,        0,1,2
 *           message/ret: str   
 *         }
 */
function encode (obj) {
    if (typeof obj !== "object") {
        return {
            error: 1,
            message: errorMessage[1] + "encode function expecting object"
        }
    }
    var str = JSON.stringify(obj);
    if (!str) {
        return {
            error: 2,
            message: errorMessage[2] + "JSON stringify failed"
        }
    } else {
        return {
            error: 0,
            ret: str
        }
    }
}

/**decode str to JSON obj
 * @param str str               input
 * @return obj {
 *           error: num,        0,1,2
 *           message/ret: obj
 *         }
 */
function decode (str) {
    if (typeof str === "function" || typeof str === "obj") {
        return {
            error: 1,
            message: errorMessage[1] + "decode function expection string, number, boolean",
        }
    }

    var obj;
    try {
        obj = JSON.parse(str);
    } catch (err) {
        return {
            error: 2,
            message: errorMessage[2] + err.message
        }
    }
    return {
        error: 0,
        ret: obj
    }
}

/**
 * get node name by path array
 * @param array path
 * @return str
 * root node`s name is 'global'
 */
function getTagName (path) {
    var len = path.length;
    var name = len ? path[len - 1] : "global";
    return name;
}

/**
 * set message
 * !!mast called by EncodeArea/DecodeArea
 */
function retHandler (ret) {
    if (ret.error){
        this.setState({
            message: ret.message
        });
    } else {
        this.setState({
            message: ""
        });
    }
}
var EncodeArea = React.createClass({
    getInitialState: function () {
        return {
            message: ""
        };
    },
    contentEdit: function () {
        var val = this.refs.editArea.getDOMNode().value;
        var ret = this.props.dataModify(this.props.path, val);
        retHandler.call(this, ret);
    },
    decode: function () {
        var str = this.props.data;
        var ret = decode(str);
        var obj;
        if (ret.error) {
            retHandler.call(this, ret);
            return;
        } else {
            obj = ret.ret;
        }
        ret = this.props.dataModify(this.props.path, obj);
        retHandler.call(this, ret);
    },
    del: function () {
        var ret = this.props.dataModify(this.props.path, 0, 'del');
        retHandler.call(this, ret);
    },
    
    render: function () {
        var tagName = getTagName(this.props.path);
        return (
        <div className="decode-area code-block">
            <NameTag
                data={tagName}
                path={this.props.path}
                dataModify={this.props.dataModify}
                parentObj={this}/>
            <div className="block-content">
                <textarea
                    ref="editArea"
                    className="edit-area"
                    onChange={this.contentEdit}
                    defaultValue={this.props.data}></textarea>
                <br />
                <a className="btn decode" onClick={this.decode}>decode</a>
                <a className="btn del" onClick={this.del}>delete</a>
                <Message className="message" message={this.state.message} />
            </div>
        </div>
        );
    }
});
var DecodeArea = React.createClass({
    getInitialState: function () {
        return {
            message: ""
        };
    },
    encode: function () {
        var obj = this.props.data;
        var ret = encode(obj);
        if (ret.error) {
            retHandler.call(this, ret);
            return;
        } else {
            str = ret.ret;
        }
        ret = this.props.dataModify(this.props.path, str);
        retHandler.call(this, ret);
    },
    del: function () {
        var ret = this.props.dataModify(this.props.path, 0, 'del');
        retHandler.call(this, ret);
    },
    render: function () {
        var data = this.props.data;
        var nodesData = [];
        var itemPath;
        var self = this;
        for (item in data) {
            if (data.hasOwnProperty(item)) {
                itemPath = this.props.path.slice(0);
                itemPath.push(item);
                nodesData.push({
                    data: data[item],
                    path: itemPath
                });
            }
        }
        var node = nodesData.map(function (nodeData) {
            return (
            <Node
                data={nodeData.data}
                path={nodeData.path}
                dataModify = {self.props.dataModify}/>
            );
        })
        var tagName = getTagName(this.props.path);
        return (
        <div className="encode-area code-block">
            <NameTag
                data={tagName}
                path={this.props.path}
                dataModify={this.props.dataModify}
                parentObj={this}/>
            <div className="block-content">
                {node}
                <a className="btn encode" onClick={this.encode}>encode</a>
                <AddNodeContol
                    dataModify={this.props.dataModify}
                    path={this.props.path}
                    parentObj={this}/>
                <a className="btn del" onClick={this.del}>delete</a>
                <Message className="message" message={this.state.message} />
            </div>
        </div>
        );
    }
});
var AddNodeContol = React.createClass({
    getInitialState: function () {
        return ({
            status: 0,        //0:init, 1:edit
            data: "new proterty"
        });
    },
    add: function () {
        if (this.state.status === 0) {
            this.show();
        }
    },
    cancel: function () {
        if (this.state.status === 1) {
            this.hide();
        }
    },
    confirm: function () {
        var ret = this.props.dataModify(this.props.path,
            this.state.data,
            'addNode');
        if (!ret.error) {
            this.hide();
        }
        retHandler.call(this.props.parentObj, ret);
    },
    onChange: function () {
        this.setState({
            data: this.refs.input.getDOMNode().value
        });
    },
    show: function () {
        this.setState({
            status: 1,
        });
    },
    hide: function () {
        this.setState({
            status: 0,
            data: ""
        });
    },
    render: function () {
        return (
        <span className="add-node-contol">
            <input
                ref="input"
                value={this.state.data}
                onChange={this.onChange}
                className={this.state.status ? 'show' : 'hide'}/>
            <a
                className={"btn cancel" + (this.state.status ? ' show' : ' hide')}
                ref="cancelBtn"
                onClick={this.cancel}>×</a>
            <a
                className={"btn confirm" + (this.state.status ? ' show' : ' hide')}
                ref="confirmBtn"
                onClick={this.confirm}>√</a>
            <a
                className={"btn add" + (this.state.status ? ' hide' : ' show')}
                ref="addBtn"
                onClick={this.add}>add node</a>
        </span>
        );
    }
});
var Message = React.createClass({
    render: function () {
        return (
        <div className="message">
            {this.props.message}
        </div>
        );
    }
});
var NameTag = React.createClass({
    modName: function (e) {
        var inputNode = this.refs.input.getDOMNode();
        var str = inputNode.value;
        var ret = this.props.dataModify(this.props.path, str, 'rename');
        if (ret.error) {
            inputNode.value = this.props.data;
        }
        retHandler.call(this.props.parentObj, ret);
    },
    render: function () {
        return (
        <div className="name-tag">
            <input
                ref="input"
                defaultValue={this.props.data}
                onBlur={this.modName}
                /> :
        </div>
        );
    }
});
var Node = React.createClass({
    render: function () {
        var node;
        var type = typeof this.props.data;
        if (type === "string" || type === "number" || type === "boolean") {
            node = (
                <EncodeArea
                    data={this.props.data}
                    path={this.props.path}
                    dataModify={this.props.dataModify}/>);
        } else if (typeof this.props.data === "object") {
            node = (
                <DecodeArea
                    data={this.props.data}
                    path={this.props.path}
                    dataModify={this.props.dataModify}/>);
        }
        return (
        <div>
            {node}
        </div>
        );
    }
});

var DataContent = React.createClass({
    getInitialState: function () {
        return {
            data: "{\"a\":\"str\", \"b\":{\"c\":123, \"d\":\"{\\\"e\\\": \\\"321\\\"}\"}}",
            path: [],
            message: {
                data: '',
                path: []
            }
        }
    },
    dataModify: function (path, val, option) {
        //option: mod, del, rename
        //default option: mod
        option = option ? option : "mod";
        var target = this.state.data;
        var len = path.length;
        var ret = {
            error: 0,
            message: ""
        };
        if (len === 0) {
            switch (option) {
                case "mod":
                    target = val;
                    break;
                case "del":
                    ret.error = 2
                    ret.message = errorMessage[2] + "can not delet root node"; 
                    return ret
                    break;
                case "rename":
                    ret.error = 2
                    ret.message = errorMessage[2] + "can not rename root node"; 
                    return ret
                    break;
                case "addNode":
                    //can not use existence name
                    console.log(target);
                    if (target.hasOwnProperty(val)) {
                        ret.error = 2,
                        ret.message = errorMessage[2] + "useing existence name";
                        return ret
                    }
                    target[val] = "";
                    break;
            }
            this.setState({
                data: target
            });
            ret.error = 0;
            ret.message = option + " success !"
            return ret;
        }
        for (var i = 0; i < len; i ++) {
            if (!target.hasOwnProperty(path[i])) {
                return false;
            }
            if (i === len - 1) {
                switch (option) {
                    case "mod":
                        target[path[i]] = val;
                        break;
                    case "del":
                        delete target[path[i]];
                        break;
                    case "rename":
                        //can not use existence name
                        if (target.hasOwnProperty(val)) {
                            ret.error = 2,
                            ret.message = errorMessage[2] + "useing existence name";
                            return ret;
                        }
                        target[val] = target[path[i]];
                        delete target[path[i]];
                        break;
                    case "addNode":
                        //can not use existence name
                        if (target[path[i]].hasOwnProperty(val)) {
                            ret.error = 2,
                            ret.message = errorMessage[2] + "useing existence name";
                            return ret
                        }
                        target[path[i]][val] = "";
                        break;
                }
                this.setState({
                    data: this.state.data
                });
                ret.error = 0;
                ret.message = option + " success !"
                return ret;
            }
            target = target[path[i]];
        }
    },
    render: function () {
        return (
            <Node
                data={this.state.data}
                path={this.state.path}
                dataModify = {this.dataModify}/>
        )
    }
});
React.render(
    <DataContent />,
    document.body
);
