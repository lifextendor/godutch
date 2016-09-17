//团队管理
import React from 'react';
import { Card, Collapse, Button, message, Popconfirm, notification, Modal } from 'antd';
import {Link} from 'react-router';
import $ from 'jquery';
import '../stylesheets/teamManage.scss'
const Panel = Collapse.Panel;
notification.config({
      top: 60,
      duration: 3,
    }) 

class teamManage extends React.Component{ 
    constructor(props) {
        super(props);
        this.state={username: this.props.params.username,teamlist:[],modalvisible: false}; 
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
          description: '取消操作！',
        });
    } 
    componentDidMount(){
        $.ajax({
            url: "/users/groups",
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) {
                for (var i = data.result.length - 1; i >= 0; i--) {
                    var date = new Date(data.result[i].createTime);
                    data.result[i].createTime=date.getFullYear()+"年"+date.getMonth()+"月"+date.getDate()+"日";
                }
                // this.state=({teamlist:data.result});
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
    dissolutionGroupYes(id) {
        $.ajax({
            url: "/users/group/"+id+"/dropgroup",
            dataType: 'json',
            type: 'POST',
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
    exitGroupYes(id) {
        $.ajax({
            url: "/users/group/"+id+"/leave",
            dataType: 'json',
            type: 'POST',
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
    showModal(){
        this.setState({modalvisible:true});
    }
    invitation(){

    }
    cancel() {
        this.infoMessage();  
    }    
    render(){        
        var boss=[];
        var number=[];          
        {this.state.teamlist.map(function(list, i) {
            if (list.grant==="CAPTAIN") {
                boss[i]="ok";
                number[i]="hidden";
            }else{
                boss[i]="hidden";
                number[i]="ok";
            }
        }, this)}
        return  <div style={{ background: '#ECECEC'}}>                    
                    <Card className="main-panel" title="团队" bordered={false}>                        
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                        <Card title="团组列表">
                            <Collapse accordion>
                             {this.state.teamlist.map(function(list, i) {
                            return (
                                <Panel header={list.groupName} key={i}>                                    
                                    <p>创于:{list.createTime}</p>
                                    <p>简介:{list.description}</p>
                                    <div className={number[i]} style={{display: 'inline'}}>
                                    <Popconfirm title="确定要退出这个团吗？" onConfirm={this.exitGroupYes.bind(this, list.id)} onCancel={this.cancel.bind(this)}>
                                    <Button className="tool-button" type="primary" >退团</Button>
                                    </Popconfirm>
                                    </div>
                                    <div className={boss[i]} style={{display: 'inline'}}>
                                    &nbsp;
                                    <Popconfirm title="确定要解散这个团吗？" onConfirm={this.dissolutionGroupYes.bind(this, list.id)} onCancel={this.cancel.bind(this)}>
                                    <Button className="tool-button" type="primary">解散团</Button>
                                    </Popconfirm>
                                    </div>
                                    &nbsp;                                    
                                    <Button className="tool-button" type="primary"><Link to={'numManage/'+list.id}>查看团员</Link></Button>
                                    &nbsp;                                    
                                    <Button className="tool-button" type="primary"><Link to={'invitation/'+list.id}>邀请团成员</Link></Button>                                  
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
// teamManage.defaultProps={teamlist:teamManage};//设置默认属性
export default teamManage;
