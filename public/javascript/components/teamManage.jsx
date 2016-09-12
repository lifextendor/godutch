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
        this.state={username: this.props.params.username,teamlist:teamlist}; 
    }
    succesMessage() {
      return notification['success']({
          message: '成功',
          description: '操作成功！',
        });
    }
    failMessage() {
      return notification['error']({
          message: '失败',
          description: '操作失败！',
        });
    } 
    componentWillMount(){
        $.ajax({
            url: "/users/groups",
            dataType: 'json',
            type: 'get',
            async: false,
            success: function(data) {
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
        debugger
        $.ajax({
            url: "/users/group/"+id+"/dropgroup",
            dataType: 'json',
            type: 'POST',
            success: function(data) {
                debugger
                // this.setState({data: data});
                this.succesMessage();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(this.props.url, status, err.toString());
                this.failMessage();
            }.bind(this)
        });
        
    }
    exitGroupNo(e) {
      
    }    
    render(){        
        var permissions=[];         
        {this.state.teamlist.map(function(list, i) {
            permissions[i]=list.grant?"hidden":"ok";
        }, this)}
        return  <div style={{ background: '#ECECEC'}}>                    
                    <Card className="main-panel" title="团队" bordered={false}>                        
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                        <Card title="团组列表">
                            <Collapse accordion>
                             {this.state.teamlist.map(function(list, i) {
                            return (
                                <Panel header={list.groupName} key={i}>
                                    <p>创于2016年7月1日</p>
                                    <p>简介：啦啦啦</p>
                                    <Popconfirm title="确定要退出这个团吗？" onConfirm={this.exitGroupYes.bind(this,list.id)} onCancel={this.exitGroupNo.bind(this)}>
                                    <Button className="tool-button" type="primary" >退团</Button>
                                    </Popconfirm>
                                    <div className={permissions[i]} style={{display: 'inline'}}>
                                    &nbsp;
                                    <Popconfirm title="确定要退出解散这个团吗？" onConfirm={this.exitGroupYes.bind(this)} onCancel={this.exitGroupYes.bind(this)}>
                                    <Button className="tool-button" type="primary">解散团</Button>
                                    </Popconfirm>
                                    </div>
                                    &nbsp;                                    
                                    <Button className="tool-button" type="primary"><Link to={'numManage/'+i+'/'+permissions[i]}>查看团员</Link></Button>
                                     &nbsp;                                    
                                    <Button className="tool-button" type="primary"><Link to={'numManage/'+i+'/'+permissions[i]}>邀请团成员</Link></Button>                                  
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
teamManage.defaultProps={teamlist:teamManage};//设置默认属性
export default teamManage;
