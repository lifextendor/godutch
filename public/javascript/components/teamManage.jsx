//团队管理
import React from 'react';
import { Card, Collapse, Button, message, Popconfirm, notification, Modal } from 'antd';
import {Link} from 'react-router';
const Panel = Collapse.Panel;
notification.config({
      top: 60,
      duration: 3,
    }) 

class teamManage extends React.Component{ 
    constructor(props) {
        super(props);
        this.state={teamlist:[],modalvisible: false}; 
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
                this.setState({teamlist:data.result});         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
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
    cancel() {
        this.infoMessage();  
    }    
    render(){        
        var boss=[];
        var number=[];
        var fund=[];
        var type=[];          
        {this.state.teamlist.map(function(list, i) {
            if (list.grant==="CAPTAIN") {
                boss[i]="ok";
                number[i]="hidden";
            }else{
                boss[i]="hidden";
                number[i]="ok";
            }
            if (list.type==="fund") {
                fund[i]="hidden";
            }else{
                fund[i]="ok";                
            }
            if (list.grant==="CAPTAIN") {
                type[i]=list.type;
            }else{
                if (list.type==="fund") {
                    type[i]=list.type;
                }else{
                    type[i]="table";
                }             
            }
            
        }, this)}
        var buttonStyle={margin: "2px 5px 2px 0px"};
        return  <div style={{ background: '#ECECEC'}}>                    
                    <Card className="main-panel" title="团队" bordered={false}>                        
                        <div className="col-md-offset-2 col-sm-offset-0 col-md-8 col-sm-12">
                        <Card title="团组列表">
                            <Collapse defaultActiveKey={['0']} accordion>
                             {this.state.teamlist.map(function(list, i) {
                            return (
                                <Panel header={list.groupName} key={i}>                                    
                                    <p>创于:{list.createTime}</p>
                                    <p>简介:{list.description}</p>
                                    <div className={number[i]} style={{display: 'inline'}}>
                                    <Popconfirm title="确定要退出这个团吗？" onConfirm={this.exitGroupYes.bind(this, list.id)} onCancel={this.cancel.bind(this)}>
                                    <Button className="" type="primary" style={buttonStyle}>退 团</Button>
                                    </Popconfirm>
                                    </div>
                                    <div className={boss[i]} style={{display: 'inline'}}>
                                    &nbsp;
                                    <Popconfirm title="确定要解散这个团吗？" onConfirm={this.dissolutionGroupYes.bind(this, list.id)} onCancel={this.cancel.bind(this)}>
                                    <Button type="primary" style={buttonStyle}>解 散</Button>                                    
                                    </Popconfirm>                                    
                                    </div>
                                    &nbsp;
                                    <Button type="primary" style={buttonStyle}><Link to={type[i] +'/'+list.id}>{boss[i]=='ok'?'记 账':'账 本'}</Link></Button>
                                    &nbsp;                                    
                                    <Button className={fund[i]} type="primary" style={{margin: "2px 5px 2px 3px"}}><Link to={'numManage/'+list.id}>团 员</Link></Button>
                                    &nbsp;                                    
                                    <Button className={fund[i]} type="primary" style={buttonStyle}><Link to={'invitation/'+list.id}>邀 请</Link></Button>                                  
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
