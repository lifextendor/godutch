//团队管理
import React from 'react';
import { Card, Collapse, Button, Icon, Affix,  Popconfirm, message, Table, notification } from 'antd';
import {Link} from 'react-router';
const Panel = Collapse.Panel;
notification.config({
      top: 60,
      duration: 3,
    }) 
var GRANT = {
    CAPTAIN:'团长',   
    VICECAPTAIN:'副团长',
    TEAMMEMBER:'团员'
};
var that='';

class numManage extends React.Component{ 
    constructor(props) {
        super(props);  
        that=this;     
        this.state={id:this.props.params.id,numList:[],columns:[],grant:''};
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
            url: "/users/group/"+this.state.id,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) { 
                for (var i = data.result.members.length - 1; i >= 0; i--) {
                    data.result.members[i].copyuserId=data.result.members[i].userId;
                    data.result.members[i].power=GRANT[data.result.members[i].grant];
                }
                this.setState({numList:data.result.members,grant:data.result.grant});                                                                                                         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    expelGroupYes(user_id,provider) {     
    debugger   
        $.ajax({            
            url: "/users/group/"+that.state.id+"/deletemember",
            dataType: 'json',
            type: 'POST',
            data:{provider:provider,user_id:user_id},
            success: function(data) {                
                that.componentDidMount();
                that.setState({numList:that.state.numList});
                that.succesMessage();
            }.bind(that),
            error: function(xhr, status, err) {                
                console.log(that.props.url, status, err.toString());
                this.errorMessage();
            }.bind(that)
        });
    }
    powerGroupYes(user_id,provider) {
        debugger
        $.ajax({
            url: "/users/group/"+that.state.id+"/authorize",
            dataType: 'json',
            type: 'PUT',
            data:{provider:provider,user_id:user_id},
            success: function(data) {                
                that.componentDidMount();
                that.setState({numList:that.state.numList});
                that.succesMessage();
            }.bind(that),
            error: function(xhr, status, err) {
                console.log(that.props.url, status, err.toString());
                that.errorMessage();
            }.bind(that)
        });        
    }
    cancel() {
        that.infoMessage();  
    }    
    render(){        
        const columnsall = [
            {title: '姓名',dataIndex: 'user_name'}, 
            {title: '类型',dataIndex: 'power'},       
            {
                title: '授权',
                dataIndex: 'copyuserId',
                render: (copyuserId) => {
                    var isuser=false;
                    var provider='';
                    for (var i = this.state.numList.length - 1; i >= 0; i--) {
                        if(this.state.numList[i].userId==copyuserId){
                            provider=this.state.numList[i].provider;
                            if (this.state.numList[i].grant=="CAPTAIN") {                                
                                isuser=true;
                                break;
                            }                        
                        }
                    }
                    if (isuser) {
                        return;
                    }else{
                        return  <Popconfirm title="确定要给这个团员授权吗？" onConfirm={this.powerGroupYes.bind(this,copyuserId,provider)} onCancel={this.cancel.bind(this)}>
                                <Button type="primary">{'授权'}</Button>
                                </Popconfirm>
                    }    
                }
            },
            {
                title: '开除',
                dataIndex: 'userId',
                render: (userId) => {
                    var isuser=false;
                    var provider='';
                    for (var i = this.state.numList.length - 1; i >= 0; i--) {
                        if(this.state.numList[i].userId==userId){
                            provider=this.state.numList[i].provider;
                            if (this.state.numList[i].grant=="CAPTAIN") {                                
                                isuser=true;
                                break;
                            }                        
                        }
                    }
                    if (isuser) {
                        return;
                    }else{
                        return  <Popconfirm title="确定要开除这个团员吗？" onConfirm={this.expelGroupYes.bind(this,userId,provider)} onCancel={this.cancel.bind(this)}>
                                <Button type="primary">{'开除'}</Button>
                                </Popconfirm>
                    }   
                }
            }
        ];
        const columns = [
            {title: '姓名',dataIndex: 'user_name'}, 
            {title: '类型',dataIndex: 'power'}                    
        ];
        this.state.columns=columns;
        if (this.state.grant==='CAPTAIN') {
            this.state.columns=columnsall;
        }else{
            this.state.columns=columns;
        } 
        return  <div style={{ background: '#ECECEC'}}>                    
                    <Card className="main-panel" title="团队" bordered={false}>
                        <div className="col-md-offset-2 col-sm-offset-1 col-md-8 col-sm-10">
                            <Card title="团员列表">
                                <Table columns={this.state.columns} dataSource={this.state.numList} bordered />                               
                            </Card>
                        </div>                                            
                    </Card>
                </div>
    }
}
export default numManage;
