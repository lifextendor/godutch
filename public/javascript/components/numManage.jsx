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
        this.state={id:this.props.params.id,myList:[]};
    }
    succesMessage() {
      return notification['success']({
          message: '成功',
          description: '操作成功！',
        });
    }
    errorMessage() {
      return notification['error']({
          message: '失败',
          description: '操作失败！',
        });
    }
    infoMessage() {
      return notification['info']({
          message: '提示',
          description: '取消失败！',
        });
    } 
    componentDidMount(){
        $.ajax({
            url: "/users/group/"+this.props.params.id,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                debugger
                for (var i = data.result.length - 1; i >= 0; i--) {
                    var date = new Date(data.result[i].createTime);
                    data.result[i].createTime=date.getFullYear()+"年"+date.getMonth()+"月"+date.getDate()+"日";
                }
                this.setState({teamlist:data.result});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    componentWillUnmount() {
        // this.serverRequest.abort();
    }
    expelGroupYes(id) {
        $.ajax({
            url: "/users/group/"+id+"/deletemember",
            dataType: 'json',
            type: 'POST',
            member:{provider:'qq',user_id:1}
            success: function(data) {
                this.componentDidMount();
                this.setState({teamlist:this.state.teamlist});
                this.succesMessage();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
        });
    }
    powerGroupYes(id) {
        $.ajax({
            url: "/users/group/"+id+"/authorize",
            dataType: 'json',
            type: 'POST',
            member:{provider:'qq',user_id:1}
            success: function(data) {
                this.componentDidMount();
                this.setState({teamlist:this.state.teamlist});
                this.succesMessage();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
        });        
    }
    cancel() {
        this.infoMessage();  
    }    
    render(){
        return  <div style={{ background: '#ECECEC'}}>                    
                    <Card className="main-panel" title="团队" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                            <Card title="团员列表">
                                <Collapse accordion>
                                 {this.state.myList.map(function(list, i) {
                                return (
                                    <Panel header={list.name} key={i}>
                                        <p>2016年7月1日加团</p>
                                        <p>简介：啦啦啦</p>
                                        <div className={this.props.params.power}>
                                        <Popconfirm title="确定要开除这个团员吗？" onConfirm={this.expelGroupYes.bind(this)} onCancel={this.cancel.bind(this)}>
                                            <Button className="tool-button"  type="primary">开除</Button>
                                        </Popconfirm>                                        
                                        &nbsp;
                                        <Popconfirm title="确定要给这个团员授权吗？" onConfirm={this.powerGroupYes.bind(this)} onCancel={this.cancel.bind(this)}>
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
// numManage.defaultProps={myList:myList};//设置默认属性
export default numManage;
