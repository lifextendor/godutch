//团队管理
import React from 'react';
import { Card, Collapse, Button, Icon, Affix,  Popconfirm, message } from 'antd';
import {Link} from 'react-router';
const Panel = Collapse.Panel;

var myList=[
    {name:"张三",power:"团长"}, 
    {name:"张三",power:"团长"},
    {name:"张三",power:"团员"}
    ];

class numManage extends React.Component{ 
    constructor(props) {
        super(props);
        this.setState={username:this.props.params.username}
        // alert(this.props.params.id);
        // alert(this.props.params.power);
    }
    lookNum(e){
        this.setState({layout:layout2,shownum:true});
    }
    confirm(e) {
        message.info('点击了确定');
    }
    cancel(e) {
        message.error('点击了取消');
    }
    // handleCommentSubmit: function(comment) {
    //     alert("确认提交");
    //     $.ajax({
    //         url: this.props.url,
    //         dataType: 'json',
    //         type: 'POST',
    //         data: comment,
    //         success: function(data) {
    //             this.setState({data: data});
    //         }.bind(this),
    //         error: function(xhr, status, err) {
    //             this.setState({data: comments});
    //             console.error(this.props.url, status, err.toString());
    //         }.bind(this)
    //     });
    // }
    render(){
        return  <div style={{ background: '#ECECEC'}}>                    
                    <Card className="main-panel" title="团队" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                            <Card title="团员列表">
                                <Collapse accordion>
                                 {this.props.myList.map(function(list, i) {
                                return (
                                    <Panel header={list.name} key={i}>
                                        <p>2016年7月1日加团</p>
                                        <p>简介：啦啦啦</p>
                                        <div className={this.props.params.power}>
                                        <Popconfirm title="确定要开除这个团员吗？" onConfirm={this.confirm.bind(this)} onCancel={this.cancel.bind(this)}>
                                            <Button className="tool-button"  type="primary">开除</Button>
                                        </Popconfirm>                                        
                                        &nbsp;
                                        <Popconfirm title="确定要给这个团员授权吗？" onConfirm={this.confirm.bind(this)} onCancel={this.cancel.bind(this)}>
                                        <Button className="tool-button" type="primary">授权</Button> 
                                        </Popconfirm>
                                        </div>                           
                                    </Panel>
                                    );
                                }, this)} 
                                </Collapse>                                
                            </Card>
                        </div>                                            
                    </Card>
                </div>
    }
}
numManage.defaultProps={myList:myList};//设置默认属性
export default numManage;
