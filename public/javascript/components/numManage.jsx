//团队管理
import React from 'react';
import { Card, Collapse, Button, Icon, Affix,  Popconfirm, message, Table } from 'antd';
import {Link} from 'react-router';
const Panel = Collapse.Panel;

class numManage extends React.Component{ 
    constructor(props) {
        super(props);        
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
            url: "/users/group/"+this.props.params.id,
            dataType: 'json',
            type: 'get',
            async: true,
            success: function(data) { 
                for (var i = data.result.members.length - 1; i >= 0; i--) {
                    data.result.members[i].copyuserId=data.result.members[i].userId;
                }
                this.setState({numList:data.result.members,grant:data.result.grant});                                                                                                         
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }
    expelGroupYes(provider,user_id) {        
        $.ajax({            
            url: "/users/group/"+this.state.id+"/deletemember",
            dataType: 'json',
            type: 'POST',
            data:{provider:provider,user_id:user_id},
            success: function(data) {                
                this.componentDidMount();
                this.setState({numList:this.state.numList});
                this.succesMessage();
            }.bind(this),
            error: function(xhr, status, err) {                
                console.log(this.props.url, status, err.toString());
                this.errorMessage();
            }.bind(this)
        });
    }
    powerGroupYes(provider,user_id) {
        $.ajax({
            url: "/users/group/"+id+"/authorize",
            dataType: 'json',
            type: 'POST',
            data:{provider:provider,user_id:user_id},
            success: function(data) {                
                this.componentDidMount();
                this.setState({numList:this.state.numList});
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
        const columnsall = [
            {title: '姓名',dataIndex: 'user_name'}, 
            {title: '类型',dataIndex: 'provider'},         
            {
                title: '授权',
                dataIndex: 'copyuserId',
                render: (copyuserId) => <Popconfirm title="确定要给这个团员授权吗？" onConfirm={this.powerGroupYes.bind({copyuserId})} onCancel={this.cancel.bind(this)}><Button type="primary">{'删除'}</Button></Popconfirm>,
            },
            {
                title: '开除',
                dataIndex: 'userId',
                render: (userId) => <Popconfirm title="确定要开除这个团员吗？" onConfirm={this.expelGroupYes.bind({userId})} onCancel={this.cancel.bind(this)}><Button type="primary">{'授权'}</Button></Popconfirm>,
            }
        ];
        const columns = [
            {title: '姓名',dataIndex: 'user_name'}, 
            {title: '类型',dataIndex: 'provider'}                    
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
