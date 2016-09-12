//团队管理
import React from 'react';
import { Card, Collapse, Button, message, Popconfirm, notification } from 'antd';
import {Link} from 'react-router';
import $ from 'jquery';
import '../stylesheets/teamManage.scss'
const Panel = Collapse.Panel;
notification.config({
      top: 60,
      duration: 3,
    }) 

var teamlist=[
        {grant:"no",groupName:"还没有团组"}
    ]; 

class teamManage extends React.Component{ 
    constructor(props) {
        super(props);
        this.state={username: this.props.params.username}; 
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
    componentWillMount(){
        $.ajax({
            url: "/users/groups",
            dataType: 'json',
            type: 'get',
            async: false,
            success: function(data) {
                for (var i = data.result.length - 1; i >= 0; i--) {
                    var date = new Date(data.result[i].createTime);
                    data.result[i].createTime=date.getFullYear()+"年"+date.getMonth()+"月"+date.getDate()+"日";
                }
                this.state=({teamlist:data.result});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    componentWillUnmount() {
        this.serverRequest.abort();
    }
    deleteGroup(e) {
        
    }
    exitGroup(e) {
      
    }
    exitGroupYes(id) {
        $.ajax({
            url: "/users/group/"+id+"/dropgroup",
            dataType: 'json',
            type: 'POST',
            success: function(data) {
                // this.setState({data: data});
                debugger
                this.componentWillMount();
                this.setState({teamlist:this.state.teamlist});
                this.succesMessage();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
        });
        
    }
    exitGroupNo(e) {
      
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
            debugger
            // permissions[i]=list.grant?"ok":"hidden";
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
                                    <Popconfirm title="确定要退出这个团吗？" onConfirm={this.exitGroupYes.bind(this,list.id)} onCancel={this.exitGroupNo.bind(this)}>
                                    <Button className="tool-button" type="primary" >退团</Button>
                                    </Popconfirm>
                                    </div>
                                    <div className={boss[i]} style={{display: 'inline'}}>
                                    &nbsp;
                                    <Popconfirm title="确定要解散这个团吗？" onConfirm={this.exitGroupYes.bind(this)} onCancel={this.exitGroupYes.bind(this)}>
                                    <Button className="tool-button" type="primary">解散团</Button>
                                    </Popconfirm>
                                    </div>
                                    &nbsp;                                    
                                    <Button className="tool-button" type="primary"><Link to="numManage">查看团员</Link></Button>
                                     &nbsp;                                    
                                    <Button className="tool-button" type="primary"><Link to="numManage">邀请团成员</Link></Button>                                  
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
